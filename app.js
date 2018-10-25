const RabbitService = {}
RabbitService.setupRabbit = require('./services/rabbitService/setup-rabbit').setupRabbit
RabbitService.publishInvoices = require('./services/rabbitService/publish-invoices').publishInvoices

const FabricService = {}
FabricService.querySmartContract = require('./services/fabricService/query-smart-contract').querySmartContract

const log = require('cf-nodejs-logging-support');
const request = require('request-promise-native');
const createUuid = require("./utility/create-uuid");
const env = require('dotenv').config(); // for local testing

const credentials = {
  "chaincodeURL" : process.env.CHAINCODE_URL
};

log.setLoggingLevel("info");

// 2.5 Second interval
const POLL_INTERVAL = 2500;
var authenticated = false;
let pollTicCount = 1;

let appEnv = cfenv.getAppEnv();

const sMessagingserviceUri = appEnv.isLocal ?
  process.env.RABBIT_MQ_LOCAL :
  appEnv.services.rabbitmq[0].credentials.uri;

let channel;

log.logMessage("info", "Project Configuration Succesful");

//equivalent to a game loop
const poller = async () => {
  try {
    if (!channel){
      channel = await RabbitService.setupRabbit(sMessagingserviceUri);
    }
    
    let uuid = createUuid.uuidv4();

    FabricService.querySmartContract(credentials.chaincodeURL, pollTicCount)
      .then((invoices) => {
        if (!invoices)
          log.logMessage("info", "No data returned from mock-blockchain-query", { "X-correlation-id": uuid });
        else {
          if (invoices.length > 0) {
            RabbitService.publishMessages(invoices, channel, uuid)  
          }
        }
      }).catch(function (err) {
        console.log(err);
        log.logMessage("error", "Fabric service error", { "X-correlation-id": uuid });
      });

  } catch (err) {
    log.logMessage("error", "Poll Tic Error");
    console.log(err);
  } finally {
    log.logMessage("info", 'Poll number' + pollTicCount + ' end');
    pollTicCount++;
    setTimeout(poller, POLL_INTERVAL);
  }
};

setImmediate(poller);
