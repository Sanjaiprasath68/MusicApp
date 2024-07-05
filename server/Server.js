const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB setup
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// MongoDB models
const Playlist = require('./models/Playlist');
const Song = require('./models/Song');
const Signup = require('./models/Signup'); // Import Signup model

// Routes

// Route for fetching playlists from an external API
app.get('/fetchPlaylist', async (req, res) => {
  try {
    const response = await axios.get("https://v1.nocodeapi.com/sachinsharma10/spotify/hyFdawBnWQEXIMEk/playlists?id=37i9dQZF1DX1i3hvzHpcQV");
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Route for creating a new playlist
app.post('/playlists', async (req, res) => {
  const { name } = req.body;
  try {
    const playlist = new Playlist({ name, songs: [] });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Error creating playlist' });
  }
});

// Route for fetching all playlists
app.get('/playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find();
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Error fetching playlists' });
  }
});

// Route for fetching a specific playlist by ID
app.get('/playlists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await Playlist.findById(id).populate('songs');
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    res.status(500).json({ error: 'Error fetching playlist songs' });
  }
});

// Route for adding a song to a playlist
app.post('/playlists/:id/addSong', async (req, res) => {
  const { id } = req.params;
  const { songId, songName, songAlbum, preview_url, artists } = req.body;
  try {
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Create a new song object
    const newSong = new Song({
      id: songId,
      name: songName,
      album: songAlbum,
      preview_url: preview_url,
      artists: artists.map(artist => artist.name),  // Save artist names
    });

    // Save the new song to the database
    await newSong.save();

    // Add the song reference to the playlist
    playlist.songs.push(newSong._id);
    await playlist.save();

    res.json(newSong);  // Return the new song
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ error: 'Error adding song to playlist' });
  }
});

// Route for removing a song from a playlist
app.delete('/playlists/:playlistId/songs/:songId', async (req, res) => {
  const { playlistId, songId } = req.params;
  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    playlist.songs.pull(songId);
    await playlist.save();
    res.json({ message: 'Song removed from playlist' });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ error: 'Error removing song from playlist' });
  }
});

// Route for deleting a playlist
app.delete('/playlists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    await playlist.remove();
    res.json({ message: 'Playlist and its songs deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Error deleting playlist' });
  }
});

// Route for handling signup
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if email already exists
    const existingUser = await Signup.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create a new user
    const newUser = new Signup({ email, password });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Error signing up' });
  }
});

// Route for handling login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email and password
    const user = await Signup.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});






// DELETE route to delete a playlist
app.delete('/playlists/:playlistId', async (req, res) => {
  const { playlistId } = req.params;

  try {
    await Playlist.findByIdAndDelete(playlistId);
    res.status(200).send('Playlist deleted successfully');
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).send('Failed to delete playlist');
  }
});

// DELETE route to remove a song from a playlist
app.delete('/playlists/:playlistId/songs/:songId', async (req, res) => {
  const { playlistId, songId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).send('Playlist not found');
    }

    playlist.songs = playlist.songs.filter(song => song._id.toString() !== songId);
    await playlist.save();

    res.status(200).send('Song removed from playlist successfully');
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).send('Failed to remove song from playlist');
  }
});








// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
