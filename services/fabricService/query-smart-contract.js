const request = require('request-promise-native');
const log = require('cf-nodejs-logging-support');

function querySmartContract(chaincodeURL, pollTicCount) {
    return request(chaincodeURL);
};

module.exports = { "querySmartContract": querySmartContract };
