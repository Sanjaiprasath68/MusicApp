import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, ListGroup, Button, Modal, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [showMyPlaylists, setShowMyPlaylists] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [audioControl, setAudioControl] = useState(null);

  useEffect(() => {
    fetchPlaylist();
    fetchPlaylists();
  }, []);

  const fetchPlaylist = async () => {
    try {
      const response = await axios.get('https://music-app-api-seven.vercel.app/fetchPlaylist');
      setSongs(response.data.tracks.items);
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get('https://music-app-api-seven.vercel.app/playlists');
      setPlaylists(response.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const fetchPlaylistSongs = async (playlistId) => {
    try {
      const response = await axios.get(`https://music-app-api-seven.vercel.app/playlists/${playlistId}`);
      setPlaylistSongs(response.data.songs);
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
    }
  };

  const playSong = (song) => {
    if (audioControl) {
      audioControl.pause();
    }
    const audio = new Audio(song.preview_url);
    audio.play();
    setAudioControl(audio);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const pauseSong = () => {
    if (audioControl) {
      audioControl.pause();
    }
    setIsPlaying(false);
  };

  const handleShowModal = (song) => {
    setCurrentSong(song);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (audioControl) {
      audioControl.pause();
    }
    setShowModal(false);
    setIsPlaying(false);
  };

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setPlaylistName('');
  };

  const createPlaylist = async () => {
    try {
      await axios.post('https://music-app-api-seven.vercel.app/playlists', { name: playlistName });
      await fetchPlaylists(); // Fetch updated playlists
      handleCloseCreateModal();
      window.alert('Playlist created successfully!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      window.alert('Failed to create playlist.');
    }
  };

  const handleSelectPlaylist = async (event) => {
    const playlistId = event.target.value;
    setSelectedPlaylist(playlistId);
    await fetchPlaylistSongs(playlistId);
  };

  const handleShowMyPlaylists = () => {
    fetchPlaylists();
    setShowMyPlaylists(true);
  };

  const handleHideMyPlaylists = () => {
    setShowMyPlaylists(false);
  };

  const deletePlaylist = async (playlistId) => {
    try {
      await axios.delete(`https://music-app-api-seven.vercel.app/playlists/${playlistId}`);
      await fetchPlaylists(); // Refresh playlists after deletion
      window.alert('Playlist deleted successfully!');
    } catch (error) {
      console.error('Error deleting playlist:', error);
      window.alert('Failed to delete playlist.');
    }
  };

  const removeSongFromPlaylist = async (songId) => {
    try {
      await axios.delete(`https://music-app-api-seven.vercel.app/playlists/${selectedPlaylist}/songs/${songId}`);
      await fetchPlaylistSongs(selectedPlaylist); // Refresh playlist songs after removal
      window.alert('Song removed from playlist successfully!');
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      window.alert('Failed to remove song from playlist.');
    }
  };

  const handleAddSong = async () => {
    try {
      const { id: songId, name: songName, album: { name: songAlbum }, preview_url, artists } = currentSong.track;
      await axios.post(`https://music-app-api-seven.vercel.app/playlists/${selectedPlaylist}/addSong`, {
        songId,
        songName,
        songAlbum,
        preview_url,
        artists: artists.map(artist => artist.name), // Save artist names
      });
      window.alert('Song added to playlist successfully!');
      handleCloseModal();
      // Fetch updated playlist songs
      fetchPlaylistSongs(selectedPlaylist);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      window.alert('Failed to add song to playlist.');
    }
  };

  return (
    <Container>
      <h1 className="my-4">Music Streaming</h1>
      {!showMyPlaylists && (
        <>
          <Button variant="primary" className="mb-3" onClick={handleShowCreateModal}>
            Create Playlist
          </Button>
          <Button variant="primary" className="mb-3" onClick={handleShowMyPlaylists}>
            Show My Playlists
          </Button>
        </>
      )}
      {showMyPlaylists && (
        <>
          <Button variant="secondary" className="mb-3" onClick={handleHideMyPlaylists}>
            Back to Playlist
          </Button>
          <h2>My Playlists</h2>
          <ListGroup>
        {playlists.map((playlist) => (
          <ListGroup.Item key={playlist._id} onClick={() => handleSelectPlaylist(playlist._id)}>
            {playlist.name}
            <Button variant="danger" className="ml-2" onClick={(e) => {
              e.stopPropagation();
              deletePlaylist(playlist._id);
            }}>
              Delete
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>

          {selectedPlaylist && (
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>Playlist Songs</Card.Title>
                {playlistSongs.length > 0 ? (
                  <ListGroup>
                    {playlistSongs.map((song) => (
                      <ListGroup.Item key={song._id}>
                        {song.name} - {song.artists.join(', ')}
                        <Button variant="danger" className="ml-2" onClick={() => removeSongFromPlaylist(song._id)}>
                          Remove
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p>No songs in this playlist.</p>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      )}
      {!showMyPlaylists && (
        <ListGroup>
          {(isPlaying && currentSong) && (
            <div className="mt-3">
              <div className="d-flex align-items-center">
                <img src={currentSong.album.images[0].url} alt="Song Album" style={{ width: '50px', marginRight: '15px' }} />
                <span>{currentSong.name} by {currentSong.artists.map((artist) => artist.name).join(', ')}</span>
              </div>
              <Button variant="danger" onClick={pauseSong}>
                Pause
              </Button>
            </div>
          )}
          {songs.map((song) => (
            <ListGroup.Item key={song.track.id}>
              <div>
                <strong>{song.track.name}</strong> by{' '}
                {song.track.artists.map((artist) => artist.name).join(', ')}
              </div>
              <Button variant="primary" onClick={() => handleShowModal(song)}>
                Add to Playlist
              </Button>
              <Button variant="success" onClick={() => playSong(song.track)}>
                Play
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Song to Playlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formPlaylists">
            <Form.Label>Select Playlist</Form.Label>
            <Form.Control as="select" value={selectedPlaylist} onChange={handleSelectPlaylist}>
              <option value="">Select a playlist</option>
              {playlists.map((playlist) => (
                <option key={playlist._id} value={playlist._id}>
                  {playlist.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddSong}>
            Add Song
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Playlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formPlaylistName">
            <Form.Label>Playlist Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter playlist name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Close
          </Button>
          <Button variant="primary" onClick={createPlaylist}>
            Create Playlist
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default App;
