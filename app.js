const RabbitService = {};
RabbitService.setupRabbit = require('./services/rabbitService/setup-rabbit').setupRabbit;
RabbitService.publishMessages = require('./services/rabbitService/publish-messages').publishMessages;

const BlockchainService = {};
BlockchainService.querySmartContract = require('./services/blockchain-service/query-smart-contract').querySmartContract;

const log = require('cf-nodejs-logging-support');
const uuidv4 = require('uuid/v4');

const credentials = {
  smartContractURL: process.env.SMART_CONTRACT_URL,
};


log.setLoggingLevel('info');

// 2.5 Second interval
const POLL_INTERVAL = 2500;
let pollTicCount = 1;

const sMessagingserviceUri = process.env.RABBIT_MQ_LOCAL;

let channel;

log.logMessage('info', 'Project Configuration Succesful');

// equivalent to a game loop
const poller = async () => {
  try {
    if (!channel) {
      channel = await RabbitService.setupRabbit(sMessagingserviceUri);
    }
    console.log(channel);

    const uuid = uuidv4();

    BlockchainService.querySmartContract(credentials.smartContractURL, pollTicCount)
      .then((response) => {
        const { messages } = JSON.parse(response);
        if (!messages) log.logMessage('info', 'No data returned from mock-blockchain-query', { 'X-correlation-id': uuid });
        else if (messages.length > 0) {
          RabbitService.publishMessages(messages, channel, uuid);
        }
      }).catch((err) => {
        console.log(err);
        log.logMessage('error', 'Fabric service error', { 'X-correlation-id': uuid });
      });
  } catch (err) {
    log.logMessage('error', 'Poll Tic Error');
    console.log(err);
  } finally {
    log.logMessage('info', `Poll number${pollTicCount} end`);
    pollTicCount += 1;
    setTimeout(poller, POLL_INTERVAL);
  }
};

setImmediate(poller);
