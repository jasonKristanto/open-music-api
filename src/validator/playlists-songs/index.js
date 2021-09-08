const InvariantError = require('../../exceptions/invariant-error');
const { PlaylistSongsPayloadSchema } = require('./schema');

const PlaylistsSongsValidator = {
  validatePlaylistsSongsValidator: (payload) => {
    const validationResult = PlaylistSongsPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsSongsValidator;
