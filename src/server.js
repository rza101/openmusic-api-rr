require('dotenv').config();

const Hapi = require('@hapi/hapi');
const albumsPlugin = require('./api/albums/index');
const songsPlugin = require('./api/songs/index');
const ClientError = require('./exceptions/ClientError');
const AlbumsService = require('./services/postgres/AlbumsServices');
const SongsService = require('./services/postgres/SongsServices');
const AlbumValidator = require('./validators/albums/index');
const SongValidator = require('./validators/songs/index');

(async () => {
    const server = Hapi.server({
        host: process.env.HOST,
        port: process.env.PORT,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register({
        plugin: albumsPlugin,
        options: {
            service: new AlbumsService(),
            validator: AlbumValidator,
        },
    });

    await server.register({
        plugin: songsPlugin,
        options: {
            service: new SongsService(),
            validator: SongValidator,
        },
    });

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
            // ClientError emitted
            if (response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                });
                newResponse.code(response.statusCode);
                return newResponse;
            }

            // server error emitted (>= 500)
            if (response.isServer) {
                const newResponse = h.response({
                    status: 'error',
                    message: 'Unexpected Server Error',
                });
                newResponse.code(500);
                return newResponse;
            }
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server is running on ${server.info.uri}`);
})();
