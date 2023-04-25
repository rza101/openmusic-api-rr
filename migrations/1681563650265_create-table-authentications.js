/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('authentications', {
        refresh_token: {
            type: 'TEXT',
            notNull: true,
        },
        deleted_at: {
            type: 'TIMESTAMP',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('authentications');
};
