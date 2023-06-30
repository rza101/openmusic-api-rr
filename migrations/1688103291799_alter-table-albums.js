/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.addColumns('albums', {
        cover_url: {
            type: 'text',
            notNull: false,
        },
    }, {
        ifNotExists: true,
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('albums', 'cover_url', { ifExists: true });
};
