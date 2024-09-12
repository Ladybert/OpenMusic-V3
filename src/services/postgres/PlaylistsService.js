const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapPlaylists, mapPlaylistActivities } = require("../../utils");
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

  async verifyPlaylistAccess(playlistId, userId) {
    // Query untuk memeriksa pemilik playlist
    const ownerQuery = {
      text: "SELECT owner FROM playlists WHERE id = $1",
      values: [playlistId],
    };

    // Menjalankan query
    const ownerResult = await this.pool.query(ownerQuery);

    // Jika playlist ditemukan, periksa apakah user adalah pemilik
    if (ownerResult.rowCount > 0) {
      const { owner } = ownerResult.rows[0];

      // Jika user adalah pemilik, akses diberikan, tidak perlu verifikasi tambahan
      if (owner === userId) {
        return;
      }
    } else {
      // Jika tidak ada playlist ditemukan, lemparkan kesalahan
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    // Jika bukan pemilik, verifikasi sebagai kolaborator
    await this.verifyCollaborator(playlistId, userId);
  }

  async getPlaylists(owner) {
    const playlistQuery = {
      text: `SELECT DISTINCT playlists.*, users.username
           FROM playlists
           LEFT JOIN users ON users.id = playlists.owner
           LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
           WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const result = await this.pool.query(playlistQuery);

    return result.rows.map(mapPlaylists);
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

  async addSongToPlaylistById(playlistId, { songId, userId }) {
    await this.verifyPlaylistExists(playlistId);
    await this.verifySongExists(songId);

    const id = `playlist_song-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING playlist_id",
      values: [id, playlistId, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Gagal menambahkan lagu ke dalam playlist");
    }

    // Menambahkan aksi untuk riwayat aktifitas (yg ini yach)
    await this.addActivity(playlistId, userId, songId, "add");

    return result.rows[0].playlist_id;
  }

  async getSongsFromPlaylistById(playlistId) {
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name, users.username
             FROM playlists
             LEFT JOIN users ON users.id = playlists.owner
             WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await this.pool.query(playlistQuery);

    if (!playlistResult.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const songsQuery = {
      text: `SELECT songs.id, songs.title, songs.performer
             FROM songs
             LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
             WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const songsResult = await this.pool.query(songsQuery);

    const playlist = playlistResult.rows[0];
    playlist.songs = songsResult.rows;

    return playlist;
  }

  async deleteSongsFromPlaylistById(playlistId, songId, userId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id",
      values: [songId],
    };
    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Lagu gagal dihapus. Id lagu tidak ditemukan");
    }

    // Menambahkan aksi untuk riwayat aktifitas (yg ini yach)
    await this.addActivity(playlistId, userId, songId, "delete");

    return result.rows[0].song_id;
  }

  async verifyPlaylistExists(playlistId) {
    const query = {
      text: "SELECT id FROM playlists WHERE id = $1",
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
  }

  async verifySongExists(songId) {
    const query = {
      text: "SELECT id FROM songs WHERE id = $1",
      values: [songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [playlistId],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: "SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  // eslint-disable-next-line no-unused-vars
  async getPlaylistActivityById(playlistId) {
    // Kueri untuk mendapatkan aktivitas playlist berdasarkan playlistId
    const query = {
      text: `
      SELECT 
        playlist_song_activities.playlist_id,
        users.username, 
        songs.title, 
        playlist_song_activities.action, 
        playlist_song_activities.time
      FROM 
        playlist_song_activities
      INNER JOIN 
        songs ON playlist_song_activities.song_id = songs.id
      INNER JOIN 
        users ON playlist_song_activities.user_id = users.id
      WHERE 
        playlist_song_activities.playlist_id = $1
      ORDER BY 
        playlist_song_activities.time ASC
    `,
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    // Jika tidak ada aktivitas yang ditemukan, lemparkan NotFoundError
    if (!result.rowCount) {
      throw new NotFoundError("Aktivitas playlist tidak ditemukan");
    }

    return {
      playlistId,
      activities: result.rows.map(mapPlaylistActivities),
    };
  }

  async addActivity(playlistId, userId, songId, action) {
    const id = `activity-${nanoid(16)}`; // Generate ID untuk aktivitas
    const query = {
      text: "INSERT INTO playlist_song_activities (id, playlist_id, user_id, song_id, action) VALUES ($1, $2, $3, $4, $5)",
      values: [id, playlistId, userId, songId, action],
    };

    await this.pool.query(query);
  }
}

module.exports = PlaylistsHandler;
