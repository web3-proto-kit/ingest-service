const amqp = require('amqplib');
const log = require('cf-nodejs-logging-support');

async function publishMessages(results, channel, uuid) {
    let resultSet;
    let messageId;
    if (results)
        resultSet = results.map((message) => {
            message.uuid = uuid;
            messageId = message.messageId;
            try {
                channel.publish('NewMessageExchange', '', Buffer.from(JSON.stringify(message)));

                log.logMessage("info", "Publishing to NewMessageExchange for " + messageId, { "X-correlation-id": uuid, "message_id": messageId });

                return { "message": message, "confirmation": "published" }
            }
            catch (err) {
                log.logMessage("error", "Error publishing to NewMessageExchange", { "X-correlation-id": uuid, "message_id": messageId });
                return { "message": message, "confirmation": "error" }
            }
        });
    return resultSet;
}

module.exports = { "publishMessages": publishMessages }
