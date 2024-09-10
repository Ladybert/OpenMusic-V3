const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapPlaylists } = require("../../utils");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsHandler {
  constructor() {
    this.pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };
    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan playlist baru");
    }

    return result.rows[0].id;
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: "SELECT owner FROM playlists WHERE id = $1",
      values: [playlistId],
    };
    const result = await this.pool.query(query);

    // Jika playlist ditemukan, cek apakah pemiliknya sesuai
    if (result.rowCount && result.rows[0].owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }

    // Jika playlist tidak ditemukan atau pemilik sesuai, lanjutkan tanpa error
  }

  async getPlaylists(owner) {
    const playlistQuery = {
      text: `SELECT playlists.*, users.username 
               FROM playlists
               LEFT JOIN users ON users.id = playlists.owner 
               WHERE playlists.owner = $1`,
      values: [owner],
    };

    const result = await this.pool.query(playlistQuery);
    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    return result.rows.map(mapPlaylists);
  }

  async getPlaylistById(playlistId) {
    const playlistQuery = {
      text: `SELECT playlists.*, users.username
        FROM playlists
        LEFT JOIN users ON users.id = playlists.owner
        WHERE playlists.id = $1"`,
      values: [playlistId],
    };

    const playlistResult = await this.pool.query(playlistQuery);

    if (!playlistResult.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlists = playlistResult.rows[0];

    return playlists;
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [playlistId],
    };
    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
    }
  }

  async addSongToPlaylistById(playlistId, { songId }) {
    const id = `playlist_song-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING playlist_id",
      values: [id, playlistId, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Gagal menambahkan lagu ke dalam playlist");
    }

    return result.rows[0].playlist_id;
  }

  async getSongsFromPlaylistById(playlistId) {
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name, users.username, songs.id, songs.title, songs.performer
           FROM playlists
           LEFT JOIN users ON users.id = playlists.owner
           LEFT JOIN playlist_songs ON playlists.id = playlist_songs.playlist_id
           LEFT JOIN songs ON playlist_songs.song_id = songs.id
           WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await this.pool.query(playlistQuery);

    if (!playlistResult.rowCount) {
      throw new NotFoundError("Lagu di dalam Playlist tidak ditemukan");
    }

    return playlistResult.rows.map(mapPlaylists);
  }

  async deleteSongsFromPlaylistById(songId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id",
      values: [songId],
    };
    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        "Lagu gagal dihapus. Playlist Id tidak ditemukan",
      );
    }
  }
}

module.exports = PlaylistsHandler;
