/* eslint-disable no-underscore-dangle */
class AlbumsHandler {
    constructor(albumsService, albumLikesService, storageService, validator) {
        this._albumsService = albumsService;
        this._albumLikesService = albumLikesService;
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
        const { id } = request.params;
        const { cover } = request.payload;

        await this._albumsService.getAlbumById(id);
        this._validator.validateAlbumCoverHeader(cover.hapi.headers);

        const filename = await this._storageService.writeFile(cover, cover.hapi);

        this._albumsService.editAlbumCoverById(id, `http://${process.env.HOST}:${process.env.PORT}/albumcover/${filename}`);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });
        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request) {
        const { id } = request.params;
        const album = await this._albumsService.getAlbumById(id);

        return {
            status: 'success',
            data: {
                album,
            },
        };
    }

    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload);

        const { id } = request.params;
        await this._albumsService.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album updated successfully',
        };
    }

    async deleteAlbumByIdHandler(request) {
        const { id } = request.params;
        await this._albumsService.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album deleted successfully',
        };
    }

    async postAlbumLikeHandler(request, h) {
        const { id: albumId } = request.params;
        const { id: userIdCredential } = request.auth.credentials;

        await this._albumsService.getAlbumById(albumId);
        await this._albumLikesService.addAlbumLike(albumId, userIdCredential);

        const response = h.response({
            status: 'success',
            message: 'Album liked successfully',
        });
        response.code(201);
        return response;
    }

    async getAlbumLikesCountHandler(request, h) {
        const { id: albumId } = request.params;
        const likeCountResult = await this._albumLikesService.getAlbumLikesCount(albumId);

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
        const { id: userIdCredential } = request.auth.credentials;

        await this._albumsService.getAlbumById(albumId);
        await this._albumLikesService.deleteAlbumLike(albumId, userIdCredential);

        return {
            status: 'success',
            message: 'Album like removed successfully',
        };
    }
}

module.exports = AlbumsHandler;
