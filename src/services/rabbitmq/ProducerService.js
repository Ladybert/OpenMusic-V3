// eslint-disable-next-line import/no-extraneous-dependencies
const amqp = require("amqplib");
const config = require("../../utils/config");
const InvariantError = require("../../exceptions/InvariantError");

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
};

module.exports = ProducerService;
