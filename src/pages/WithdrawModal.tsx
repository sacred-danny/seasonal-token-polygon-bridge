import { Box, Modal, Fade } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { POSClient, use, setProofApi  } from "@maticnetwork/maticjs"
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3'
import detectEthereumProvider from '@metamask/detect-provider';

import { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import { useDispatch } from "react-redux";

import { info, error } from "../core/store/slices/MessagesSlice";
import { networks, FromNetwork } from "../networks";
import { useWeb3Context } from "../hooks/web3Context";
import { polygonWeb3} from "../core/constants/base";

use(Web3ClientPlugin);

export const WithdrawModal = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const {address, switchEthereumChain} = useWeb3Context();
  const defaultButtonStyle = 'bg-squash hover:bg-artySkyBlue text-white text-1em rounded-7 px-28 py-10 font-medium w-full flex justify-between uppercase items-center mx-10';
  const [swapLoading, setSwapLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txHashes, setTxHashes] = useState<string[]>(['']);
  const posClientParent =async () => {
    const currentProvider = await detectEthereumProvider();
    const posClient = new POSClient();
    await posClient.init({
      network: 'mainnet',  // 'testnet' or 'mainnet'
      version: 'v1', // 'mumbai' or 'v1'
      parent: {
        provider: currentProvider,
        defaultConfig: {
          from: address
        }
      },
      child: {
        provider: polygonWeb3,
        defaultConfig: {
          from: address
        }
      }
    });
    return posClient;
  };
  const doWithdrawSeasonToken = async() => {
    if (txHash === '') {
        dispatch(error('Input Burn transaction Hash!'));
        return;
    }
    try {      
      let changedNetwork = await switchEthereumChain(FromNetwork, true);
      if (!changedNetwork)
        return null;

      const posClient = await posClientParent();
      setProofApi("https://apis.matic.network/");
      const erc20RootToken = posClient.erc20(networks[FromNetwork].addresses[props.season], true);
      console.log('[checked point] : ', await posClient.isCheckPointed(txHash));
      console.log('[Exist withdraw] : ', await erc20RootToken.isWithdrawExited(txHash));
      console.log(erc20RootToken);

      const result = await erc20RootToken.withdrawExitFaster(txHash);
      const transactionHash = await result.getTransactionHash();
      const txReceipt = await result.getReceipt();

      const txIndex = txHashes.findIndex((tx:string) => tx === txHash);
      txHashes.splice(txIndex, 1);
      console.log(txIndex, txHashes);
      localStorage.setItem('transactions', JSON.stringify(txHashes));
      setSwapLoading(false);
      props.onClose(null);
      dispatch(info(`Withdraw token is finished. Please wait 10 mins`));
    } catch (errorObj: any) {
      console.log(errorObj);
      setSwapLoading(false);
      props.onClose(null);
      dispatch(error(errorObj.message));
    }
  };

  const onCloseSwapModal = () => {
    if (!swapLoading)
      props.onClose(null);
  }
  useEffect(()=> {
    const transactions = localStorage.getItem('transactions');
    if (transactions) {
      setTxHashes(JSON.parse(transactions));
      setTxHash(JSON.parse(transactions)[0]);
    }
  }, []);

  return (
    <Modal open={ props.open } onClose={ onCloseSwapModal }>
      <Fade in={ props.open }>
        <Box className="swap-modal" padding="20px">
          <Box className="text-center">
            <label className="text-30 font-bold flex justify-center items-center">Input Burn Transaction Hash</label>
            <button onClick={ onCloseSwapModal } className="absolute top-20 right-20"><FontAwesomeIcon icon={ faTimes }/></button>
          </Box>
          {
            <Box className="w-full">
            {
              swapLoading ?
                (<Box ml="5px" className="flex justify-center"><ReactLoading type="spinningBubbles" color="#FACB99"
                                                                              width={ 50 } height={ 50 }/></Box>)
                : (
                  <Box className="text-center">                   
                    <input className="border-2 rounded-5 w-full p-5 m-10" type="text" value={txHash} onChange = {(e:any) => setTxHash(e.target.value)}/>
                    {/* <select className="border-2 rounded-5 w-full p-5 m-10" value={txHash} onChange = {(e:any) => setTxHash(e.target.value)}>
                        {
                            txHashes.map((tx:any, index) => {
                                return <option key={index}>{tx}</option>
                            })
                        }
                    </select> */}
                    <button className={ defaultButtonStyle + ' justify-center w-150 mx-auto text-center' } onClick={ doWithdrawSeasonToken }>Confirm</button>
                  </Box>
                )
            }
            </Box>
          }
        </Box>
      </Fade>
    </Modal>
  );
};