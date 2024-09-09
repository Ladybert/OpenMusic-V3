const autoBind = require("auto-bind");

class AlbumsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    const { payload } = request;
    this.validator.validateAlbumsPayload(payload);

    const { name = "untitled", year } = payload; // Provide default value inline

    const albumId = await this.service.postAlbum({ name, year });

    return h
      .response({
        status: "success",
        data: { albumId },
      })
      .code(201);
  }

  async getAlbumsHandler(_request, h) {
    // Underscore for unused parameters
    const albums = await this.service.getAlbums();

    return h
      .response({
        status: "success",
        data: { albums },
      })
      .code(200);
  }

  async getAlbumByIdHandler(request, h) {
    const { albumId } = request.params;
    const album = await this.service.getAlbumById(albumId);

    return h
      .response({
        status: "success",
        data: { album },
      })
      .code(200);
  }

  async putAlbumByIdHandler(request, h) {
    const { payload, params } = request;
    this.validator.validateAlbumsPayload(payload);

    await this.service.editAlbumById(params.albumId, payload);

    return h
      .response({
        status: "success",
        message: "Album berhasil diperbarui",
      })
      .code(200);
  }

  async deleteAlbumByIdHandler(request, h) {
    const { albumId } = request.params;
    await this.service.deleteAlbumById(albumId);

    return h
      .response({
        status: "success",
        message: "Album berhasil dihapus",
      })
      .code(200);
  }
}

module.exports = AlbumsHandler;
