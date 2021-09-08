const responses = require('../../utils/responses');

class UsersHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this.validator.validateUserPayload(request.payload);

    const { username, password, fullname } = request.payload;
    const userId = await this.service.addUser({ username, password, fullname });

    return responses.sendSuccessResponse(h, { userId }, 201, 'User berhasil ditambahkan');
  }

  async getUserByIdHandler(request, h) {
    const { id } = request.params;

    const user = await this.service.getUserById(id);

    return responses.sendSuccessResponse(h, { user });
  }
}

module.exports = UsersHandler;
