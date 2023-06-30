/* eslint-disable no-underscore-dangle */
class ExportsHandler {
    constructor(producerService, playlistsService, validator) {
        this._producerService = producerService;
        this._playlistsService = playlistsService;
        this._validator = validator;
    }

    async postExportPlaylistHandler(request, h) {
        await this._validator.validateExportPayload(request.payload);

        const { playlistId } = request.params;
        const { targetEmail } = request.payload;
        const { id: userIdCredential } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(playlistId, userIdCredential);

        await this._producerService.sendMessage('export:playlist', JSON.stringify({
            playlistId,
            targetEmail,
        }));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;
