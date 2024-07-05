const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  id: String,
  name: String,
  album: String,
  preview_url: String,
  artists: [String],
});

module.exports = mongoose.model('Song', SongSchema);
