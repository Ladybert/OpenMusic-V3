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

    await this.service.addLikeAlbum({
      credentialId,
      albumId,
    });

    return h
      .response({
        status: "success",
        message: "Like berhasil di tambahkan untuk album ini",
      })
      .code(201);
  }

  async getLikeAlbumsHandler(request, h) {
    const { albumId } = request.params;
    const likeAlbums = await this.service.getLikeAlbumsById(albumId);

    return h
      .response({
        status: "success",
        data: { likeAlbums },
      })
      .code(200);
  }

  async removeLikeFromAlbumByIdHandler(request, h) {
    const { albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.service.removeLikeFromAlbumById({ albumId, credentialId });

    return h
      .response({
        status: "success",
        message: "Album berhasil dihapus",
      })
      .code(200);
  }
}

module.exports = LikeAlbumsHandler;
