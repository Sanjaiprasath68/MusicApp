const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  description: String,
  image: String,
  video: String,
});

module.exports = mongoose.model('Upload', uploadSchema);
