const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
 
    autoBind(this);
  }
 
  async postSongHandler(request, h) {
    this._validator.validateSongsPayload(request.payload);
    const { 
      title = 'untitled', 
      year = 'tidak di ketahui', 
      genre = 'tidak di ketahui', 
      performer = 'anonim', 
      duration = null, 
      albumId = null 
    } = request.payload;
    const songId = await this._service.postSong({ title, year, genre, performer, duration, albumId });
 
    return h.response({
      status: 'success',
      data: {
        songId,
      },
    }).code(201);
  }
 
  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs({ title, performer });
  
    return h.response({
      status: 'success',
      data: {
        songs,
      },
    }).code(200);
  }
  
 
  async getSongByIdHandler(request, h) {
    const { songId } = request.params;
    const song = await this._service.getSongById(songId);
    return h.response({
      status: 'success',
      data: {
        song,
      },
    }).code(200);
  }
 
  async putSongByIdHandler(request, h) {
    this._validator.validateSongsPayload(request.payload);
    const { songId } = request.params;
 
    await this._service.updateSongById(songId, request.payload);
 
    return h.response({
      status: 'success',
      message: 'Musik berhasil diperbarui',
    }).code(200);
  }
 
  async deleteSongByIdHandler(request, h) {
    const { songId } = request.params;
    await this._service.deleteSongById(songId);
 
    return h.response({
      status: 'success',
      message: 'Musik berhasil dihapus',
    }).code(200);
  }
}

module.exports = SongsHandler;