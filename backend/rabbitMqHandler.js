const amqp = require("amqplib/callback_api");
const { queueTypes } = require("./constant");

const getChannel = () =>
  new Promise((resolve, reject) => {
    amqp.connect(process.env.RABBIT_MQ_URL, function (error, connection) {
      if (error) {
        reject(error);
        return;
      }

      connection.createChannel(function (error1, channel) {
        if (error1) {
          reject(error1);
        }

        resolve(channel);
      });
    });
  });

const addToQueue = (channel, data, queueType = queueTypes.todoBasic) =>
  new Promise(async (resolve, reject) => {
    if (!data) reject({ message: "Data not found" });
    if (!channel) reject({ message: "channel not found" });

    const queue = queueType;
    try {
      channel.assertQueue(queue, {
        durable: true,
      });
      channel.sendToQueue(queue, Buffer.from("" + JSON.stringify(data)), {
        persistent: true,
      });
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });

module.exports = {
  getChannel,
  addToQueue,
};
