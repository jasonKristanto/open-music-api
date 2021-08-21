module.exports = {
  sendSuccessResponse: (h, data = null, statusCode = 200, message = null) => {
    const responseBody = {
      status: 'success',
    };

    if (data !== null) {
      responseBody.data = data;
    }

    if (message !== null) {
      responseBody.message = message;
    }

    const response = h.response(responseBody);
    response.code(statusCode);

    return response;
  },
  sendFailedResponse: (h, status, statusCode, message) => {
    const response = h.response({
      status,
      message,
    });

    response.code(statusCode);

    return response;
  },
  internalServerError: (h) => {
    const status = 'error';
    const statusCode = 500;
    const message = 'Maaf, terjadi kegagalan pada server kami.';

    return this.sendFailedResponse(h, status, statusCode, message);
  },
};
