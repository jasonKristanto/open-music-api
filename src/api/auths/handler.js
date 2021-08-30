const responses = require('../../utils/responses');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this.authenticationsService = authenticationsService;
    this.usersService = usersService;
    this.tokenManager = tokenManager;
    this.validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      this.validator.validatePostAuthenticationPayload(request.payload);

      const { username, password } = request.payload;
      const id = await this.usersService.verifyUserCredential(username, password);

      const accessToken = this.tokenManager.generateAccessToken({ id });
      const refreshToken = this.tokenManager.generateRefreshToken({ id });

      await this.authenticationsService.addRefreshToken(refreshToken);

      return responses.sendSuccessResponse(
        h,
        { accessToken, refreshToken },
        201,
        'Authentication berhasil ditambahkan',
      );
    } catch (error) {
      return error;
    }
  }

  async putAuthenticationHandler(request, h) {
    try {
      this.validator.validatePutAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;

      await this.authenticationsService.verifyRefreshToken(refreshToken);

      const { id } = this.tokenManager.verifyRefreshToken(refreshToken);
      const accessToken = this.tokenManager.generateAccessToken({ id });

      return responses.sendSuccessResponse(
        h,
        { accessToken },
        200,
        'Authentication berhasil diperbarui',
      );
    } catch (error) {
      return error;
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      this.validator.validateDeleteAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;

      await this.authenticationsService.verifyRefreshToken(refreshToken);
      await this.authenticationsService.deleteRefreshToken(refreshToken);

      return responses.sendSuccessResponse(h, null, 200, 'Refresh token berhasil dihapus');
    } catch (error) {
      return error;
    }
  }
}

module.exports = AuthenticationsHandler;
