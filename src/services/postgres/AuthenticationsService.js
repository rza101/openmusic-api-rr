/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationsService {
    constructor() {
        this._pool = new Pool();
    }

    async addRefreshToken(refreshToken) {
        await this._pool.query({
            text: 'INSERT INTO authentications VALUES ($1, NULL)',
            values: [refreshToken],
        });
    }

    async deleteRefreshToken(refreshToken) {
        // soft delete
        await this._pool.query({
            text: 'UPDATE authentications SET deleted_at = CURRENT_TIMESTAMP WHERE refresh_token = $1 AND deleted_at IS NULL',
            values: [refreshToken],
        });
    }

    async verifyRefreshToken(refreshToken) {
        const result = await this._pool.query({
            text: 'SELECT refresh_token FROM authentications WHERE refresh_token = $1 AND deleted_at IS NULL',
            values: [refreshToken],
        });

        if (result.rowCount !== 1) {
            throw new InvariantError('Invalid refresh token');
        }
    }
}

module.exports = AuthenticationsService;
