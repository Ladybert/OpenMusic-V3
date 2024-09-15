// eslint-disable-next-line import/no-extraneous-dependencies
const amqp = require("amqplib");
const { Pool } = require("pg");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const config = require("../../utils/config");
const InvariantError = require("../../exceptions/InvariantError");

const pool = new Pool();

const ProducerService = {
  sendMessage: async (queue, message) => {
    let connection;
    try {
      connection = await amqp.connect(config.rabbitMq.server);
      const channel = await connection.createChannel();
      await channel.assertQueue(queue, { durable: true });
      await channel.sendToQueue(queue, Buffer.from(message));
      console.log(`Message sent to queue ${queue}`);
    } catch (error) {
      console.error(`Error sending message to queue ${queue}:`, error);
      throw new InvariantError("Gagal mengirim pesan ke queue");
    } finally {
      if (connection) {
        try {
          setTimeout(() => {
            connection.close().catch(console.error);
          }, 1000);
        } catch (closeError) {
          console.error("Error closing connection:", closeError);
        }
      }
    }
  },
  verifyPlaylistIfExists: async (playlistId) => {
    if (!pool) {
      throw new InvariantError("Database pool not initialized");
    }

    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [playlistId],
    };
    const result = await pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
  },

  verifyPlaylistOwner: async (playlistId, owner) => {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [playlistId],
    };
    const result = await pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  },
};

module.exports = ProducerService;
