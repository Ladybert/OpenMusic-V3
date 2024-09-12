const autoBind = require("auto-bind");

class PlaylistsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  // Start Playlist Handler
  async addPlaylistHandler(request, h) {
    this.validator.validatePlaylistsPayload(request.payload);
    const { name = "New Playlist" } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this.service.addPlaylist({
      name,
      owner: credentialId,
    });

    return h
      .response({
        status: "success",
        data: {
          playlistId,
        },
      })
      .code(201);
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.service.getPlaylists(credentialId);

    return h
      .response({
        status: "success",
        data: {
          playlists,
        },
      })
      .code(200);
  }

  async deletePlaylistByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.service.verifyPlaylistOwner(playlistId, credentialId);
    await this.service.deletePlaylistById(playlistId);

    return h
      .response({
        status: "success",
        message: "Playlist berhasil dihapus",
      })
      .code(200);
  }
  // End of Playlist Handler

  // Start Song to Playlist Handler By Id
  async addSongToPlaylistByIdHandler(request, h) {
    this.validator.validateSongsToPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(playlistId, credentialId);
    await this.service.addSongToPlaylistById(playlistId, {
      songId,
      userId: credentialId,
    });

    return h
      .response({
        status: "success",
        message: "lagu berhasil di masukkan ke dalam playlist !",
      })
      .code(201);
  }

  async getSongsFromPlaylistByIdHandler(request, h) {
    this.validator.validateSongsToPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this.service.getSongsFromPlaylistById(playlistId);

    return h
      .response({
        status: "success",
        data: {
          playlist,
        },
      })
      .code(200);
  }

  async deleteSongsFromPlaylistByIdHandler(request, h) {
    this.validator.validateSongsToPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(playlistId, credentialId);
    await this.service.deleteSongsFromPlaylistById(
      playlistId,
      songId,
      credentialId,
    );

    return h
      .response({
        status: "success",
        message: "Lagu berhasil di hapus dari playlist !",
      })
      .code(200);
  }

  async getPlaylistActivitesHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const activities = await this.service.getPlaylistActivityById(playlistId);
    await this.service.verifyPlaylistAccess(playlistId, credentialId);

    return h
      .response({
        status: "success",
        data: activities,
      })
      .code(200);
  }
  // End of Song to Playlist Handler By Id
}

module.exports = PlaylistsHandler;
