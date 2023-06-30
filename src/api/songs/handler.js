/* eslint-disable no-underscore-dangle */
class SongsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
    }

    async postSongHandler(request, h) {
        this._validator.validateSongPayload(request.payload);

        const songId = await this._service.addSong(request.payload);
        const response = h.response({
            status: 'success',
            message: 'Song added successfully',
            data: {
                songId,
            },
        });
        response.code(201);

        return response;
    }

    async getSongsHandler(request) {
        const songs = await this._service.getSongs(request.query);
        return {
            status: 'success',
            data: {
                songs,
            },
        };
    }

    async getSongByIdHandler(request) {
        const song = await this._service.getSongById(request.params.id);

        return {
            status: 'success',
            data: {
                song,
            },
        };
    }

    async putSongByIdHandler(request) {
        this._validator.validateSongPayload(request.payload);

        await this._service.editSongById(request.params.id, request.payload);

        return {
            status: 'success',
            message: 'Song updated successfully',
        };
    }

    async deleteSongByIdHandler(request) {
        await this._service.deleteSongById(request.params.id);

        return {
            status: 'success',
            message: 'Song deleted successfully',
        };
    }
}

module.exports = SongsHandler;
