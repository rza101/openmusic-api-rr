/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
    constructor(collaborationsService) {
        this._pool = new Pool();
        this._collaborationsService = collaborationsService;
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist_${nanoid(32)}`;

        const result = await this._pool.query({
            text: 'INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        });

        if (result.rows.length !== 1) {
            throw new InvariantError('Failed to add playlist');
        }

        return result.rows[0].id;
    }

    async getPlaylists(userId) {
        const result = await this._pool.query({
            text: /* SQL */`
                SELECT playlists.id, playlists.name, users.username FROM playlists
                LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                INNER JOIN users ON users.id = playlists.owner
                WHERE playlists.owner = $1 OR collaborations.user_id = $1
                GROUP BY playlists.id, users.username`,
            values: [userId],
        });

        return result.rows;
    }

    async deletePlaylistById(id) {
        const result = await this._pool.query({
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        });

        if (result.rows.length !== 1) {
            throw new InvariantError('Failed to delete playlist (not found)');
        }
    }

    async verifyPlaylistOwner(playlistId, userId) {
        const result = await this._pool.query({
            text: 'SELECT id, owner FROM playlists WHERE id = $1',
            values: [playlistId],
        });

        if (result.rows.length !== 1) {
            throw new NotFoundError('Playlist not found');
        }

        if (result.rows[0].owner !== userId) {
            throw new AuthorizationError('Playlist access denied');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationsService.verifyCollaboration(playlistId, userId);
            } catch (e) {
                throw error;
            }
        }
    }
}

module.exports = PlaylistService;
