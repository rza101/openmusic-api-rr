const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, AlbumCoverHeadersSchema } = require('./schema');

const AlbumsValidator = {
    validateAlbumPayload: (payload) => {
        const result = AlbumPayloadSchema.validate(payload);

        if (result.error) {
            throw new InvariantError(result.error.message);
        }
    },
    validateAlbumCoverHeader: (payload) => {
        const result = AlbumCoverHeadersSchema.validate(payload);

        if (result.error) {
            throw new InvariantError(result.error.message);
        }
    },
};

module.exports = AlbumsValidator;
