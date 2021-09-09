const response = require('../../utils/responses');

class UploadsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    const { data } = request.payload;
    this.validator.validateImageHeaders(data.hapi.headers);

    const fileName = await this.service.writeFile(data, data.hapi);

    return response.sendSuccessResponse(h,
      { pictureUrl: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${fileName}` },
      201,
      'Gambar berhasil diunggah');
  }
}

module.exports = UploadsHandler;
