const InvariantError = require("../../exceptions/InvariantError");
const {
  PlaylistsPayloadSchema,
  SongsToPlaylistPayloadSchema,
} = require("./schema");

const PlaylistsValidator = {
  validatePlaylistsPayload: (payload) => {
    const playlistsValidationResult = PlaylistsPayloadSchema.validate(payload);
    if (playlistsValidationResult.error) {
      throw new InvariantError(playlistsValidationResult.error.message);
    }
  },
  validateSongsToPlaylistPayload: (payload) => {
    const SongsToPlaylistsValidationResult =
      SongsToPlaylistPayloadSchema.validate(payload);
    if (SongsToPlaylistsValidationResult.error) {
      throw new InvariantError(SongsToPlaylistsValidationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
