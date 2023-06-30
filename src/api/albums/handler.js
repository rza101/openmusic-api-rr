/* eslint-disable no-underscore-dangle */
class AlbumsHandler {
    constructor(albumsService, albumLikesService, songsService, storageService, validator) {
        this._albumsService = albumsService;
        this._albumLikesService = albumLikesService;
        this._songsService = songsService;
        this._storageService = storageService;
        this._validator = validator;
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);

        const albumId = await this._albumsService.addAlbum(request.payload);
        const response = h.response({
            status: 'success',
            message: 'Album added successfully',
            data: {
                albumId,
            },
        });
        response.code(201);

        return response;
    }

    async postAlbumCoverHandler(request, h) {
        const { id: albumId } = request.params;
        const { cover } = request.payload;

        await this._albumsService.getAlbumById(albumId);
        this._validator.validateAlbumCoverHeader(cover.hapi.headers);

        const filename = await this._storageService.writeFile(cover, cover.hapi);

        this._albumsService.editAlbumCoverById(albumId, `http://${process.env.HOST}:${process.env.PORT}/albumcover/${filename}`);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });
        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request) {
        const { id: albumId } = request.params;

        const album = await this._albumsService.getAlbumById(albumId);
        const albumSongs = await this._songsService.getSongByAlbumId(albumId);

        const result = album;
        result.songs = albumSongs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
        }));

        return {
            status: 'success',
            data: {
                album: result,
            },
        };
    }

    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload);

        await this._albumsService.editAlbumById(request.params.id, request.payload);

        return {
            status: 'success',
            message: 'Album updated successfully',
        };
    }

    async deleteAlbumByIdHandler(request) {
        await this._albumsService.deleteAlbumById(request.params.id);

        return {
            status: 'success',
            message: 'Album deleted successfully',
        };
    }

    async postAlbumLikeHandler(request, h) {
        const { id: albumId } = request.params;

        await this._albumsService.getAlbumById(albumId);
        await this._albumLikesService.addAlbumLike(albumId, request.auth.credentials.id);

        const response = h.response({
            status: 'success',
            message: 'Album liked successfully',
        });
        response.code(201);
        return response;
    }

    async getAlbumLikesCountHandler(request, h) {
        const likeCountResult = await this._albumLikesService.getAlbumLikesCount(request.params.id);

        const response = h.response({
            status: 'success',
            data: {
                likes: likeCountResult.likesCount,
            },
        });
        response.header('X-Data-Source', likeCountResult.isCache ? 'cache' : 'non-cache');
        return response;
    }

    async deleteAlbumLikeHandler(request) {
        const { id: albumId } = request.params;

        await this._albumsService.getAlbumById(albumId);
        await this._albumLikesService.deleteAlbumLike(albumId, request.auth.credentials.id);

        return {
            status: 'success',
            message: 'Album like removed successfully',
        };
    }
}

module.exports = AlbumsHandler;
