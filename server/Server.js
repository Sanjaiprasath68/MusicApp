const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Change to a different port if needed

app.use(express.json());
app.use(cors()); // Enable CORS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Consider hashing passwords for security
});

const User = mongoose.model('User', userSchema);

const courseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
});

const Course = mongoose.model('Course', courseSchema);

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.get("/demo", (req, res) => {
  res.send("Demo Pages");
});

// User login route
app.post('/logins', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password }); // Hash and compare passwords in production
    if (user) {
      res.status(200).json({ message: 'Login successful!' });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Upload course route
app.post('/upload', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  const { description } = req.body;
  const thumbnail = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
  const video = req.files['video'] ? req.files['video'][0] : null;

  if (!description || !thumbnail || !video) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const course = new Course({
      description,
      thumbnailUrl: `http://localhost:${PORT}/uploads/${thumbnail.filename}`,
      videoUrl: `http://localhost:${PORT}/uploads/${video.filename}`,
    });

    await course.save();

    res.status(200).json({ message: 'Upload successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all courses route
app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
