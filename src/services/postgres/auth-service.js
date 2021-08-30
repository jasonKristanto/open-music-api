const { Pool } = require('pg');

const InvariantError = require('../../exceptions/invariant-error');

class AuthenticationsService {
  constructor() {
    this.pool = new Pool();
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this.pool.query(query);
  }

  async verifyRefreshToken(token) {
    const result = await this.pool.query({
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    });

    if (!result.rowCount) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    await this.verifyRefreshToken(token);

    await this.pool.query({
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    });
  }
}

module.exports = AuthenticationsService;
