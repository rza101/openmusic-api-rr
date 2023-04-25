/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('collaborations', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
            references: 'playlists(id)',
            onDelete: 'CASCADE',
        },
        user_id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
    });

    pgm.addConstraint('collaborations', 'collaborations_unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');
};

exports.down = (pgm) => {
    pgm.dropTable('collaborations');
};
