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
import { networks, FromNetwork, ToNetwork } from "../networks";
import { useWeb3Context } from "../hooks/web3Context";
import { ethWeb3, polygonWeb3, SwapTypes, SeasonalTokens} from "../core/constants/base";

use(Web3ClientPlugin);

export const WithdrawModal = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const {address, switchEthereumChain} = useWeb3Context();
  const defaultButtonStyle = 'bg-squash hover:bg-artySkyBlue text-white text-1em rounded-7 px-28 py-10 font-medium w-full flex justify-between uppercase items-center mx-10';
  const [swapLoading, setSwapLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [withdrawBtn, setWithdrawBtn] = useState(false);
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
    if (txHash == '')
        return;
    try {      
      let changedNetwork = await switchEthereumChain(FromNetwork, true);
      if (!changedNetwork)
        return null;

      const posClient = await posClientParent();
      if (posClient == null) return;
      setProofApi("https://apis.matic.network/");
      const erc20RootToken = posClient.erc20(networks[FromNetwork].addresses[props.season], true);
      console.log('[checked point] : ', await posClient.isCheckPointed(txHash));
      console.log('[Exist withdraw] : ', await erc20RootToken.isWithdrawExited(txHash));
      console.log(erc20RootToken);

      const result = await erc20RootToken.withdrawExitFaster(txHash);
      const transactionHash = await result.getTransactionHash();
      const txReceipt = await result.getReceipt();

      setSwapLoading(false);
      props.onClose(null);
      props.onSwapAfter();
      dispatch(info(`deposit  token is finished.`));
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
  
  return (
    <Modal open={ props.open } onClose={ onCloseSwapModal } className="right:0 top:0">
      <Fade in={ props.open }>
        <Box className="swap-modal" padding="20px">
          <Box className="text-center">
            <label className="text-20 font-bold flex justify-center items-center">Burn transactions</label>
            <button onClick={ onCloseSwapModal } className="absolute top-20 right-20"><FontAwesomeIcon icon={ faTimes }/></button>
          </Box>
          <Box>

          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};