/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        const id = `album_${nanoid(32)}`;

        const query = {
            text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, year],
        };

        const result = await this._pool.query(query);

        // TODO Kamu bisa menggunakan result.rowCount untuk
        // menggantikan penggunaan result.rows.length. Karena sintaksnya lebih singkat
        if (result.rows.length !== 1) {
            throw new InvariantError('Failed to add album');
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const queryAlbum = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };
        const resultAlbum = await this._pool.query(queryAlbum);

        if (resultAlbum.rows.length !== 1) {
            throw new NotFoundError('Album not found');
        }

        // TODO Agar code menjadi lebih clean, sebaiknya fungsi ini
        // hanya melakukan query data album saja. Kamu dapat membuat fungsi
        // query songs by album id di song service, lalu panggil dan gabungkan datanya pada handler.
        const querySongs = {
            text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
            values: [id],
        };
        const resultSongs = await this._pool.query(querySongs);

        const result = resultAlbum.rows[0];
        result.songs = resultSongs.rows;

        return result;
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        };
        const result = await this._pool.query(query);

        if (result.rows.length !== 1) {
            throw new NotFoundError('Failed to edit album (not found)');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };
        const result = await this._pool.query(query);

        if (result.rows.length !== 1) {
            throw new NotFoundError('Failed to delete album (not found)');
        }
    }
}

module.exports = AlbumsService;
