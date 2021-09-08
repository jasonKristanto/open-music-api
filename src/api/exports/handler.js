const responses = require('../../utils/responses');

class ExportsHandler {
  constructor(exportsService, playlistService, validator) {
    this.exportsService = exportsService;
    this.playlistService = playlistService;
    this.validator = validator;

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this.validator.validateExportPlaylistsPayload(request.payload);

    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistExist(playlistId);
    await this.playlistService.verifyPlaylistAccess(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this.exportsService.sendMessage('export:playlists', JSON.stringify(message));

    return responses.sendSuccessResponse(
      h,
      null,
      201,
      'Permintaan Anda sedang kami proses',
    );
  }
}

module.exports = ExportsHandler;
