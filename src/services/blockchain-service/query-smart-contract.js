import request from 'request-promise-native';

const querySmartContract = (smartContractURL, pollTicCount) => {
  console.log(pollTicCount);
  return request(smartContractURL);
};

export default querySmartContract;
