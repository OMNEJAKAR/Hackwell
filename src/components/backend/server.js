const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken") // For hashing passwords
const axios = require("axios");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET = process.env.JWT_SECRET;
// const apiKey = process.env.HUGGINGFACE_API_KEY;

mongoose.connect('mongodb://localhost:27017/hack-well')
const db = mongoose.connection;
db.on('error',console.error.bind(console,"connection error:"));
db.once('open',()=>{
    console.log("Database connected");
})

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    skills: [{ type: String }], // Add this field to store skills
    assignedTaskCount: { type: Number, default: 0 } // New field
}, { timestamps: true });

const User = mongoose.model("User", userSchema);



const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillsRequired: [{ type: String }], // Skills the task needs
    allocatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Store assigned user
}, { timestamps: true });


const Task = mongoose.model("Task", taskSchema);



app.post("/login",async(req,res)=>{
    try{
        const {email,password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Invalid email or password"});
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({error:"Invalid email or password"});
        }
        const token = jwt.sign({userId: user._id}, JWT_SECRET,{expiresIn:"1h"});

        res.json({message: "Login successful", token});

    }catch(error){
        res.status(500).json({error:"error.message"});
    }
})


const authenticateUser = (req,res,next) =>{
    const token = req.header("Authorization");
    if(!token) return res.status(401).json({error:"Access denied. No token provided. "});

    try{
        const decoded = jwt.verify(token.replace("Bearer ",""), JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        res.status(401).json({error: "Invalid token"});
    };
}

app.post("/tasks", async (req, res) => {
    try {
        const { title, description,skillsRequired } = req.body;
        const skills = ["Web Development","Machine Learning","Cybersecurity","Database Management"];

        const response = await axios.post(
             "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
             {inputs :description,parameters:{candidate_labels:skills}},
             {headers:{Authorization:`Bearer ${apiKey}`}}
        );

        console.log(response.data);

        const bestSkill = response.data.labels[0];



        // const assignedUser = await User.findOne({skills:bestSkill});

        const assignedUser = await User.findOne({ skills: bestSkill })
            .sort("assignedTaskCount") // Sort by the least number of tasks
            .where("assignedTaskCount").lt(3); // Only consider users with less than 3 active tasks


        if(!assignedUser){
            return res.status(404).json({error:"No user found with matching skill"});
        }

        const newTask = new Task({title, description,skillsRequired,allocatedUser:assignedUser._id});
        await newTask.save();

        assignedUser.assignedTaskCount += 1;
        await assignedUser.save();

        res.status(201).json({message:"Task assigned successfully", task:newTask});

        // Check if assigned user exists
    //     const user = await User.findById(assignedTo);
    //     if (!user) {
    //         return res.status(400).json({ error: "Assigned user does not exist" });
   }

    //     // Create the task
    //     const task = new Task({ title, description, status, allocatedUser,skillsRequired });
    //     await task.save();

    //     res.status(201).json({ message: "Task created successfully", task });}
    catch (error) {
        res.status(500).json({ error: "Failed to assign task" });
        console.error("Task Assignment Error:", error);

    }
});

app.get("/tasks",authenticateUser, async (req, res) => {
    try {
        const tasks = await Task.find().populate("assignedUser"); 
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate("assignedUser");
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/tasks/:id", async (req, res) => {
    try {
        const { title, description, status, assignedUser } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, status, assignedUser },
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




const router = express.Router();

// ✅ Create a new user (Registration)
app.post("/users", async (req, res) => {
    try {
        const { name, email, password ,skills,assignedTaskCount} = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({ name, email, password: hashedPassword,skills,assignedTaskCount});
        await user.save();

        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});








app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
