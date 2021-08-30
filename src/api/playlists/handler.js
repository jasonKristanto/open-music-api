const responses = require('../../utils/responses');

class PlaylistsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
  }

  async getPlaylistsHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this.service.getPlaylists(owner);

    return responses.sendSuccessResponse(h, { playlists });
  }

  async postPlaylistHandler(request, h) {
    try {
      this.validator.validatePlaylistsValidator(request.payload);

      const { name } = request.payload;
      const { id: owner } = request.auth.credentials;

      const playlistId = await this.service.addPlaylist({ name, owner });

      return responses.sendSuccessResponse(
        h,
        { playlistId },
        201,
        'Playlist berhasil ditambahkan',
      );
    } catch (error) {
      return error;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;

      const { id: credentialId } = request.auth.credentials;
      await this.service.verifyPlaylistOwner(id, credentialId);

      await this.service.deletePlaylistById(id);

      return responses.sendSuccessResponse(h, null, 200, 'Playlist berhasil dihapus');
    } catch (error) {
      return error;
    }
  }
}

module.exports = PlaylistsHandler;
