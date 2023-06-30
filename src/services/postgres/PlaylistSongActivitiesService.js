/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongActivitiesService {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylistSongActivity({
        playlistId,
        songId,
        userId,
        action,
    }) {
        const id = `psact_${nanoid(32)}`;
        const result = await this._pool.query({
            text: 'INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action, time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, userId, action, new Date().getTime()],
        });

        if (result.rowCount !== 1) {
            throw new InvariantError('Failed to add playlist activity');
        }

        return result.rows[0].id;
    }

    async getPlaylistSongActivities(playlistId) {
        const result = await this._pool.query({
            text: /* SQL */ `
                SELECT
                    users.username,
                    songs.title,
                    playlist_song_activities.action,
                    playlist_song_activities.time
                FROM playlist_song_activities
                INNER JOIN songs ON songs.id = playlist_song_activities.song_id
                INNER JOIN users ON users.id = playlist_song_activities.user_id
                WHERE playlist_song_activities.playlist_id = $1`,
            values: [playlistId],
        });

        return result.rows;
    }
}

module.exports = PlaylistSongActivitiesService;
