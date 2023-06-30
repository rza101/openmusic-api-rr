/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylistSong({ playlistId, songId }) {
        const id = `psong_${nanoid(32)}`;

        const result = await this._pool.query({
            text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        });

        if (result.rowCount !== 1) {
            throw new InvariantError('Failed to add playlist song');
        }

        return result.rows[0].id;
    }

    async getPlaylistSongs(playlistId) {
        const result = await this._pool.query({
            text: /* SQL */`
            SELECT playlists.id, playlists.name, users.username
            FROM playlists
            INNER JOIN users 
            ON users.id = playlists.owner
            WHERE playlists.id = $1`,
            values: [playlistId],
        });

        if (result.rowCount !== 1) {
            throw new NotFoundError('Playlist not found');
        }

        const finalResult = result.rows[0];

        const playlistSongsResult = await this._pool.query({
            text: /* SQL */ `
                SELECT songs.id, songs.title, songs.performer
                FROM songs
                LEFT JOIN playlist_songs
                ON playlist_songs.song_id = songs.id
                WHERE playlist_songs.playlist_id = $1`,
            values: [playlistId],
        });

        finalResult.songs = playlistSongsResult.rows;

        return finalResult;
    }

    async deletePlaylistSong({ playlistId, songId }) {
        const result = await this._pool.query({
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        });

        if (result.rowCount !== 1) {
            throw new InvariantError('Failed to delete playlist song (playlist or song not found)');
        }
    }
}

module.exports = PlaylistSongsService;
