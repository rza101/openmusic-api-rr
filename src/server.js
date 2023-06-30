require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Jwt = require('@hapi/jwt');
const path = require('path');

const ClientError = require('./exceptions/ClientError');

const AlbumsPlugin = require('./api/albums/index');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumLikesService = require('./services/postgres/AlbumLikesService');
const AlbumsValidator = require('./validators/albums/index');

const AuthenticationsPlugin = require('./api/authentications/index');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validators/authentications/index');

const CollaborationsPlugin = require('./api/collaborations/index');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validators/collaborations/index');

const ExportsPlugin = require('./api/exports/index');
const ExportsValidator = require('./validators/exports/index');

const PlaylistsPlugin = require('./api/playlists/index');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesService');
const PlaylistsValidator = require('./validators/playlists/index');

const ProducerService = require('./services/rabbitmq/ProducerService');

const SongsPlugin = require('./api/songs/index');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validators/songs/index');

const UsersPlugin = require('./api/users/index');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validators/users/index');

const { TokenManager } = require('./utils');
const StorageService = require('./services/storage/StorageService');
const CacheService = require('./services/redis/CacheService');

(async () => {
    const cacheService = new CacheService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/albums/uploads/file/album_covers'));

    const albumsService = new AlbumsService();
    const albumLikesService = new AlbumLikesService(cacheService);
    const authenticationsService = new AuthenticationsService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const playlistSongsService = new PlaylistSongsService();
    const playlistSongActivitiesService = new PlaylistSongActivitiesService();
    const songsService = new SongsService();
    const usersService = new UsersService();

    const server = Hapi.server({
        host: process.env.HOST,
        port: process.env.PORT,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE ?? 900,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: AuthenticationsPlugin,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
        {
            plugin: AlbumsPlugin,
            options: {
                albumsService,
                albumLikesService,
                songsService,
                storageService,
                validator: AlbumsValidator,
            },
        },
        {
            plugin: CollaborationsPlugin,
            options: {
                collaborationsService,
                playlistsService,
                usersService,
                validator: CollaborationsValidator,
            },
        },
        {
            plugin: ExportsPlugin,
            options: {
                ProducerService,
                playlistsService,
                validator: ExportsValidator,
            },
        },
        {
            plugin: PlaylistsPlugin,
            options: {
                playlistsService,
                playlistSongsService,
                playlistSongActivitiesService,
                songsService,
                validator: PlaylistsValidator,
            },
        },
        {
            plugin: SongsPlugin,
            options: {
                service: songsService,
                validator: SongsValidator,
            },
        },
        {
            plugin: UsersPlugin,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
    ]);

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
                console.log(response);
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
