// const amqp = require('amqplib');
const log = require('cf-nodejs-logging-support');

async function publishMessages(results, channel, uuid) {
  let resultSet;

  if (results) {
    resultSet = results.map((message) => {
      message.uuid = uuid;
      const { messageId } = message;
      try {
        channel.publish('NewMessageExchange', '', Buffer.from(JSON.stringify(message)));

        log.logMessage('info', `Publishing to NewMessageExchange for ${messageId}`, { 'X-correlation-id': uuid, message_id: messageId });

        return { message, confirmation: 'published' };
      } catch (err) {
        log.logMessage('error', 'Error publishing to NewMessageExchange', { 'X-correlation-id': uuid, message_id: messageId });
        return { message, confirmation: 'error' };
      }
    });
  }
  return resultSet;
}

module.exports = { publishMessages };
