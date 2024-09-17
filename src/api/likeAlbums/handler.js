const autoBind = require("auto-bind");

class LikeAlbumsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postLikeAlbumByIdHandler(request, h) {
    const { albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    console.log(credentialId);

    await this.service.addLikeAlbum(credentialId, albumId);

    return h
      .response({
        status: "success",
        message: "Like berhasil di tambahkan untuk album ini",
      })
      .code(201);
  }

  async getLikeAlbumsByIdHandler(request, h) {
    const { albumId } = request.params;
    const { result, isCache } = await this.service.getLikeAlbumsById(albumId);

    const response = h
      .response({
        status: "success",
        data: {
          likes: result,
        },
      })
      .code(200);

    if (isCache) {
      response.header("X-Data-Source", "cache");
    } else {
      response.header("X-Data-Source", "not-cache");
    }

    return response;
  }

  async removeLikeFromAlbumByIdHandler(request, h) {
    const { albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.service.removeLikeFromAlbumById(albumId, credentialId);

    return h
      .response({
        status: "success",
        message: "Album berhasil dihapus",
      })
      .code(200);
  }
}

module.exports = LikeAlbumsHandler;
