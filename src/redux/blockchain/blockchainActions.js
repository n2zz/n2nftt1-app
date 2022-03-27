// constants
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";
// log
import { fetchData } from "../data/dataActions";
import Caver from "caver-js";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();
    // const { ethereum } = window;
    // const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    // if (metamaskIsInstalled) {
    //   Web3EthContract.setProvider(ethereum);
    //   let web3 = new Web3(ethereum);
    //   try {
    //     const accounts = await ethereum.request({
    //       method: "eth_requestAccounts",
    //     });
    //     const networkId = await ethereum.request({
    //       method: "net_version",
    //     });
    //     if (networkId == CONFIG.NETWORK.ID) {
    //       const SmartContractObj = new Web3EthContract(
    //         abi,
    //         CONFIG.CONTRACT_ADDRESS
    //       );
    //       dispatch(
    //         connectSuccess({
    //           account: accounts[0],
    //           smartContract: SmartContractObj,
    //           web3: web3,
    //         })
    //       );
    //       // Add listeners start
    //       ethereum.on("accountsChanged", (accounts) => {
    //         dispatch(updateAccount(accounts[0]));
    //       });
    //       ethereum.on("chainChanged", () => {
    //         window.location.reload();
    //       });
    //       // Add listeners end
    //     } else {
    //       dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
    //     }
    //   } catch (err) {
    //     dispatch(connectFailed("Something went wrong."));
    //   }
    // } else {
    //   dispatch(connectFailed("Install Metamask."));
    // }

    const klaytn = window.klaytn;
    const caver = new Caver(klaytn);
    if (klaytn && caver) {
      const accounts = await klaytn.enable(); 
      console.log(accounts);
      const account = klaytn.selectedAddress;
      console.log(account);
      const balance = await caver.klay.getBalance(account);
      console.log(balance);

      const networkVersion = klaytn.networkVersion;
      console.log(networkVersion);
      // klaytn network - Baobab: 1001, Cypress: 8217
      if (networkVersion !== CONFIG.NETWORK.VERSION) {
        dispatch(connectFailed(`올바른 ${CONFIG.NETWORK.NAME} 네트워크를 설정해주세요.`));
      }
      else {
        const ContractObj = new caver.klay.Contract(abi, CONFIG.CONTRACT_ADDRESS);
        dispatch(connectSuccess({
          account: accounts[0],
          smartContract: ContractObj,
          web3: caver.klay
        }));
      }
    }
    else {
      dispatch(connectFailed("카이카스 지갑이 설치되어있지 않습니다."));
    }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};
