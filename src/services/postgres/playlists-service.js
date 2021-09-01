const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapPlaylistsTableToModel } = require('../../utils/models/playlists');

const AuthorizationError = require('../../exceptions/authorizations-error');
const InvariantError = require('../../exceptions/invariant-error');
const NotFoundError = require('../../exceptions/not-found-error');

class PlaylistsService {
  constructor() {
    this.pool = new Pool();
  }

  async getPlaylists(owner) {
    const result = await this.pool.query({
      text: `SELECT playlists.id as id, playlists.name as name, users.username as username 
      FROM playlists
      JOIN users ON users.id = playlists.owner
      WHERE owner = $1`,
      values: [owner],
    });

    if (!result.rowCount > 0) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows.map(mapPlaylistsTableToModel);
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const result = await this.pool.query({
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    });

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deletePlaylistById(id) {
    const result = await this.pool.query({
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const result = await this.pool.query({
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistExist(playlistId) {
    const result = await this.pool.query({
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    });

    if (!result.rowCount > 0) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
