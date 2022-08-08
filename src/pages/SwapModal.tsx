import { Box, Modal, Fade } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { POSClient, use } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';
import HDWalletProvider from "@truffle/hdwallet-provider";

import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { useDispatch } from "react-redux";

import { info, error } from "../core/store/slices/MessagesSlice";
import { chains } from '../providers';
import { networks, FromNetwork, ToNetwork } from "../networks";
import { useWeb3Context } from "../hooks/web3Context";
import { ethWeb3, getContract, SwapTypes, SeasonalTokens } from "../core/constants/base";

export const SwapModal = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const {address} = useWeb3Context();
  const defaultButtonStyle = 'bg-squash hover:bg-artySkyBlue text-white text-1em rounded-7 px-28 py-10 font-medium w-full flex justify-between uppercase items-center';
  const [swapLoading, setSwapLoading] = useState(false);
  const [testNetwork, setTestNetwork] = useState('');
  const [actionType, setActionType] = useState('');

  const doApproveSeasonToken = async () => {
    if (address === '')
      return;
    const fromAddress:string = networks[FromNetwork].addresses[props.season];
    const toAddress:string = networks[ToNetwork].addresses[props.season];
    // let seasonContract = getContract(FromNetwork, props.season);
    // if (props.type === SwapTypes.ETH_TO_POLYGON) {
    //   seasonContract = getContract(FromNetwork, props.season);
      // bridgeAddress = ethBridgeAddress;
    // }
    // if (props.type === SwapTypes.POLYGON_TO_ETH) {
    //   seasonContract = getContract(ToNetwork, props.season);
    //   bridgeAddress = bscBridgeAddress;
    // }
    use(Web3ClientPlugin);
    const privateKey = '';
    const getPOSClient = async (network = 'testnet', version = 'mumbai') => {
      const posClient = new POSClient();
      await posClient.init({
        network: 'mainnet',  // 'testnet' or 'mainnet'
        version: 'v1', // 'mumbai' or 'v1'
        parent: {
          provider: new HDWalletProvider(privateKey, chains[FromNetwork].rpcUrls[0]),
          defaultConfig: {
            from: address
          }
        },
        child: {
          provider: new HDWalletProvider(privateKey, chains[ToNetwork].rpcUrls[0]),
          defaultConfig: {
            from: address
          }
        }
      });
      return posClient;
    };
    setSwapLoading(true);
    try {
      const posClient = await getPOSClient();
      console.log(address);
      const erc20ParentToken = posClient.erc20(fromAddress, true);
      let balance = await erc20ParentToken.getBalance(address);
      console.log('[Balance] :', parseFloat(ethWeb3.utils.fromWei(balance, 'ether')));

      let allowance = await erc20ParentToken.getAllowance(address);
      console.log('[Allowance] :', parseFloat(ethWeb3.utils.fromWei(allowance, 'ether')));

      if (parseFloat(allowance) < props.amount) {
        // const approveResult = await erc20ParentToken.approve('1000000000000000000000000000000');
        // const txHash = await approveResult.getTransactionHash();
        // const txReceipt = await approveResult.getReceipt();
        dispatch(info(`Approve token is finished.`)); 
      }

      const result = await erc20ParentToken.deposit('10000000000000000000', address);
      const txHash = await result.getTransactionHash();
      console.log(txHash);
      const txReceipt = await result.getReceipt();
      console.log(txReceipt);
      
      // dispatch(info(`deposit  token is finished.`));
    } catch (errorObj: any) {
      setSwapLoading(false);
      setTestNetwork('');
      props.setApproved(false);      
      props.onClose(null);
      dispatch(error(errorObj.message));
    }
    setSwapLoading(false);
  };

  const doSwapSeasonToken = async () => {
    if (address === '' || swapLoading)
      return;

    let seasonAddress = networks[FromNetwork].addresses[props.season];
    const weiAmount = ethWeb3.utils.toWei(props.amount.toString(), 'ether');
    setSwapLoading(true);
    if (props.type === SwapTypes.ETH_TO_POLYGON) {
      seasonAddress = networks[FromNetwork].addresses[props.season];
      try {
        await getContract(FromNetwork, 'ETH_BRIDGE').methods.swapFromEth(seasonAddress, weiAmount).send({from: address});
      } catch (errorObj: any) {
        setSwapLoading(false);
        setTestNetwork('');
        props.onClose(null);
        dispatch(error(errorObj.message));
      }
    }
    if (props.type === SwapTypes.POLYGON_TO_ETH) {
      seasonAddress = networks[ToNetwork].addresses[props.season];
      try {
        await getContract(ToNetwork, 'BSC_BRIDGE').methods.swapFromBsc(seasonAddress, weiAmount).send({from: address});
      } catch (errorObj: any) {
        setSwapLoading(false);
        setTestNetwork('');
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
    if (testNetwork == 'active'){
      if (actionType == 'approve')
        doApproveSeasonToken();
      if (actionType == 'swap')
        doSwapSeasonToken();
    }
  }, [testNetwork]);
  return (
    <Modal open={ props.open } onClose={ onCloseSwapModal }>
      <Fade in={ props.open }>
        <Box className="swap-modal" padding="20px">
          <Box className="text-center">
            {
              props.type === SwapTypes.ETH_TO_POLYGON ? (
                  <label className="text-30 font-bold flex justify-center items-center">Swap from <img src={networks[FromNetwork].logo} alt="ethereum" className="mx-20"/> ETH</label>) :
                (<label className="text-30 font-bold flex justify-center items-center">Swap from <img src={networks[FromNetwork].logo} alt="ethereum" className="mx-20"/> BSC</label>)
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