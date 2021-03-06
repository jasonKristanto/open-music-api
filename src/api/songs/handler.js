const responses = require('../../utils/responses');

class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.postSongHandler = this.postSongHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async getSongsHandler(request, h) {
    const songs = await this.service.getSongs();

    return responses.sendSuccessResponse(h, { songs });
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this.service.getSongById(id);

    return responses.sendSuccessResponse(h, { song });
  }

  async postSongHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    const {
      title, year, performer, genre, duration,
    } = request.payload;

    const songId = await this.service.addSong({
      title, year, performer, genre, duration,
    });

    return responses.sendSuccessResponse(h, { songId }, 201, 'Lagu berhasil ditambahkan');
  }

  async putSongByIdHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    const {
      title, year, performer, genre, duration,
    } = request.payload;
    const { id } = request.params;

    await this.service.editSongById(id, {
      title, year, performer, genre, duration,
    });

    return responses.sendSuccessResponse(h, null, 200, 'Lagu berhasil diperbarui');
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this.service.deleteSongById(id);

    return responses.sendSuccessResponse(h, null, 200, 'Lagu berhasil dihapus');
  }
}

module.exports = SongsHandler;
