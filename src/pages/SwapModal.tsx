import { Box, Modal, Fade } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { POSClient, use, setProofApi  } from "@maticnetwork/maticjs"
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3'
import detectEthereumProvider from '@metamask/detect-provider';
import HDWalletProvider from "@truffle/hdwallet-provider";

import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { useDispatch, useSelector } from "react-redux";
import Web3 from 'web3';

import { info, error } from "../core/store/slices/MessagesSlice";
import { chains } from '../providers';
import { networks, FromNetwork, ToNetwork } from "../networks";
import { useWeb3Context } from "../hooks/web3Context";
import { ethWeb3, polygonWeb3, SwapTypes, SeasonalTokens} from "../core/constants/base";

use(Web3ClientPlugin);

export const SwapModal = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const {address, provider} = useWeb3Context();
  const defaultButtonStyle = 'bg-squash hover:bg-artySkyBlue text-white text-1em rounded-7 px-28 py-10 font-medium w-full flex justify-between uppercase items-center';
  const [swapLoading, setSwapLoading] = useState(false);
  // const [actionType, setActionType] = useState('');

  const eProvider = useSelector((state:any) => state.app.ethProvider);
  const doApproveSeasonToken = async () => {
    if (address === '')
      return;
    const fromAddress:string = networks[FromNetwork].addresses[props.season];
    const toAddress:string = networks[ToNetwork].addresses[props.season];
    setSwapLoading(true);
    try {
      const eProvider = await detectEthereumProvider();
      const getPOSClient = async () => {
        const posClient = new POSClient();
        await posClient.init({
          network: 'mainnet',  // 'testnet' or 'mainnet'
          version: 'v1', // 'mumbai' or 'v1'
          parent: {
            provider: eProvider,
            defaultConfig: {
              from: address
            }
          },
          child: {
            provider: eProvider,
            defaultConfig: {
              from: address
            }
          }
        });
        return posClient;
      };
      const posClient = await getPOSClient();
      console.log(address);
      const erc20ParentToken = posClient.erc20(fromAddress, true);
      let balance = await erc20ParentToken.getBalance(address);
      console.log('[Balance] :', parseFloat(ethWeb3.utils.fromWei(balance, 'ether')));

      let allowance = parseFloat( ethWeb3.utils.fromWei(await erc20ParentToken.getAllowance(address), 'ether') );
      console.log('[Allowance] :', allowance);
      if (allowance < props.amount) {
        console.log("approving");
        const approveResult = await erc20ParentToken.approve('1000000000000000000000000000000');
        const txHash = await approveResult.getTransactionHash();
        const txReceipt = await approveResult.getReceipt();
        dispatch(info(`Approve token is finished.`)); 
      }
      setSwapLoading(false);
      props.setApproved(true);
    } catch (errorObj: any) {
      setSwapLoading(false);
      props.setApproved(false);      
      props.onClose(null);
      dispatch(error(errorObj.message));
    }
    setSwapLoading(false);
  };

  const doSwapSeasonToken = async () => {
    if (address === '' || swapLoading)
      return;

    let seasonAddress:string;
    const weiAmount = ethWeb3.utils.toWei(props.amount.toString(), 'ether');
    setSwapLoading(true);
    const cProvider = await detectEthereumProvider();
    const ethProvider = new Web3(new Web3.providers.HttpProvider(chains[FromNetwork].rpcUrls[0]));
    const poygonProvider = new Web3(new Web3.providers.HttpProvider(chains[FromNetwork].rpcUrls[0]));
    const private_key = '';
    const getPOSClient = async () => {
      const posClient = new POSClient();
      await posClient.init({
        network: 'mainnet',  // 'testnet' or 'mainnet'
        version: 'v1', // 'mumbai' or 'v1'
        parent: {
          provider: new HDWalletProvider(private_key, chains[FromNetwork].rpcUrls[0]),
          defaultConfig: {
            from: address
          }
        },
        child: {
          provider: new HDWalletProvider(private_key, chains[FromNetwork].rpcUrls[0]),
          defaultConfig: {
            from: address
          }
        }
      });
      return posClient;
    };
    const posClient = await getPOSClient();
    
    if (props.type === SwapTypes.ETH_TO_POLYGON) {
      try {
        const erc20ParentToken = posClient.erc20(networks[FromNetwork].addresses[props.season], true);
        const result = await erc20ParentToken.deposit(weiAmount, address);
        const txHash = await result.getTransactionHash();
        console.log(txHash);
        const txReceipt = await result.getReceipt();
        console.log(txReceipt);
        setSwapLoading(false);
        props.onClose(null);
        props.onSwapAfter();
        dispatch(info(`Swap finished. Please wait 10 mins to receive polygon tokens.`));
      } catch (errorObj: any) {
        setSwapLoading(false);
        props.onClose(null);
        dispatch(error(errorObj.message));
      }
    }
    if (props.type === SwapTypes.POLYGON_TO_ETH) {
      try {
        const erc20Token = posClient.erc20(networks[ToNetwork].addresses[props.season]);
        const burnResult = await erc20Token.withdrawStart('10000000000000000000');
        const burnTxHash = await burnResult.getTransactionHash();
        console.log('[burnTxHash] : ', burnTxHash);
        const burnTxReceipt = await burnResult.getReceipt();
        console.log('[burnTxReceipt] : ', burnTxReceipt);

        setProofApi("https://apis.matic.network/");
        
        const erc20RootToken = posClient.erc20(networks[FromNetwork].addresses[props.season], true);
        console.log(erc20RootToken);
        const result = await erc20RootToken.withdrawExitFaster('0x53c391f458e0ebbeaf73e0a217feeb06c6f05c0ea454e7bd5f59967dd8dcd07f');
        const txHash = await result.getTransactionHash();
        const txReceipt = await result.getReceipt();

        // const erc20RootToken = posClient.erc20(networks[FromNetwork].addresses[props.season], true);
        // console.log(erc20RootToken);
        // const isExited = await erc20RootToken.isWithdrawExited('0x841bd963d60121cb7b95da3bd1beaee7e576d60c6843bd65ea7a864c795bec4a');
        // console.log(isExited);

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
    }
  };

  const onCloseSwapModal = () => {
    if (!swapLoading)
      props.onClose(null);
  }
  
  return (
    <Modal open={ props.open } onClose={ onCloseSwapModal }>
      <Fade in={ props.open }>
        <Box className="swap-modal" padding="20px">
          <Box className="text-center">
            {
              props.type === SwapTypes.ETH_TO_POLYGON ? (
                  <label className="text-30 font-bold flex justify-center items-center">Swap from <img src={networks[FromNetwork].logo} alt="ethereum" className="mx-20"/> ETH</label>) :
                (<label className="text-30 font-bold flex justify-center items-center">Swap from <img src={networks[FromNetwork].logo} alt="ethereum" className="mx-20"/> Polygon</label>)
            }
            <button onClick={ onCloseSwapModal } className="absolute top-20 right-20"><FontAwesomeIcon icon={ faTimes }/></button>
          </Box>
          <Box className="m-10">
            <Box className="flex items-center justify-center">
              { props.amount }
              <img src={ SeasonalTokens[props.season].img } className="w-30 mx-20"
                   alt={ SeasonalTokens[props.season].name }/>
            </Box>
          </Box>
          {
            <Box className="flex justify-center">
              {
                swapLoading ?
                  (<Box ml="5px" className="flex justify-center"><ReactLoading type="spinningBubbles" color="#FACB99"
                                                                               width={ 50 } height={ 50 }/></Box>)
                  : (
                    <Box className="">
                      {
                        props.approved === false ? (
                          <button className={ defaultButtonStyle } onClick={ doApproveSeasonToken }>Approve</button>) : (
                          <button className={ defaultButtonStyle } onClick={ doSwapSeasonToken }>Swap</button>)
                      }
                    </Box>)
              }
            </Box>
          }
        </Box>
      </Fade>
    </Modal>
  );
};