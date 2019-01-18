import log from 'cf-nodejs-logging-support';
import uuidv4 from 'uuid/v4';
import setupRabbit from './services/rabbitService/setup-rabbit';
import publishMessages from './services/rabbitService/publish-messages';
import querySmartContract from './services/blockchain-service/query-smart-contract';


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
      channel = await setupRabbit(sMessagingserviceUri);
    }
    console.log(channel);

    const uuid = uuidv4();

    querySmartContract(credentials.smartContractURL, pollTicCount)
      .then((response) => {
        const { messages } = JSON.parse(response);
        if (!messages) log.logMessage('info', 'No data returned from mock-blockchain-query', { 'X-correlation-id': uuid });
        else if (messages.length > 0) {
          publishMessages(messages, channel, uuid);
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
