const autoBind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");

class UsersHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async getUsersByUsernameHandler(request, h) {
    try {
      const { username = "" } = request.query;
      const users = await this.service.getUsersByUsername(username);
      return {
        status: "success",
        data: {
          users,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postUserHandler(request, h) {
    this.validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this.service.addUser({
      username,
      password,
      fullname,
    });

    const response = h.response({
      status: "success",
      message: "User berhasil ditambahkan",
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }

  // eslint-disable-next-line no-unused-vars
  async getUserByIdHandler(request, h) {
    const { id } = request.params;

    const user = await this.service.getUserById(id);

    return {
      status: "success",
      data: {
        user,
      },
    };
  }
}

module.exports = UsersHandler;
