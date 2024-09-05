const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { mapAlbums } = require("../../utils");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumsServices {
  constructor() {
    this._pool = new Pool();
  }

  async postAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan album baru");
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query("SELECT * FROM albums");
    return result.rows.map(mapAlbums);
  }

  async getAlbumById(albumId) {
    const albumQuery = {
        text: 'SELECT id, name, year FROM albums WHERE id = $1',
        values: [albumId],
    };
    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rows.length) {
        throw new NotFoundError('Album tidak ditemukan');
    }

    const songsQuery = {
        text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
        values: [albumId],
    };
    const songsResult = await this._pool.query(songsQuery);

    const album = albumResult.rows[0];
    album.songs = songsResult.rows;

    return album;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
        text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
        values: [name, year, id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = AlbumsServices;
