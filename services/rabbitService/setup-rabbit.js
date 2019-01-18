import amqp from 'amqplib';
import log from 'cf-nodejs-logging-support';

const setupRabbit = async (sMessagingserviceUri) => {
  let channel;

  try {
    channel = await connectToRabbitMQ(sMessagingserviceUri);
    channel.assertExchange('NewMessageExchange', 'fanout', { durable: true });
    channel.assertQueue('NewMessageQueue', {
      durable: true,
    });
    channel.bindQueue('NewMessageQueue', 'NewMessageExchange', '');
    log.logMessage('info', 'Connection to rabbitMQ Successful');
  } catch (err) {
    log.logMessage('error', 'Error with connection to rabbitMQ');
  }
  return channel;
};

const connectToRabbitMQ = async (sMessagingserviceUri) => {
  let oChannel;
  try {
    const conn = await amqp.connect(sMessagingserviceUri);
    oChannel = await conn.createChannel();
    return oChannel;
  } catch (err) {
    log.logMessage('error', 'Error with connection to rabbitMQ');
  }
  return oChannel;
};

export default setupRabbit;
