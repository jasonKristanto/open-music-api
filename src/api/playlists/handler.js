const responses = require('../../utils/responses');

class PlaylistsHandler {
  constructor(playlistService, playlistValidator, playlistsSongsService, playlistsSongsValidator) {
    this.playlistService = playlistService;
    this.playlistValidator = playlistValidator;

    this.playlistsSongsService = playlistsSongsService;
    this.playlistsSongsValidator = playlistsSongsValidator;

    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);

    this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
    this.postSongsToPlaylistHandler = this.postSongsToPlaylistHandler.bind(this);
    this.deleteSongsFromPlaylistHandler = this.deleteSongsFromPlaylistHandler.bind(this);
  }

  async getPlaylistsHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this.playlistService.getPlaylists(owner);

    return responses.sendSuccessResponse(h, { playlists });
  }

  async postPlaylistHandler(request, h) {
    try {
      this.playlistValidator.validatePlaylistsValidator(request.payload);

      const { name } = request.payload;
      const { id: owner } = request.auth.credentials;

      const playlistId = await this.playlistService.addPlaylist({ name, owner });

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
      await this.playlistService.verifyPlaylistOwner(id, credentialId);

      await this.playlistService.deletePlaylistById(id);

      return responses.sendSuccessResponse(h, null, 200, 'Playlist berhasil dihapus');
    } catch (error) {
      return error;
    }
  }

  async postSongsToPlaylistHandler(request, h) {
    try {
      this.playlistsSongsValidator.validatePlaylistsSongsValidator(request.payload);

      const { playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this.playlistService.verifyPlaylistExist(playlistId);
      await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);

      await this.playlistsSongsService.addSongToPlaylist(
        { playlistId, songId },
      );

      return responses.sendSuccessResponse(
        h,
        null,
        201,
        'Lagu berhasil ditambahkan ke playlist',
      );
    } catch (error) {
      return error;
    }
  }

  async getSongsFromPlaylistHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this.playlistService.verifyPlaylistExist(playlistId);
      await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);

      const songs = await this.playlistsSongsService.getSongsFromPlaylistId({ playlistId });

      return responses.sendSuccessResponse(h, { songs });
    } catch (error) {
      return error;
    }
  }

  async deleteSongsFromPlaylistHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this.playlistService.verifyPlaylistExist(playlistId);
      await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);

      await this.playlistsSongsService.deleteSongFromPlaylist({ playlistId, songId });

      return responses.sendSuccessResponse(
        h,
        null,
        200,
        'Lagu berhasil dihapus dari playlist',
      );
    } catch (error) {
      return error;
    }
  }
}

module.exports = PlaylistsHandler;
