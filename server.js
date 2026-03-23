require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const Grid = require("gridfs-stream");
const multerGridFSStorage = require("multer-gridfs-storage");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ================= MONGODB =================

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const conn = mongoose.connection;

let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("pdfs");
  console.log("✅ GridFS ready");
});


// ================= SCHEMAS =================

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin','creator','reader'], default: 'reader' },
  company: String
}, { timestamps: true });

const pdfSchema = new mongoose.Schema({
  name: String,
  filename: String,
  fileId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const PDF = mongoose.model("PDF", pdfSchema);


// ================= AUTH =================

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hash,
      role: "creator",
      company
    });

    await user.save();
    res.json({ message: "Registered" });

  } catch {
    res.status(500).json({ message: "Register error" });
  }
});


// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid" });

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { email: user.email, role: user.role }
    });

  } catch {
    res.status(500).json({ message: "Login error" });
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


// ================= GRIDFS STORAGE =================

const storage = new multerGridFSStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      filename: Date.now() + "-" + file.originalname,
      bucketName: "pdfs"
    };
  }
});

const upload = multer({ storage });


// ================= UPLOAD =================

app.post("/api/pdfs", auth, upload.array("pdfs"), async (req, res) => {
  try {
    const files = req.files.map(file => ({
      name: file.originalname,
      filename: file.filename,
      fileId: file.id
    }));

    await PDF.insertMany(files);

    res.json(files);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload error" });
  }
});


// ================= GET ALL PDFs =================

app.get("/api/pdfs", auth, async (req, res) => {
  try {
    const pdfs = await PDF.find().sort({ createdAt: -1 });
    res.json(pdfs);
  } catch {
    res.status(500).json({ message: "Fetch error" });
  }
});


// ================= STREAM FILE =================

app.get("/api/pdfs/file/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });

    if (!file) return res.status(404).json({ message: "Not found" });

    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);

  } catch {
    res.status(500).json({ message: "Stream error" });
  }
});


// ================= DELETE =================

app.delete("/api/pdfs/:id", auth, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);

    if (!pdf) return res.status(404).json({ message: "Not found" });

    gfs.remove({ filename: pdf.filename, root: "pdfs" }, () => {});

    await PDF.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted" });

  } catch {
    res.status(500).json({ message: "Delete error" });
  }
});


// ================= START =================

app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
