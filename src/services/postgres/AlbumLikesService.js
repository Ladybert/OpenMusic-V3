const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumLikesService {
  constructor() {
    this.pool = new Pool();
  }

  async addLikeAlbum({ userId, albumId }) {
    const id = `album-likes-${nanoid(16)}`;
    await this.verifyAlbumId(albumId);
    await this.verifyLikeUserOnAlbumById(albumId, userId);
    const query = {
      text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };
    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan like pada album");
    }

    return result.rows[0].id;
  }

  async getLikeAlbumsById(albumId) {
    const albumLikeQuery = {
      text: 'SELECT COUNT(user_album_likes.*) AS jumlah_like, albums.* FROM albums LEFT JOIN albums ON albums.id = user_album_likes.album_id WHERE "album_id" = $1',
      values: [albumId],
    };
    const albumLikeResult = await this.pool.query(albumLikeQuery);

    if (!albumLikeResult.rowsCount) {
      const result = 0;
      return result;
    }

    const result = albumLikeResult.rows[0];
    return result;
  }

  async removeLikeFromAlbumById({ albumId, userId }) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id",
      values: [albumId, userId],
    };
    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }

  async verifyAlbumId(albumId) {
    const query = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [albumId],
    };

    const queryResults = await this.pool.query(query);
    if (!queryResults.rowCount) {
      throw new NotFoundError("Id album tidak di temukan");
    }
  }

  async verifyLikeUserOnAlbumById({ albumId, userId }) {
    const query = {
      text: "SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1 AND user_id = $2",
      values: [albumId, userId],
    };
    const result = await this.pool.query(query);

    // Mengecek apakah pengguna sudah menyukai album ini
    const likeCount = parseInt(result.rows[0].count, 10);

    if (likeCount > 0) {
      throw new InvariantError(
        "Anda hanya bisa menambahkan like untuk album ini sebanyak 1 kali saja",
      );
    }
  }
}

module.exports = AlbumLikesService;
