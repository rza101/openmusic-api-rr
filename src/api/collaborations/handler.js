/* eslint-disable no-underscore-dangle */
class CollaborationsHandler {
    constructor(collaborationsService, playlistsService, usersService, validator) {
        this._collaborationsService = collaborationsService;
        this._playlistsService = playlistsService;
        this._usersService = usersService;
        this._validator = validator;
    }

    async postCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);

        const { id: userIdCredential } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        await this._playlistsService.verifyPlaylistOwner(playlistId, userIdCredential);

        await this._playlistsService.getPlaylistById(playlistId);
        await this._usersService.getUserById(userId);

        const collaborationId = await this._collaborationsService.addCollaboration(request.payload);

        const response = h.response({
            status: 'success',
            message: 'Collaboration added successfully',
            data: {
                collaborationId,
            },
        });
        response.code(201);
        return response;
    }

    async deleteCollaborationHandler(request) {
        this._validator.validateCollaborationPayload(request.payload);

        await this._playlistsService.verifyPlaylistOwner(
            request.payload.playlistId,
            request.auth.credentials.id,
        );
        await this._collaborationsService.deleteCollaboration(request.payload);

        return {
            status: 'success',
            message: 'Collaboration deleted successfully',
        };
    }
}

module.exports = CollaborationsHandler;
