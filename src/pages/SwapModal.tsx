import { Box, Modal, Fade } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { POSClient, use } from "@maticnetwork/maticjs"
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3'
import detectEthereumProvider from '@metamask/detect-provider';
// import HDWalletProvider from "@truffle/hdwallet-provider";

import { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import { useDispatch } from "react-redux";

import { info, error } from "../core/store/slices/MessagesSlice";
import { networks, FromNetwork, ToNetwork } from "../networks";
import { useWeb3Context } from "../hooks/web3Context";
import { ethWeb3, polygonWeb3, SwapTypes, SeasonalTokens} from "../core/constants/base";


use(Web3ClientPlugin);

export const SwapModal = (props: any): any => {
  const dispatch = useDispatch();
  const {address, switchEthereumChain} = useWeb3Context();
  const defaultButtonStyle = 'bg-squash hover:bg-artySkyBlue text-white text-1em rounded-7 px-28 py-10 font-medium w-full flex justify-between uppercase items-center mx-10';
  const [swapLoading, setSwapLoading] = useState(false);
  const [burnBtn, setBurnBtn] = useState(false);
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
  // posclientBurn facilitates the burning of tokens on the matic chain
  const posClientChild =async () => {

    const currentProvider = await detectEthereumProvider();
    const posClient = new POSClient();
    await posClient.init({
      network: 'mainnet',  // 'testnet' or 'mainnet'
      version: 'v1', // 'mumbai' or 'v1'
      parent: {
        provider: ethWeb3,
        defaultConfig: {
          from: address
        }
      },
      child: {
        provider: currentProvider,
        defaultConfig: {
          from: address
        }
      }
    });
    return posClient;
  };

  const doApproveSeasonToken = async () => {
    if (address === '')
      return;
    const fromAddress:string = networks[FromNetwork].addresses[props.season];
    setSwapLoading(true);
    try {
      const posClient = await posClientParent();
      if (posClient == null) return;
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

  const doDepositeSeasonToken = async () => {
    if (address === '' || swapLoading)
      return;

    const weiAmount = ethWeb3.utils.toWei(props.amount.toString(), 'ether');
    setSwapLoading(true);
    
    if (props.type === SwapTypes.ETH_TO_POLYGON) {
      try {
        const posClient = await posClientParent();
        if (posClient == null) return;
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
  };

  const doBurnSeasonToken = async () => {
    if (address === '' || swapLoading)
      return;
    if (props.amount > parseFloat(props.seasonTokenAmounts[props.season].polygonAmount)) {
      dispatch(error('Swap amount is bigger than current amount'));
      return;
    }
    if (props.amount < 100) {
      dispatch(error('Minimum swap amount is 100!'));
      return;
    }

    const weiAmount = ethWeb3.utils.toWei(props.amount.toString(), 'ether');
    try {
      setSwapLoading(true);
      let changedNetwork = await switchEthereumChain(ToNetwork, true);
      if (!changedNetwork)
        return null;
        
      let posClient = await posClientChild();
      const erc20Token = posClient.erc20(networks[ToNetwork].addresses[props.season]);
      const burnResult = await erc20Token.withdrawStart(weiAmount, {
        from: address,
        maxPriorityFeePerGas: 40000000000,
        maxFeePerGas: 60000000000,
        gasLimit: 256000
      });
      const burnTxHash = await burnResult.getTransactionHash();
      console.log('[burnTxHash] : ', burnTxHash);
      const burnTxReceipt = await burnResult.getReceipt();
      console.log('[burnTxReceipt] : ', burnTxReceipt);
      // store to localstorage
      const transactions = localStorage.getItem('transactions');
      let txAry = [];
      if (transactions) {
        txAry = JSON.parse(transactions);
      }
      txAry.push(burnTxHash.toLowerCase());
      localStorage.setItem('transactions', JSON.stringify(txAry));

      setSwapLoading(false);
      props.onClose(null);
      props.onSwapAfter();
      dispatch(info(`Burn token is finished.`));
    } catch (errorObj: any) {
      setSwapLoading(false);
      props.onClose(null);
      dispatch(error(errorObj.message));
    }
  };

  const doWithdrawSeasonToken = async() => {
    props.onClose(null);
    props.activeWithdraw();
  };

  const onCloseSwapModal = () => {
    if (!swapLoading)
      props.onClose(null);
  }
  useEffect(()=> {
    setBurnBtn(props.type === SwapTypes.POLYGON_TO_ETH);
    setWithdrawBtn(props.type === SwapTypes.POLYGON_TO_ETH);
  }, [props.type, props.approved]);

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
                  <Box className="flex justify-center text-center">
                    {
                      (!props.approved && props.type === SwapTypes.ETH_TO_POLYGON) &&
                      <button className={ defaultButtonStyle } onClick={ doApproveSeasonToken }>Approve</button>
                    }
                    {
                      (props.approved && props.type === SwapTypes.ETH_TO_POLYGON) &&
                      <button className={ defaultButtonStyle } onClick={ doDepositeSeasonToken }>Swap</button>
                    }
                    {
                      burnBtn &&
                      <button className={ defaultButtonStyle } onClick={ doBurnSeasonToken }>Burn</button>
                    }
                    {
                      withdrawBtn &&
                      <button className={ defaultButtonStyle } onClick={ doWithdrawSeasonToken }>Withdraw</button>
                    }
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