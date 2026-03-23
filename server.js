require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const multerGridFSStorage = require("multer-gridfs-storage");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ================= MONGODB =================

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("Mongo Error:", err));

let bucket;

mongoose.connection.once("open", () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "pdfs"
  });
  console.log("✅ GridFS Bucket Ready");
});

// ================= SCHEMAS =================

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "creator" }
}, { timestamps: true });

const pdfSchema = new mongoose.Schema({
  name: String,
  filename: String,
  fileId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const PDF = mongoose.model("PDF", pdfSchema);

// ================= AUTH =================

const JWT_SECRET = process.env.JWT_SECRET;

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hash });
    await user.save();

    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Register error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login error" });
  }
});

// ================= AUTH MIDDLEWARE =================

const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ================= GRIDFS STORAGE =================

const storage = new multerGridFSStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => ({
    filename: Date.now() + "-" + file.originalname,
    bucketName: "pdfs"
  })
});

const upload = multer({ storage });

// ================= UPLOAD =================

app.post("/api/pdfs", auth, upload.array("pdfs"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const files = req.files.map(file => ({
      name: file.originalname,
      filename: file.filename,
      fileId: file.id
    }));

    await PDF.insertMany(files);

    res.json(files);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// ================= GET PDFs =================

app.get("/api/pdfs", auth, async (req, res) => {
  try {
    const pdfs = await PDF.find().sort({ createdAt: -1 });
    res.json(pdfs);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ message: "Fetch error" });
  }
});

// ================= STREAM PDF =================

app.get("/api/pdfs/file/:filename", async (req, res) => {
  try {
    res.set("Content-Type", "application/pdf");

    const stream = bucket.openDownloadStreamByName(req.params.filename);

    stream.on("error", () => {
      res.status(404).json({ message: "File not found" });
    });

    stream.pipe(res);

  } catch (err) {
    console.error("STREAM ERROR:", err);
    res.status(500).json({ message: "Stream error" });
  }
});

// ================= DELETE =================

app.delete("/api/pdfs/:id", auth, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: "Not found" });

    await bucket.delete(pdf.fileId);
    await PDF.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Delete error" });
  }
});

// ================= HEALTH CHECK =================

app.get("/", (req, res) => {
  res.send("🚀 API Running");
});

// ================= START =================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
