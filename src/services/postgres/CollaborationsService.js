const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class CollaborationsService {
  constructor() {
    this.pool = new Pool();
  }

  async addCollaboration({ playlistId, userId }) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Kolaborasi gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async deleteCollaboration({ playlistId, userId }) {
    const query = {
      text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);
    return result;
  }

  async verifyPlaylistExists(playlistId) {
    const query = {
      text: "SELECT id FROM playlists WHERE id = $1",
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    console.log(playlistId);

    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
  }

  async verifyUserIfExists(userId) {
    const query = {
      text: "SELECT id FROM users WHERE id = $1",
      values: [userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("User tidak ditemukan");
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
}

module.exports = CollaborationsService;
