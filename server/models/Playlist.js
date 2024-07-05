const mongoose = require('mongoose');
const Song = require('./Song');

const PlaylistSchema = new mongoose.Schema({
  name: String,
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
});

// Pre-remove hook to delete associated songs
PlaylistSchema.pre('remove', async function(next) {
  try {
    await Song.deleteMany({ _id: { $in: this.songs } });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Playlist', PlaylistSchema);
