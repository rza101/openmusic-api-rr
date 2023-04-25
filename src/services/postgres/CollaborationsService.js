/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
    constructor() {
        this._pool = new Pool();
    }

    async addCollaboration({ playlistId, userId }) {
        const id = `collab_${nanoid(32)}`;

        // TODO Jadikan ini sebagai fungsi terpisah agar lebih clean,
        // sebaiknya satu fungsi hanya memiliki satu tanggungjawab
        const checkPlaylistResult = await this._pool.query({
            text: 'SELECT id FROM playlists WHERE id = $1',
            values: [playlistId],
        });

        const checkUserResult = await this._pool.query({
            text: 'SELECT id FROM users WHERE id = $1',
            values: [userId],
        });

        if (checkPlaylistResult.rows.length !== 1) {
            throw new NotFoundError('Failed to add collaboration (playlist not found)');
        }

        if (checkUserResult.rows.length !== 1) {
            throw new NotFoundError('Failed to add collaboration (user not found)');
        }

        const result = await this._pool.query({
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId],
        });

        if (result.rows.length !== 1) {
            throw new InvariantError('Failed to add collaboration');
        }

        return result.rows[0].id;
    }

    async verifyCollaboration(playlistId, userId) {
        const result = await this._pool.query({
            text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId],
        });

        if (result.rows.length !== 1) {
            throw new InvariantError('Collaboration not exists');
        }
    }

    async deleteCollaboration({ playlistId, userId }) {
        const result = await this._pool.query({
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId, userId],
        });

        if (result.rows.length !== 1) {
            throw new InvariantError('Failed to delete collaboration (not found)');
        }
    }
}

module.exports = CollaborationsService;
