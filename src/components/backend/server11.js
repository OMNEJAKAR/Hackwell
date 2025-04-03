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

// const userSchema = new mongoose.Schema(
//     {
//         name: { type: String, required: true },
//         email: { type: String, required: true, unique: true },
//         password: { type: String, required: true },
//         skills: [{ type: String }],
//         shift: { type: String, enum: ["Day", "Night"], required: true },
//         availability: { type: Boolean, default: true },
//         assignedTaskCount: { type: Number, default: 0 },
//     },
//     { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);

// const taskSchema = new mongoose.Schema(
//     {
//         title: { type: String, required: true },
//         description: { type: String, required: true },
//         shiftRequired: { type: String, enum: ["Day", "Night"], required: true },
//         skillsRequired: [{ type: String }],
//         allocatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
//         priority: { type: String, enum: ["High", "Medium", "Low"], required: true },
//     },
//     { timestamps: true }
// );

// const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        skills: [{ type: String }], // List of skills
        shift: { type: String, enum: ["Day", "Night"], required: true },
        availability: { type: Boolean, default: true },
        assignedTaskCount: { type: Number, default: 0 }, // Tracks active tasks
        completedTasks: { type: Number, default: 0 }, // Tracks total completed tasks
        averageCompletionTime: { type: Number, default: 0 }, // Time taken to complete tasks (in hours)
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        shiftRequired: { type: String, enum: ["Day", "Night"], required: true },
        skillsRequired: [{ type: String }], // Skills needed for the task
        allocatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        priority: { type: String, enum: ["High", "Medium", "Low"], required: true },
        // priorityScore: { type: Number, default: null }, // AI-determined priority confidence score
        status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
        assignedAt: { type: Date, default: null }, // ✅ Add assignedAt field
        completedAt: { type: Date, default: null }, // ✅ Ensure completedAt is included // Task state
        completionTime: { type: Number, default: null }, // Time taken to complete (in hours)
    },
    { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);


// const Task = mongoose.model("Task", taskSchema);

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
// app.put("/tasks/allocate/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         console.log(id);
//         const task = await Task.findById(id);
//         if (!task) return res.status(404).json({ error: "Task not found" });

//         const skills = ["Machine Learning", "Cybersecurity", "Database Management", "Node.js", "React", "Java"];
//         const response = await axios.post(
//             "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
//             { inputs: task.description, parameters: { candidate_labels: skills } },
//             { headers: { Authorization: `Bearer ${apiKey}` } }
//         );

//         console.log(response.data);
//         let bestSkill = response.data.labels[0];
//         let assignedUser = await User.findOne({ skills: bestSkill, shift: task.shiftRequired, availability: true })
//             .sort("assignedTaskCount")
//             .where("assignedTaskCount").lt(1);

//         if (!assignedUser && response.data.labels[1]) {
//             bestSkill = response.data.labels[1];
//             assignedUser = await User.findOne({ skills: bestSkill, shift: task.shiftRequired, availability: true })
//                 .sort("assignedTaskCount")
//                 .where("assignedTaskCount").lt(1);
//         }

//         if (!assignedUser) return res.status(404).json({ error: "No available user found" });

//         task.allocatedUser = assignedUser._id;
//         task.skillsRequired = [bestSkill];
//         await task.save();

//         assignedUser.assignedTaskCount += 1;
//         await assignedUser.save();

//         res.status(200).json({ message: "Task allocated successfully", task });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to allocate task" });
//     }
// });

app.put("/tasks/allocate/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Allocating Task ID: ${id}`);
        
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

        // Step 2: Fetch users with matching skills and availability
        const candidates = await User.find({
            skills: { $in: task.skillsRequired },
            shift: task.shiftRequired,
            availability: true,
            assignedTaskCount: { $lt: 1 }
        });

        if (candidates.length === 0) return res.status(404).json({ error: "No suitable user found" });

        // Step 3: Rank candidates using AI-based scoring
        const bestUser = candidates
            .map(user => {
                const experienceFactor = user.completedTasks || 0; // More completed tasks = More experienced
                const efficiencyFactor = user.averageCompletionTime > 0 ? 1 / user.averageCompletionTime : 1; // Faster users get higher weight

                // Weighted formula: Prioritizing skill match > experience > efficiency
                const score = (experienceFactor * 2) + (efficiencyFactor * 1.5);
                
                return { user, score };
            })
            .sort((a, b) => b.score - a.score) // Sort by highest score
            .map(entry => entry.user)[0]; // Select best user

        // Step 4: Allocate the task
        task.allocatedUser = bestUser._id;
        task.assignedAt = new Date();
        await task.save();

        // Step 5: Update user workload
        bestUser.assignedTaskCount += 1;
        await bestUser.save();

        console.log(`Task assigned to ${bestUser.name} (Skill: ${task.skillsRequired})`);

        // ✅ Step 6: Populate allocatedUser details before sending response
        const updatedTask = await Task.findById(task._id).populate("allocatedUser", "name email");

        res.status(200).json({ message: "Task allocated successfully", task: updatedTask });
    } catch (error) {
        console.error("Task Allocation Error:", error);
        res.status(500).json({ error: "Failed to allocate task" });
    }
});


app.delete("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete task" });
    }
});

app.put("/users/decrement/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Ensure assignedTaskCount does not go below 0
        if (user.assignedTaskCount > 0) {
            user.assignedTaskCount -= 1;
            await user.save();
        }

        res.json({ message: "User task count decremented", user });
    } catch (error) {
        res.status(500).json({ error: "Failed to decrement assigned task count" });
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




app.put("/tasks/:taskId/complete", async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId).populate("allocatedUser");

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        if (task.status === "Completed") {
            return res.status(400).json({ message: "Task is already completed" });
        }
        console.log(task.assignedAt)

        task.status = "Completed";
        task.completedAt = new Date();

        // Calculate completion time in hours
        const completionTime = (task.completedAt - task.assignedAt) / (1000 * 60 * 60);

        // Update user statistics
        const user = await User.findById(task.allocatedUser);

        if (user) {
            user.completedTasks += 1;
            user.assignedTaskCount -= 1; // Reduce assigned task count
            user.averageCompletionTime = 
                (user.averageCompletionTime * (user.completedTasks - 1) + completionTime) / user.completedTasks;

            await user.save();
        }

        await task.save();
        res.json({ message: "Task marked as completed", task });

    } catch (error) {
        console.error("Error marking task as completed:", error);
        res.status(500).json({ error: "Failed to mark task as completed" });
    }
});

app.get("/client",async(req,res)=>
    {
        const Clients = await User.countDocuments({ assignedTaskCount: 1 });
        const totalClients  = await User.countDocuments();
        const totalTask = await Task.countDocuments();
        const completedTask = await Task.countDocuments({status:"completed"});
        const pendingTask = await Task.countDocuments({status:"Pending"});
        const ongoingTask = await Task.countDocuments({status:"ongoing"});
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