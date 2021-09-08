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
    const { id: userId } = request.auth.credentials;
    const playlists = await this.playlistService.getPlaylists(userId);

    return responses.sendSuccessResponse(h, { playlists });
  }

  async postPlaylistHandler(request, h) {
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
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;

    const { id: credentialId } = request.auth.credentials;
    await this.playlistService.verifyPlaylistOwner(id, credentialId);

    await this.playlistService.deletePlaylistById(id);

    return responses.sendSuccessResponse(h, null, 200, 'Playlist berhasil dihapus');
  }

  async postSongsToPlaylistHandler(request, h) {
    this.playlistsSongsValidator.validatePlaylistsSongsValidator(request.payload);

    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistExist(playlistId);
    await this.playlistService.verifyPlaylistAccess(playlistId, credentialId);

    await this.playlistsSongsService.addSongToPlaylist(
      { playlistId, songId },
    );

    return responses.sendSuccessResponse(
      h,
      null,
      201,
      'Lagu berhasil ditambahkan ke playlist',
    );
  }

  async getSongsFromPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistExist(playlistId);
    await this.playlistService.verifyPlaylistAccess(playlistId, credentialId);

    const songs = await this.playlistsSongsService.getSongsFromPlaylistId({ playlistId });

    return responses.sendSuccessResponse(h, { songs });
  }

  async deleteSongsFromPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistExist(playlistId);
    await this.playlistService.verifyPlaylistAccess(playlistId, credentialId);

    await this.playlistsSongsService.deleteSongFromPlaylist({ playlistId, songId });

    return responses.sendSuccessResponse(
      h,
      null,
      200,
      'Lagu berhasil dihapus dari playlist',
    );
  }
}

module.exports = PlaylistsHandler;
