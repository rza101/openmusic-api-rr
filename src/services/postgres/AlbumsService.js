/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumsDBToAlbumsModel } = require('../../utils');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        const id = `album_${nanoid(32)}`;

        const result = await this._pool.query({
            text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, year],
        });

        if (result.rowCount !== 1) {
            throw new InvariantError('Failed to add album');
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const result = await this._pool.query({
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        });

        if (result.rowCount !== 1) {
            throw new NotFoundError('Album not found');
        }

        return result.rows.map(mapAlbumsDBToAlbumsModel)[0];
    }

    async editAlbumById(id, { name, year }) {
        const result = await this._pool.query({
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        });

        if (result.rowCount !== 1) {
            throw new NotFoundError('Failed to edit album (not found)');
        }
    }

    async editAlbumCoverById(id, coverUrl) {
        const result = await this._pool.query({
            text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
            values: [coverUrl, id],
        });

        if (result.rowCount !== 1) {
            throw new NotFoundError('Failed to edit album (not found)');
        }
    }

    async deleteAlbumById(id) {
        const result = await this._pool.query({
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        });

        if (result.rowCount !== 1) {
            throw new NotFoundError('Failed to delete album (not found)');
        }
    }
}

module.exports = AlbumsService;
