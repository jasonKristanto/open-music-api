const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {
    collaborationsService, collaborationsValidator, playlistsService,
  }) => {
    const authenticationsHandler = new CollaborationsHandler(
      collaborationsService, collaborationsValidator, playlistsService,
    );
    server.route(routes(authenticationsHandler));
  },
};
