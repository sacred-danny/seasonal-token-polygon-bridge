import { Box, Modal, Fade } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import MaticPOSClient, { POSClient, use }  from "@maticnetwork/maticjs";
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3'
import detectEthereumProvider from '@metamask/detect-provider';
import WalletConnectProvider from "@maticnetwork/walletconnect-provider";

import { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import { useDispatch, useSelector } from "react-redux";
import Web3 from 'web3';

import { info, error } from "../core/store/slices/MessagesSlice";
import { chains } from '../providers';
import { networks, FromNetwork, ToNetwork } from "../networks";
import { useWeb3Context } from "../hooks/web3Context";
import { ethWeb3, polygonWeb3, SwapTypes, SeasonalTokens} from "../core/constants/base";

export const SwapModal = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const {address, provider} = useWeb3Context();
  const defaultButtonStyle = 'bg-squash hover:bg-artySkyBlue text-white text-1em rounded-7 px-28 py-10 font-medium w-full flex justify-between uppercase items-center';
  const [swapLoading, setSwapLoading] = useState(false);
  const [maticProvider, setMaticProvider] = useState();
  const [ethereumprovider, setEthereumProvider] = useState();
  // posClientGeneral facilitates the operations like approve, deposit, exit
  const posClientParent = () => {
    const maticPoSClient = new MaticPOSClient({
      network: 'mainnet',
      version: 'v1',
      maticProvider: maticProvider,
      parentProvider: window.web3,
      parentDefaultOptions: { from: address },
      maticDefaultOptions: { from: address },
    });
    return maticPoSClient;
  };
  // posclientBurn facilitates the burning of tokens on the matic chain
  const posClientChild = () => {
    const maticPoSClient = new MaticPOSClient({
      network: 'mainnet',
      version: 'v1',
      maticProvider: window.web3,
      parentProvider: ethereumprovider,
      parentDefaultOptions: { from: address },
      maticDefaultOptions: { from: address },
    });
    return maticPoSClient;
  };

  const doApproveSeasonToken = async () => {
    if (address === '')
      return;
    setSwapLoading(true);
    try {
      const maticPoSClient = posClientParent();
      const approveAmount = 1000000000000000000000000000000; // 18 decimals
      await maticPoSClient.approveERC20ForDeposit(networks[FromNetwork].addresses[props.season], approveAmount, {
        from: address,
      });
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
    
    if (props.type === SwapTypes.ETH_TO_POLYGON) {
      try {
        setSwapLoading(true);
        const maticPoSClient = posClientParent();
        const x = props.swapAmount * 1000000000000000000; // 18 decimals
        const x1 = x.toString();
        await maticPoSClient.depositERC20ForUser(networks[FromNetwork].addresses[props.season], address, x1, {
          from: address,
        });
        
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
      try{
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
  
  useEffect(() => {
    if (address == '') return;
    const ethereumProvider = new WalletConnectProvider({
      host: chains[FromNetwork].rpcUrls[0],
      callbacks: {
        onConnect: console.log("mainchain connected"),
        onDisconnect: console.log("mainchain disconnected"),
      },
    });

    const maticProvider = new WalletConnectProvider({
      host: chains[ToNetwork].rpcUrls[0],
      callbacks: {
        onConnect: console.log("matic connected"),
        onDisconnect: console.log("matic disconnected!"),
      },
    });

    setMaticProvider(maticProvider);
    setEthereumProvider(ethereumProvider);
  }, [provider]);

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