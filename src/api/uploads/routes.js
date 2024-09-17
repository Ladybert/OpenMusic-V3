const path = require("path");

const routes = (handler) => [
  {
    method: "POST",
    path: "/albums/{albumId}/covers",
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        allow: "multipart/form-data",
        maxBytes: 512000,
        multipart: true,
        output: "stream",
        parse: true,
      },
    },
  },
  {
    method: "GET",
    path: "/albums/{param*}",
    handler: {
      directory: {
        path: path.resolve(__dirname, "file"),
      },
    },
  },
];

module.exports = routes;
