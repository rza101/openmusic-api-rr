const CollaborationsHandler = require('./handler');
const collaborationRoutes = require('./routes');

module.exports = {
    name: 'collaborations',
    version: '1.0.0',
    register: async (server, {
        collaborationsService,
        playlistsService,
        validator,
    }) => {
        server.route(collaborationRoutes(new CollaborationsHandler(
            collaborationsService,
            playlistsService,
            validator,
        )));
    },
};
