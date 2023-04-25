const PlaylistsHandler = require('./handler');
const playlistRoutes = require('./routes');

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, {
        playlistsService,
        playlistSongsService,
        playlistSongActivitiesService,
        validator,
    }) => {
        server.route(playlistRoutes(new PlaylistsHandler(
            playlistsService,
            playlistSongsService,
            playlistSongActivitiesService,
            validator,
        )));
    },
};
