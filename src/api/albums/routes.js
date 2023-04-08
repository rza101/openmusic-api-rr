const albumRoutes = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: (req, h) => handler.postAlbumHandler(req, h),
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: (req, h) => handler.getAlbumByIdHandler(req, h),
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: (req, h) => handler.putAlbumByIdHandler(req, h),
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: (req, h) => handler.deleteAlbumByIdHandler(req, h),
    },
];

module.exports = albumRoutes;
