const path = require("path");

const routes = (handler) => [
  {
    method: "POST",
    path: "/albums/{albumId}/covers",
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        allow: "multipart/form-data",
        maxBytes: 500000,
        multipart: true,
        output: "stream",
        parse: true,
      },
    },
  },
  {
    method: "GET",
    path: "/albums/file/images/{param*}",
    handler: {
      directory: {
        path: path.resolve(__dirname, "./src/api/albums/file/images/"),
      },
    },
  },
];

module.exports = routes;
