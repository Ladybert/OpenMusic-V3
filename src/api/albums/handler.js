const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
 
    autoBind(this);
  }
 
  async postAlbumHandler(request, h) {
    this._validator.validateAlbumsPayload(request.payload);
    const { name = 'untitled', year } = request.payload;
 
    const albumId = await this._service.postAlbum({ name, year });
 
    return h.response({
      status: 'success',
      data: {
        albumId,
      },
    }).code(201);
  }
 
  async getAlbumsHandler(request, h) {
    const albums = await this._service.getAlbums();

    return h.response({
      status: 'success',
      data: {
        albums,
      },
    }).code(200);
  }
 
  async getAlbumByIdHandler(request, h) {
    const { albumId } = request.params;
    const album = await this._service.getAlbumById(albumId);

    return h.response({
      status: 'success',
      data: {
        album,
      },
    }).code(200);
  }
 
  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumsPayload(request.payload);
    const { albumId } = request.params;
 
    await this._service.editAlbumById(albumId, request.payload);

    return h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    }).code(200);
  }
 
  async deleteAlbumByIdHandler(request, h) {
    const { albumId } = request.params;
    await this._service.deleteAlbumById(albumId);
 
    return h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    }).code(200);
  }
}

module.exports = AlbumsHandler;