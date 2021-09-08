const responses = require('../../utils/responses');

class CollaborationsHandler {
  constructor(collaborationsService, collaborationsValidator, playlistService) {
    this.collaborationsService = collaborationsService;
    this.collaborationsValidator = collaborationsValidator;

    this.playlistService = playlistService;

    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteCollaborationsHandler = this.deleteCollaborationsHandler.bind(this);
  }

  async postCollaborationsHandler(request, h) {
    this.collaborationsValidator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistExist(playlistId);
    await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const collabId = await this.collaborationsService.addPlaylistCollaborator(
      { playlistId, userId },
    );

    return responses.sendSuccessResponse(
      h,
      { collabId },
      201,
      'Kolaborasi berhasil ditambahkan',
    );
  }

  async deleteCollaborationsHandler(request, h) {
    this.collaborationsValidator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistExist(playlistId);
    await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);

    await this.collaborationsService.deletePlaylistCollaborator({ playlistId, userId });

    return responses.sendSuccessResponse(h, null, 200, 'Kolaborasi berhasil dihapus');
  }
}

module.exports = CollaborationsHandler;
