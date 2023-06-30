/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
    constructor() {
        this._pool = new Pool();
    }

    async addCollaboration({ playlistId, userId }) {
        const id = `collab_${nanoid(32)}`;

        const result = await this._pool.query({
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId],
        });

        if (result.rowCount !== 1) {
            throw new InvariantError('Failed to add collaboration');
        }

        return result.rows[0].id;
    }

    async verifyCollaboration(playlistId, userId) {
        const result = await this._pool.query({
            text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId],
        });

        if (result.rowCount !== 1) {
            throw new InvariantError('Collaboration not exists');
        }
    }

    async deleteCollaboration({ playlistId, userId }) {
        const result = await this._pool.query({
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId, userId],
        });

        if (result.rowCount !== 1) {
            throw new InvariantError('Failed to delete collaboration (not found)');
        }
    }
}

module.exports = CollaborationsService;
