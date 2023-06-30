/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('album_likes', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        album_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'albums(id)',
            onDelete: 'CASCADE',
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
    });

    pgm.addConstraint('album_likes', 'album_likes_unique_album_id_and_user_id', 'UNIQUE(album_id, user_id)');
};

exports.down = (pgm) => {
    pgm.dropTable('album_likes');
};
