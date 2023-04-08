const AlbumsHandler = require('./handler');
const albumRoutes = require('./routes');

module.exports = {
    name: 'albums',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        server.route(albumRoutes(new AlbumsHandler(service, validator)));
    },
};
