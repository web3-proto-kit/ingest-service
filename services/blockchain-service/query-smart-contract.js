const request = require('request-promise-native');
const log = require('cf-nodejs-logging-support');

function querySmartContract(smartContractURL, pollTicCount) {
    return request(smartContractURL);
};

module.exports = { "querySmartContract": querySmartContract };
