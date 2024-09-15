const autoBind = require("auto-bind");

class ExportsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postExportPlaylistByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    this.service.verifyPlaylistIfExists(playlistId);
    this.service.verifyPlaylistOwner(playlistId, credentialId);
    this.validator.validateExportPlaylistPayload(request.payload);

    const message = {
      userId: request.auth.credentials.id,
      targetEmail: request.payload.targetEmail,
    };

    await this.service.sendMessage("export:playlists", JSON.stringify(message));

    const response = h.response({
      status: "success",
      message: "Permintaan Anda dalam antrean",
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
