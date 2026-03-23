require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

const BASE_URL = "https://mernwebmanga.onrender.com";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ================= MONGODB =================

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));


// ================= SCHEMAS =================

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'creator', 'reader'], default: 'reader' },
  company: String,
  isVerified: { type: Boolean, default: true }
}, { timestamps: true });

const pdfSchema = new mongoose.Schema({
  name: String,
  filename: String,
  url: String,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const PDF = mongoose.model("PDF", pdfSchema);


// ================= DEFAULT ADMIN =================

const createDefaultAdmin = async () => {
  try {
    await User.deleteMany({ role: 'admin' });

    const hashedPassword = await bcrypt.hash('Raj@101105', 10);

    const admin = new User({
      name: 'Admin',
      email: 'rajmt2005@gmail.com',
      password: hashedPassword,
      role: 'admin',
      company: 'MangaVerse',
      isVerified: true
    });

    await admin.save();
    console.log('✅ Admin created');
  } catch (err) {
    console.error(err);
  }
};

setTimeout(createDefaultAdmin, 2000);


// ================= AUTH =================

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'creator',
      company
    });

    await user.save();

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// LOGIN (OTP REMOVED ✅)
app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ✅ ALL ROLES LOGIN DIRECTLY NOW
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ================= AUTH MIDDLEWARE =================

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};


// ================= FILE UPLOAD =================

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });


// UPLOAD PDFs
app.post("/api/pdfs", auth, upload.array("pdfs"), async (req, res) => {
  try {
    const files = req.files.map(file => ({
      name: file.originalname,
      filename: file.filename,
      url: `${BASE_URL}/uploads/${file.filename}` // ✅ FIXED URL
    }));

    await PDF.insertMany(files);

    res.json(files);
  } catch {
    res.status(500).json({ message: "Upload error" });
  }
});


// GET PDFs (FROM DB)
app.get("/api/pdfs", auth, async (req, res) => {
  try {
    const pdfs = await PDF.find().sort({ createdAt: -1 });
    res.json(pdfs);
  } catch {
    res.status(500).json({ message: "Fetch error" });
  }
});


// DELETE PDF
app.delete("/api/pdfs/:id", auth, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: "Not found" });

    const filePath = path.join(__dirname, "uploads", pdf.filename);

    fs.unlink(filePath, () => {});

    await PDF.findByIdAndDelete(req.params.id);

    res.json({ message: "PDF deleted" });
  } catch {
    res.status(500).json({ message: "Delete error" });
  }
});


// ================= FRONTEND =================

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


// ================= START =================

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
