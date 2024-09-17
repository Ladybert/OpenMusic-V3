const autoBind = require("auto-bind");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class ExportsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
    this.pool = new Pool();

    autoBind(this);
  }

  // eslint-disable-next-line consistent-return
  async postExportPlaylistByIdHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      this.validator.validateExportPlaylistPayload(request.payload);
      await this.verifyPlaylistIfExists(playlistId, credentialId);
      await this.verifyPlaylistOwner(playlistId, credentialId);

      const message = {
        playlistId,
        targetEmail: request.payload.targetEmail,
      };

      console.log("Export message:", message);

      await this.service.sendMessage(
        "export:songsOnplaylist",
        JSON.stringify(message),
      );

      const response = h.response({
        status: "success",
        message: "Permintaan Anda dalam antrean",
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        const response = h.response({
          status: "fail",
          message: "Autentikasi diperlukan",
        });
        response.code(401);
        return response;
      }

      if (error instanceof InvariantError) {
        // If it's a validation error, return 400 Bad Request
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(400); // Use 400 for validation errors
        return response;
      }

      if (error instanceof NotFoundError) {
        // Handle 404 when playlist is not found
        const response = h.response({
          status: "fail",
          message: "Playlist tidak ditemukan",
        });
        response.code(404); // Use 404 for not found
        return response;
      }

      if (error instanceof AuthorizationError) {
        // Handle 403 for forbidden access to another user's playlist
        const response = h.response({
          status: "fail",
          message: "Anda tidak berhak mengakses playlist ini",
        });
        response.code(403); // Use 403 for unauthorized access
        return response;
      }
    }
  }

  async verifyPlaylistIfExists(playlistId, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [playlistId],
    };
    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    try {
      const query = {
        text: "SELECT * FROM playlists WHERE id = $1",
        values: [playlistId],
      };
      const result = await this.pool.query(query);
      if (!result.rowCount) {
        throw new NotFoundError("Playlist tidak ditemukan");
      }
      const playlist = result.rows[0];
      if (playlist.owner !== owner) {
        throw new AuthorizationError(
          "Anda tidak berhak mengakses resource ini",
        );
      }
    } catch (error) {
      console.error("Error verifying playlist owner:", error);
      throw new InvariantError("Gagal memverifikasi pemilik playlist");
    }
  }
}

module.exports = ExportsHandler;
