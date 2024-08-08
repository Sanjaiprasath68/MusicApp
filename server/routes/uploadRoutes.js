const express = require('express');
const multer = require('multer');
const Upload = require('../models/Upload');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.fields([{ name: 'image' }, { name: 'video' }]), async (req, res) => {
  const { description } = req.body;
  const image = req.files['image'] ? req.files['image'][0].path : null;
  const video = req.files['video'] ? req.files['video'][0].path : null;

  const newUpload = new Upload({ description, image, video });
  await newUpload.save();

  res.json(newUpload);
});

router.get('/', async (req, res) => {
  const uploads = await Upload.find();
  res.json(uploads);
});

module.exports = router;
