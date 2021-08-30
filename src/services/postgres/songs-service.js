const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapSongsTableToModel, mapSongTableToModel } = require('../../utils/models');

const InvariantError = require('../../exceptions/invariant-error');
const NotFoundError = require('../../exceptions/not-found-error');

class SongsService {
  constructor() {
    this.pool = new Pool();
  }

  async getSongs() {
    const result = await this.pool.query('SELECT id, title, performer FROM songs');
    return result.rows.map(mapSongsTableToModel);
  }

  async getSongById(id) {
    const result = await this.pool.query({
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapSongTableToModel)[0];
  }

  async addSong({
    title, year, performer, genre, duration,
  }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();

    const result = await this.pool.query({
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, title, year, performer, genre, duration, insertedAt, insertedAt],
    });

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async editSongById(id, {
    title, year, performer, genre, duration,
  }) {
    const updatedAt = new Date().toISOString();

    const result = await this.pool.query({
      text: 'UPDATE songs SET '
              + 'title = $1, '
              + 'year = $2, '
              + 'performer = $3, '
              + 'genre = $4, '
              + 'duration = $5, '
              + 'updated_at = $6 '
            + 'WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal diperbarui. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const result = await this.pool.query({
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
