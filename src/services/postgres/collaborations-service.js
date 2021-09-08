const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/invariant-error');

class CollaborationsService {
  constructor() {
    this.pool = new Pool();
  }

  async addPlaylistCollaborator({ playlistId, userId }) {
    const id = `collab-${nanoid(16)}`;

    const result = await this.pool.query({
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    });

    if (!result.rowCount > 0) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deletePlaylistCollaborator({ playlistId, userId }) {
    const result = await this.pool.query({
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = CollaborationsService;
