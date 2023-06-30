/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumLikesService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addAlbumLike(albumId, userId) {
        const id = `albumlike-${nanoid(16)}`;
        const checkResult = await this._pool.query({
            text: 'SELECT * FROM album_likes WHERE album_id = $1 AND user_id = $2',
            values: [albumId, userId],
        });

        if (checkResult.rowCount !== 0) {
            throw new InvariantError('Album already liked');
        }

        const insertResult = await this._pool.query({
            text: 'INSERT INTO album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, albumId, userId],
        });

        if (insertResult.rowCount !== 1) {
            throw new InvariantError('Failed to like album');
        }

        await this._cacheService.deleteItem(`albumlikes-${albumId}`);
        return insertResult.rows[0].id;
    }

    async getAlbumLikesCount(albumId) {
        const cachedLikesCount = await this._cacheService.getItem(`albumlikes-${albumId}`);

        if (cachedLikesCount !== null) {
            return {
                isCache: true,
                likesCount: JSON.parse(cachedLikesCount),
            };
        }

        const result = await this._pool.query({
            text: 'SELECT * FROM album_likes WHERE album_id = $1',
            values: [albumId],
        });
        const likesCount = result.rowCount;
        await this._cacheService.setItem(`albumlikes-${albumId}`, likesCount);

        return {
            isCache: false,
            likesCount,
        };
    }

    async deleteAlbumLike(albumId, userId) {
        const result = await this._pool.query({
            text: 'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
            values: [albumId, userId],
        });

        if (result.rowCount !== 1) {
            throw new InvariantError('Failed to dislike album');
        }

        await this._cacheService.deleteItem(`albumlikes-${albumId}`);
    }
}

module.exports = AlbumLikesService;
