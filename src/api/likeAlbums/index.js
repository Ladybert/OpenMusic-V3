const LikeAlbumsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "like_albums",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const likeAlbumsHandler = new LikeAlbumsHandler(service, validator);
    server.route(routes(likeAlbumsHandler));
  },
};
