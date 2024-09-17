const routes = (handler) => [
  {
    method: "POST",
    path: "/albums/{albumId}/likes",
    handler: handler.postLikeAlbumByIdHandler,
    options: {
      auth: "open_music_jwt",
    },
  },
  {
    method: "GET",
    path: "/albums/{albumId}/likes",
    handler: handler.getLikeAlbumsByIdHandler,
  },
  {
    method: "DELETE",
    path: "/albums/{albumId}/likes",
    handler: handler.removeLikeFromAlbumByIdHandler,
    options: {
      auth: "open_music_jwt",
    },
  },
];

module.exports = routes;
