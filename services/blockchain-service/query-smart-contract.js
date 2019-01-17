const request = require('request-promise-native');

function querySmartContract(smartContractURL, pollTicCount) {
  console.log(pollTicCount);
  return request(smartContractURL);
}

module.exports = { querySmartContract };
