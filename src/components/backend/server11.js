const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const apiKey = process.env.HUGGINGFACE_API_KEY;

mongoose.connect("mongodb://localhost:27017/hack-well", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        skills: [{ type: String }],
        shift: { type: String, enum: ["Day", "Night"], required: true },
        availability: { type: Boolean, default: true },
        assignedTaskCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        shiftRequired: { type: String, enum: ["Day", "Night"], required: true },
        skillsRequired: [{ type: String }],
        allocatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        priority: { type: String, enum: ["High", "Medium", "Low"], required: true },
    },
    { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

const AdminSchema = new mongoose.Schema({
    email:String,
    password:String
});
const Admin = mongoose.model("Admin",AdminSchema);

const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied. No token provided. " });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    };
}


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await Admin.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password); // ✅ Added `await`
        // console.log(user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        // Generate JWT Token
        const token = jwt.sign({ userId: user.email }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Registration
app.post("/users", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);

        const existingUser = await Admin.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new Admin({ email, password: hashedPassword});
        await user.save();

        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get("/dashboard", authenticateUser, (req, res) => {
    res.json({ message: "Welcome to the dashboard!" });
});

// Create Task (without allocation)
app.post("/tasks", async (req, res) => {
    try {
        const { title, description, shiftRequired } = req.body;
        const priorityLabels = ["High", "Medium", "Low"]; // Define labels

        const priorityResponse = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
            { inputs: description, parameters: { candidate_labels: priorityLabels } },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        const highScore = priorityResponse.data.scores[priorityResponse.data.labels.indexOf("High")];
        let priority;
        if (highScore >= 0.50) priority = "High";
        else if (highScore >= 0.45) priority = "Medium";
        else priority = "Low";

        console.log(`Task Priority: ${priority}`);

        const newTask = new Task({ title, description, shiftRequired, skillsRequired: [], priority });
        await newTask.save();
        res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error) {
        res.status(500).json({ error: "Failed to create task" });
    }
});

// Allocate Task (when admin clicks button)
app.put("/tasks/allocate/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ error: "Task not found" });

        const skills = [
            "Web Development",
            "Cybersecurity",
            "Software Development & Programming",
            "Machine Learning & AI",
            "Cloud & DevOps",
            "Blockchain Technology",
            "Data Science",
            "Database Management",
            "Mobile App Development",
            
          ];
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
            { inputs: task.description, parameters: { candidate_labels: skills } },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        console.log(response.data);
        
        let bestSkill = response.data.labels[0];
        let assignedUser = await User.findOne({ skills: bestSkill, shift: task.shiftRequired, availability: true })
            .sort("assignedTaskCount")
            .where("assignedTaskCount").lt(1);

        if (!assignedUser && response.data.labels[1]) {
            bestSkill = response.data.labels[1];
            assignedUser = await User.findOne({ skills: bestSkill, shift: task.shiftRequired, availability: true })
                .sort("assignedTaskCount")
                .where("assignedTaskCount").lt(1);
        }

        if (!assignedUser) return res.status(404).json({ error: "No available user found" });

        task.allocatedUser = assignedUser._id;
        task.skillsRequired = [bestSkill];
        await task.save();

        assignedUser.assignedTaskCount += 1;
        await assignedUser.save();

        res.status(200).json({ message: "Task allocated successfully", task });
    } catch (error) {
        res.status(500).json({ error: "Failed to allocate task" });
    }
});

// Fetch all tasks
app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find().populate("allocatedUser");
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/client",async(req,res)=>
{
    const Clients = await User.countDocuments({ assignedTaskCount: 1 });
    const totalClients  = await User.countDocuments();
    const totalTask = await Task.countDocuments();
    const completedTask = await Task.countDocuments({status:"Completed"});
    const pendingTask = await Task.countDocuments({status:"Pending"});
    const ongoingTask = await Task.countDocuments({status:"Ongoing"});
    // console.log("Total Clients:", totalClients);
    
    res.status(200).json({
        Clients,
        totalClients,
        completedTask,
        pendingTask,
        ongoingTask,
        totalTask
    });

})

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
