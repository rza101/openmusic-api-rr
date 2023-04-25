const UsersHandler = require('./handler');
const userRoutes = require('./routes');

module.exports = {
    name: 'users',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        server.route(userRoutes(new UsersHandler(service, validator)));
    },
};
