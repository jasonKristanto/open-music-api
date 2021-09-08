require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// exceptions
const ClientError = require('./exceptions/client-error');

// utils
const responses = require('./utils/responses');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/songs-service');
const SongsValidator = require('./validator/songs');

// playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/playlists-service');
const PlaylistsValidator = require('./validator/playlists');

// playlists-songs
const PlaylistsSongsService = require('./services/postgres/playlists-songs-service');
const PlaylistsSongsValidator = require('./validator/playlists-songs');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/users-service');
const UsersValidator = require('./validator/users');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/collaborations-service');
const CollaborationsValidator = require('./validator/collaborations');

// authentications
const authentications = require('./api/auths');
const AuthenticationsService = require('./services/postgres/auth-service');
const TokenManager = require('./tokenize/token-manager');
const AuthenticationsValidator = require('./validator/auths');

// exports
const exportsPlugin = require('./api/exports');
const ProducerService = require('./services/rabbitmq/producer-service');
const ExportsValidator = require('./validator/exports');

const init = async () => {
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService();
  const playlistsSongsService = new PlaylistsSongsService();

  const usersService = new UsersService();
  const collaborationsService = new CollaborationsService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
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
  ]);

  server.auth.strategy('musicsapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
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
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        playlistsValidator: PlaylistsValidator,
        playlistsSongsService,
        playlistsSongsValidator: PlaylistsSongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        collaborationsValidator: CollaborationsValidator,
        playlistsService,
      },
    },
    {
      plugin: exportsPlugin,
      options: {
        exportsService: ProducerService,
        playlistService: playlistsService,
        validator: ExportsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      return responses.sendFailedResponse(h, 'fail', response.statusCode, response.message);
    }

    if (response instanceof Error) {
      const { statusCode } = response.output;

      if (statusCode === 500) {
        return responses.internalServerError(h);
      }
    }

    return response.continue || response;
  });

  await server.start();
};

init();
