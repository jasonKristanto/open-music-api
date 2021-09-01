const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options: {
      auth: 'musicsapp_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
    options: {
      auth: 'musicsapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: 'musicsapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: handler.getSongsFromPlaylistHandler,
    options: {
      auth: 'musicsapp_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: handler.postSongsToPlaylistHandler,
    options: {
      auth: 'musicsapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/songs',
    handler: handler.deleteSongsFromPlaylistHandler,
    options: {
      auth: 'musicsapp_jwt',
    },
  },
];

module.exports = routes;
