/* eslint-disable no-underscore-dangle */
class PlaylistsHandler {
    constructor(
        playlistsService,
        playlistSongsService,
        playlistSongActivitiesService,
        songsService,
        validator,
    ) {
        this._playlistsService = playlistsService;
        this._playlistSongsService = playlistSongsService;
        this._playlistSongActivitiesService = playlistSongActivitiesService;
        this._songsService = songsService;
        this._validator = validator;
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);

        const playlistId = await this._playlistsService.addPlaylist({
            name: request.payload.name,
            owner: request.auth.credentials.id,
        });

        const response = h.response({
            status: 'success',
            message: 'Playlist added successfully',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request) {
        const playlists = await this._playlistsService.getPlaylists(request.auth.credentials.id);

        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistByIdHandler(request) {
        const { id: playlistId } = request.params;

        await this._playlistsService.verifyPlaylistOwner(playlistId, request.auth.credentials.id);
        await this._playlistsService.deletePlaylistById(playlistId);

        return {
            status: 'success',
            message: 'Playlist deleted successfully',
        };
    }

    async postPlaylistSongByIdHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);

        const { id: playlistId } = request.params;
        const { id: userIdCredential } = request.auth.credentials;
        const { songId } = request.payload;

        await this._playlistsService.verifyPlaylistAccess(playlistId, userIdCredential);

        await this._songsService.getSongById(songId);
        await this._playlistSongsService.addPlaylistSong({ playlistId, songId });
        await this._playlistSongActivitiesService.addPlaylistSongActivity({
            playlistId,
            songId,
            userId: userIdCredential,
            action: 'add',
        });

        const response = h.response({
            status: 'success',
            message: 'Playlist song added successfully',
        });
        response.code(201);
        return response;
    }

    async getPlaylistsSongsByIdHandler(request) {
        const { id: playlistId } = request.params;

        await this._playlistsService.verifyPlaylistAccess(playlistId, request.auth.credentials.id);

        const result = await this._playlistSongsService.getPlaylistSongs(playlistId);

        return {
            status: 'success',
            data: {
                playlist: result,
            },
        };
    }

    async deletePlaylistSongByIdHandler(request) {
        this._validator.validatePlaylistSongPayload(request.payload);

        const { id: playlistId } = request.params;
        const { id: userIdCredential } = request.auth.credentials;
        const { songId } = request.payload;

        await this._playlistsService.verifyPlaylistAccess(playlistId, userIdCredential);
        await this._playlistSongsService.deletePlaylistSong({ playlistId, songId });
        await this._playlistSongActivitiesService.addPlaylistSongActivity({
            playlistId,
            songId,
            userId: userIdCredential,
            action: 'delete',
        });

        return {
            status: 'success',
            message: 'Playlist song deleted successfully',
        };
    }

    async getPlaylistActivitiesByIdHandler(request) {
        const { id: playlistId } = request.params;

        await this._playlistsService.verifyPlaylistAccess(playlistId, request.auth.credentials.id);

        const result = await this._playlistSongActivitiesService
            .getPlaylistSongActivities(playlistId);

        return {
            status: 'success',
            data: {
                playlistId,
                activities: result,
            },
        };
    }
}

module.exports = PlaylistsHandler;
