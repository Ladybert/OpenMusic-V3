const fs = require("fs");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");

class StorageService {
  constructor(folder) {
    this.folder = folder;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    this.pool = new Pool();
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const path = `${this.folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on("error", (error) => reject(error));
      file.pipe(fileStream);
      file.on("end", () => resolve(filename));
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async addCoverUrlToDatabase(coverUrl, albumId) {
    // Query untuk memperbarui kolom coverUrl pada tabel albums
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, albumId],
    };

    try {
      // Menjalankan query dengan await
      const resultQuery = await this.pool.query(query);

      // Memeriksa apakah ada baris yang diperbarui
      if (resultQuery.rowCount === 0) {
        throw new InvariantError(
          "Gagal menambahkan link cover album, album tidak ditemukan",
        );
      }

      // Mengembalikan ID album yang diperbarui
      return resultQuery.rows[0].id;
    } catch (error) {
      console.error("Database error:", error);
      throw new InvariantError("Gagal menambahkan link cover album");
    }
  }
}

module.exports = StorageService;
