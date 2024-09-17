const autoBind = require("auto-bind");
require("dotenv").config();

class UploadsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;
    const { albumId } = request.params;
    this.validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this.service.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${filename}`;
    await this.service.addCoverUrlToDatabase(coverUrl, albumId);

    const response = h.response({
      status: "success",
      message: "Sampul berhasil di unggah",
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
