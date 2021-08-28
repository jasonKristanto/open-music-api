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

const init = async () => {
  const songsService = new SongsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return responses.sendFailedResponse(h, 'fail', response.statusCode, response.message);
      }

      console.error(response);
      return responses.internalServerError(h);
    }

    return response.continue || response;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
