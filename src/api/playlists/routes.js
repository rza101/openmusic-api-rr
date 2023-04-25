const playlistRoutes = (handler) => [
    {
        method: 'POST',
        path: '/playlists',
        handler: (req, h) => handler.postPlaylistHandler(req, h),
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists',
        handler: (req, h) => handler.getPlaylistsHandler(req, h),
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}',
        handler: (req, h) => handler.deletePlaylistByIdHandler(req, h),
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{id}/activities',
        handler: (req, h) => handler.getPlaylistActivitiesByIdHandler(req, h),
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'POST',
        path: '/playlists/{id}/songs',
        handler: (req, h) => handler.postPlaylistSongByIdHandler(req, h),
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{id}/songs',
        handler: (req, h) => handler.getPlaylistsSongsByIdHandler(req, h),
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}/songs',
        handler: (req, h) => handler.deletePlaylistSongByIdHandler(req, h),
        options: {
            auth: 'openmusic_jwt',
        },
    },
];

module.exports = playlistRoutes;
