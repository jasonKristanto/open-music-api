require('dotenv').config();

const Hapi = require('@hapi/hapi');

// exceptions
const ClientError = require('./exceptions/ClientError');

// utils
const responses = require('./utils/responses');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/songs-service');
const SongsValidator = require('./validator/songs');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/users-service');
const UsersValidator = require('./validator/users');

const init = async () => {
  const songsService = new SongsService();
  const usersService = new UsersService();

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
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return responses.sendFailedResponse(h, 'fail', response.statusCode, response.message);
      }

      return responses.internalServerError(h);
    }

    return response.continue || response;
  });

  await server.start();
};

init();
