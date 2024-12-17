import amqp from "amqplib";
import { config } from "@/config";
import { log } from "utils/log";

export type RABBIT_MESSAGE = {
  title: string;
  message: string;
  topic: string;
};

export type RABBIT_TOPIC = {
  type: "SUBSCRIBE" | "UNSUBSCRIBE";
  topic: string;
  deviceTokens: string[];
};

let channel: amqp.Channel;

async function createChannel() {
  const connection = await amqp.connect(config.RABBIT_MQ_URL);
  channel = await connection.createChannel();
}

async function publishMessage(
  queueName: string,
  message: RABBIT_MESSAGE | RABBIT_TOPIC
) {
  if (!channel) {
    await createChannel();
  }

  await channel.assertExchange(config.RABBIT_MQ_EXCHANGE, "direct", {
    durable: false,
  });

  if (channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message))))
    log.info(`Message sent to ${queueName}`);
  else log.error(`Message not sent to ${queueName}`);
}

export { publishMessage };
