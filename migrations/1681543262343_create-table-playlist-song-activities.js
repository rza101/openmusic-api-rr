/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('playlist_song_activities', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'playlists(id)',
            onDelete: 'CASCADE',
        },
        song_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        action: {
            type: 'VARCHAR(128)',
            nonNull: true,
        },
        time: {
            type: 'BIGINT',
            nonNull: true,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('playlist_song_activities');
};
