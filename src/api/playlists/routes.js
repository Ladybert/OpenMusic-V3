const routes = (handler) => [
  {
    method: "POST",
    path: "/playlists",
    handler: handler.addPlaylistHandler,
    options: {
      auth: "open_music_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists",
    handler: handler.getPlaylistsHandler,
    options: {
      auth: "open_music_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{playlistId}",
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: "open_music_jwt",
    },
  },
  {
    method: "POST",
    path: "/playlists/{playlistId}/songs",
    handler: handler.addSongToPlaylistByIdHandler,
    options: {
      auth: "open_music_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{playlistId}/songs",
    handler: handler.getSongsFromPlaylisByIdHandler,
    options: {
      auth: "open_music_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{playlistId}/songs",
    handler: handler.deleteSongsFromPlaylistByIdHandler,
    options: {
      auth: "open_music_jwt",
    },
  },
];

module.exports = routes;
