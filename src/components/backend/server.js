const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json()); // Parses JSON data
app.use(bodyParser.urlencoded({ extended: true }));


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const apiKey = process.env.HUGGINGFACE_API_KEY;

<<<<<<< HEAD
mongoose.connect('mongodb://localhost:27017/hack-well')
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("Database connected");
})
=======
    mongoose.connect("mongodb://localhost:27017/hack-well")  // ✅ No need for extra options
.then(() => console.log("✅ Database connected"))
.catch(err => console.log("❌ Database connection error:", err));
>>>>>>> 042377a (integrated)

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    skills: [{ type: String }],
    shift: { type: String, enum: ["Day", "Night"], required: true },
    availability: { type: Boolean, default: true },
    assignedTaskCount: { type: Number, default: 0 } // Tracks assigned tasks
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

const AdminSchema = new mongoose.Schema({
    email:String,
    password:String
});
const Admin = mongoose.model("Admin",AdminSchema);

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    shiftRequired: { type: String, enum: ["Day", "Night"], required: true },
    skillsRequired: [{ type: String }],
    allocatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    priority: { type: String, enum: ["High", "Medium", "Low"], required: true }, // AI-determined priority,
    status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" }, // Track task status

}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

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


app.post("/tasks", async (req, res) => {
    try {
        const { title, description,shiftRequired } = req.body;
        const skills = ["Web Development", "Machine Learning", "Cybersecurity", "Database Management"];
        const priorityLabels = ["High", "Medium", "Low"];

        // Step 1: Get the best skill for the task
        const skillResponse = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
            { inputs: description, parameters: { candidate_labels: skills } },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        const bestSkill = skillResponse.data.labels[0];
        console.log(bestSkill);

        // Step 2: Assign priority dynamically
        const priorityResponse = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
            { inputs: description, parameters: { candidate_labels: priorityLabels } },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        // const labels = priorityResponse.data.labels;
        // const scores = priorityResponse.data.scores;
        // console.log(scores);
        // const priorityMapping = {};
        // labels.forEach((label, index) => {
        //     priorityMapping[label] = scores[index];
        // });

        const highScore = priorityResponse.data.scores[priorityResponse.data.labels.indexOf("High")];

        // Define thresholds dynamically based on score distribution
        // const highThreshold = 0.5;  // Adjust if necessary
        // const mediumThreshold = 0.3;

        let priority;
        if (highScore >= 0.50) priority = "High";
        else if (highScore >= 0.45) priority = "Medium";
        else priority = "Low";

        console.log(`Task Priority: ${priority}`);

        // Step 3: Find a user with the best skill who has the least workload
        const assignedUser = await User.findOne({ skills: bestSkill })
            .sort({ assignedTaskCount: 1 }) // Sort users by least assigned tasks
            .where("assignedTaskCount").lt(3); // Only consider users with less than 3 active tasks

        if (!assignedUser) {
            return res.status(404).json({ error: "No user found with matching skill" });
        }

        // Step 4: Save task to DB
        const newTask = new Task({
            title,
            description,
            skillsRequired: bestSkill,
            allocatedUser: assignedUser._id,
            priority,
            shiftRequired // Assigning priority dynamically
        });

        await newTask.save();

        // Step 5: Increase the assigned task count for the user
        assignedUser.assignedTaskCount += 1;
        assignedUser.shift = shiftRequired;
        await assignedUser.save();

        res.status(201).json({ message: "Task assigned successfully", task: newTask });
    } catch (error) {
        res.status(500).json({ error: "Failed to assign task" });
        console.error("Task Assignment Error:", error);
    }
});

app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find().populate("allocatedUser");
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate("allocatedUser");
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/tasks/:id", async (req, res) => {
    try {
        const { title, description, shiftRequired, allocatedUser } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, shiftRequired, allocatedUser },
            { new: true, runValidators: true }
        );
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


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

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
