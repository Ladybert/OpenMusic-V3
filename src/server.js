require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
// eslint-disable-next-line import/no-extraneous-dependencies
const Inert = require("@hapi/inert");
// eslint-disable-next-line no-unused-vars
const path = require("path");
const albums = require("./api/albums");
const songs = require("./api/songs");
const AlbumsService = require("./services/postgres/AlbumsService");
const SongsService = require("./services/postgres/SongsService");
const AlbumsValidator = require("./validator/albums");
const SongsValidator = require("./validator/songs");
const ClientError = require("./exceptions/ClientError");

// Users
const users = require("./api/users");
const UsersService = require("./services/postgres/UsersService");
const UsersValidator = require("./validator/users");

// Playlists
const playlists = require("./api/playlists");
const PlaylistsService = require("./services/postgres/PlaylistsService");
const PlaylistsValidator = require("./validator/playlists");

// authentications
const authentications = require("./api/authentications");
const AuthenticationsService = require("./services/postgres/AuthenticationsService");
const TokenManager = require("./tokenize/TokenManager");
const AuthenticationsValidator = require("./validator/authentications");

// collaborations
const collaborations = require("./api/collaborations");
const CollaborationsService = require("./services/postgres/CollaborationsService");
const CollaborationsValidator = require("./validator/collaborations");

// Exports
// eslint-disable-next-line no-unused-vars, no-underscore-dangle
const _exports = require("./api/exports");
const ProducerService = require("./services/rabbitmq/ProducerService");
const ExportsValidator = require("./validator/exports");

// uploads
const uploads = require("./api/uploads");
const StorageService = require("./services/storage/StorageService");
const UploadsValidator = require("./validator/uploads");

// likeAlbums
const likeAlbums = require("./api/likeAlbums");
const LikeAlbumsService = require("./services/postgres/AlbumLikesService");

// cache
const CacheService = require("./services/redis/CacheService");

const init = async () => {
  // Notes, Users, Auth, Collaborations, Exports, Uploads & Caching
  const cacheService = new CacheService();
  const collaborationsService = new CollaborationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const storageService = new StorageService(
    path.resolve(__dirname, "api/uploads/file/images/"),
  );
  const likeAlbumsService = new LikeAlbumsService(cacheService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    debug: {
      request: ["error"],
    },
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // Registrasi plugin eksternal (JWT)
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // Mendefinisikan strategi autentikasi JWT
  server.auth.strategy("open_music_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: ({ decoded }) => ({
      isValid: true,
      credentials: { id: decoded.payload.id },
    }),
  });

  await server.register([
    {
      plugin: users,
      options: { service: usersService, validator: UsersValidator },
    },
    {
      plugin: albums,
      options: { service: albumsService, validator: AlbumsValidator },
    },
    {
      plugin: songs,
      options: { service: songsService, validator: SongsValidator },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
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
        playlistsService,
        collaborationsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: likeAlbums,
      options: {
        service: likeAlbumsService,
      },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    // penanganan client error secara internal.
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
