// eslint-disable-next-line no-unused-vars
const autoBind = require("auto-bind");
// const ClientError = require("../../exceptions/ClientError");

class CollaborationsHandler {
  constructor(playlistsService, collaborationsService, validator) {
    this.collaborationsService = collaborationsService;
    this.playlistsService = playlistsService;
    this.validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this.collaborationsService.verifyPlaylistExists(playlistId);
    await this.collaborationsService.verifyUserIfExists(userId);
    await this.collaborationsService.verifyPlaylistOwner(
      playlistId,
      credentialId,
    );

    const collaborationId = await this.collaborationsService.addCollaboration({
      playlistId,
      userId,
    });

    const response = h.response({
      status: "success",
      message: "Kolaborasi berhasil ditambahkan",
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  // eslint-disable-next-line no-unused-vars
  async deleteCollaborationHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this.collaborationsService.deleteCollaboration({
      playlistId,
      userId,
    });

    return {
      status: "success",
      message: "Kolaborasi berhasil dihapus",
    };
  }
}

module.exports = CollaborationsHandler;
