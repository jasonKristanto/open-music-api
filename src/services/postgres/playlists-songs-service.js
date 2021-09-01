const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapSongsTableToModel } = require('../../utils/models/songs');

const AuthorizationError = require('../../exceptions/authorizations-error');
const InvariantError = require('../../exceptions/invariant-error');
const NotFoundError = require('../../exceptions/not-found-error');

class PlaylistsSongsService {
  constructor() {
    this.pool = new Pool();
  }

  async getSongsFromPlaylistId({ playlistId }) {
    const result = await this.pool.query({
      text: `SELECT songs.id as id, songs.title as title, songs.performer as performer
      FROM playlists_songs
      JOIN songs ON songs.id = playlists_songs.song_id
      WHERE playlists_songs.playlist_id = $1`,
      values: [playlistId],
    });

    if (!result.rowCount > 0) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows.map(mapSongsTableToModel);
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `playlist_song-${nanoid(10)}`;

    const result = await this.pool.query({
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    });

    if (!result.rowCount > 0) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }
  }

  async deleteSongFromPlaylist({ playlistId, songId }) {
    const result = await this.pool.query({
      text: 'DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Lagu di dalam playlist gagal dihapus. Id tidak ditemukan');
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
}

module.exports = PlaylistsSongsService;
