const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  id: String,
  name: String,
  preview_url: String,
  album: String,
  artists: [String],  // Include artists field
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;
