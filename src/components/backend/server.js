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

mongoose.connect('mongodb://localhost:27017/hack-well', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Database connected"))
    .catch((error) => console.error("❌ Database connection error:", error));

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

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    shiftRequired: { type: String, enum: ["Day", "Night"], required: true },
    skillsRequired: [{ type: String }],
    allocatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/tasks", async (req, res) => {
    try {
        const { title, description, shiftRequired } = req.body;
        const skills = ["Machine Learning", "Cybersecurity", "Database Management", "Node.js", "React"];

        const response = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
            { inputs: description, parameters: { candidate_labels: skills } },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        console.log(response.data);
        let bestSkill = response.data.labels[0];

        let assignedUser = await User.findOne({ 
            skills: bestSkill, 
            shift: shiftRequired, 
            availability: true 
        })
        .sort("assignedTaskCount") 
        .where("assignedTaskCount").lt(1); // Allow up to 3 tasks

        if (!assignedUser && response.data.labels[1]) {
            bestSkill = response.data.labels[1];
            assignedUser = await User.findOne({ 
                skills: bestSkill, 
                shift: shiftRequired, 
                availability: true 
            })
            .sort("assignedTaskCount") 
            .where("assignedTaskCount").lt(1);
        }

        if (!assignedUser) return res.status(404).json({ error: "No available user found with matching skill and shift" });

        const newTask = new Task({ title, description, shiftRequired, skillsRequired: [bestSkill], allocatedUser: assignedUser._id });
        await newTask.save();

        // Step 5: Increase the assigned task count for the user
        assignedUser.assignedTaskCount += 1;
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
        const { name, email, password, skills, shift } = req.body;
        console.log(req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword, skills, shift });
        await user.save();

        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
