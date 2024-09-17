const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumLikesService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addLikeAlbum(userId, albumId) {
    const id = `album-likes-${nanoid(16)}`;
    await this.verifyAlbumId(albumId);
    await this.verifyLikeUserOnAlbumById(albumId, userId);
    const query = {
      text: "INSERT INTO user_album_likes (id, user_id, album_id) VALUES($1, $2, $3)",
      values: [id, userId, albumId],
    };
    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Gagal menambahkan like pada album");
    }

    await this.cacheService.delete(`user_album_likes:${albumId}`);

    return result;
  }

  async getLikeAlbumsById(albumId) {
    try {
      // Cek cache terlebih dahulu
      const result = await this.cacheService.get(`user_album_likes:${albumId}`);
      if (result) {
        return {
          isCache: true,
          result: JSON.parse(result),
        };
      }
    } catch (error) {
      console.error("Cache error:", error);
    }

    const albumLikeQuery = {
      text: `
        SELECT COUNT(user_album_likes.id) AS jumlah_like, albums.* 
        FROM albums 
        LEFT JOIN user_album_likes ON albums.id = user_album_likes.album_id 
        WHERE albums.id = $1 
        GROUP BY albums.id
      `,
      values: [albumId],
    };

    const albumLikeResult = await this.pool.query(albumLikeQuery);

    if (albumLikeResult.rowCount === 0) {
      return {
        isCache: false,
        result: 0,
      };
    }

    const likeCount = parseInt(albumLikeResult.rows[0].jumlah_like, 10);

    await this.cacheService.set(
      `user_album_likes:${albumId}`,
      JSON.stringify(likeCount),
    );

    return {
      isCache: false,
      result: likeCount,
    };
  }

  async removeLikeFromAlbumById(albumId, userId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id",
      values: [albumId, userId],
    };
    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }

    await this.cacheService.delete(`user_album_likes:${albumId}`);

    return result;
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

  async verifyLikeUserOnAlbumById(albumId, userId) {
    const query = {
      text: "SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1 AND user_id = $2",
      values: [albumId, userId],
    };
    const result = await this.pool.query(query);
    const likeCount = parseInt(result.rows[0].count, 10);

    if (likeCount > 0) {
      throw new InvariantError(
        "Anda hanya bisa menambahkan like untuk album ini sebanyak 1 kali saja",
      );
    }
  }
}

module.exports = AlbumLikesService;
