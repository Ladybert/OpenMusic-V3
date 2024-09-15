const autoBind = require("auto-bind");

class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this.validator.validateSongsPayload(request.payload);
    const {
      title = "untitled",
      year = "tidak di ketahui",
      genre = "tidak di ketahui",
      performer = "anonim",
      duration = null,
      albumId = null,
    } = request.payload;
    const songId = await this.service.postSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    return h
      .response({
        status: "success",
        data: {
          songId,
        },
      })
      .code(201);
  }

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    const songs = await this.service.getSongs({ title, performer });

    return h
      .response({
        status: "success",
        data: {
          songs,
        },
      })
      .code(200);
  }

  async getSongByIdHandler(request, h) {
    const { songId } = request.params;
    console.log("ID yang diterima:", songId);
    const song = await this.service.getSongById(songId);
    return h
      .response({
        status: "success",
        data: {
          song,
        },
      })
      .code(200);
  }

  async putSongByIdHandler(request, h) {
    this.validator.validateSongsPayload(request.payload);
    const { songId } = request.params;

    await this.service.updateSongById(songId, request.payload);

    return h
      .response({
        status: "success",
        message: "Musik berhasil diperbarui",
      })
      .code(200);
  }

  async deleteSongByIdHandler(request, h) {
    const { songId } = request.params;
    await this.service.deleteSongById(songId);

    return h
      .response({
        status: "success",
        message: "Musik berhasil dihapus",
      })
      .code(200);
  }
}

module.exports = SongsHandler;
