import { Box, Grid } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
// import { io } from 'socket.io-client';
import useForceUpdate from 'use-force-update';

import { Layout } from './layout';
import { SwapModal } from './pages/SwapModal';
import { LoadingModal } from './pages/LoadingModal';
import { EthTokenSection } from './pages/EthTokenSection';
import { BscTokenSection } from './pages/BscTokenSection';
import { useWeb3Context } from './hooks/web3Context';
import { networks, FromNetwork, ToNetwork } from './networks';
import Messages from './components/Messages/Messages';
import { error } from './core/store/slices/MessagesSlice';
import { bscWeb3, ethWeb3, getContract, SeasonalTokens, serverSocketUrl, SwapTypes } from './core/constants/base';
import swapIcon from './assets/images/swap/swap-img.png';
import './App.css';

export const App = (): JSX.Element => {

  const dispatch = useDispatch();
  const forceUpdate = useForceUpdate();
  const activeButtonStyle = 'max-w-250 bg-squash hover:bg-artySkyBlue text-white text-1em rounded-7 shadow-skyblue px-28 py-10 font-medium w-full flex justify-between uppercase items-center m-20';
  const defaultButtonStyle = 'max-w-250 bg-artySkyBlue hover:bg-squash text-white text-1em rounded-7 shadow-squash px-28 py-10 font-medium w-full flex justify-between uppercase items-center m-20';
  const [seasonTokenAmounts, setSeasonalTokenAmounts] = useState(Object.keys(SeasonalTokens).reduce((prev: any, season: string) => {
    prev[season] = {name: season, ethAmount: '0', bscAmount: '0'};
    return prev;
  }, {}));
  const { connected, connect, address, switchEthereumChain } = useWeb3Context();
  const [season, setSeason] = useState('SPRING');
  const [swapType, setSwapType] = useState('');
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [swapAmount, setSwapAmount] = useState(0);
  const [swapEthAmount, setSwapEthAmount] = useState(100);
  const [swapBscAmount, setSwapBscAmount] = useState(100);
  const [approved, setApproved] = useState(false);
  const ethBridgeAddress = networks[FromNetwork].addresses.ETH_BRIDGE;
  const bscBridgeAddress = networks[ToNetwork].addresses.BSC_BRIDGE;

  const handleChange = (event: any) => {
    setSeason(event.target.value);
  };
  const swapEthAmountInput = (event: any) => {
    setSwapEthAmount(event.target.value as number);
  };
  const swapBscAmountInput = (event: any) => {
    setSwapBscAmount(event.target.value as number);
  };
  const getCurrentAmount = async (season: string) => {
    if (address !== '') {
      try {
        const ethAmount = await SeasonalTokens[season].ethContract.methods.balanceOf(address).call();
        seasonTokenAmounts[season].ethAmount = ethWeb3.utils.fromWei(ethAmount, 'ether');
      } catch (error) {
        console.log(error);
      }

      try {
        const bscAmount = await SeasonalTokens[season].bscContract.methods.balanceOf(address).call();
        seasonTokenAmounts[season].bscAmount = bscWeb3.utils.fromWei(bscAmount, 'ether');
      } catch (error) {
        console.log(error);
      }
    }
    else {
      seasonTokenAmounts[season].ethAmount = '0';
      seasonTokenAmounts[season].bscAmount = '0';
    }
    setSeasonalTokenAmounts(seasonTokenAmounts);
    forceUpdate();
  };

  const openSwapModal = async (type:string) => {
    if(!connected){
      dispatch(error('Please connect to your wallet!'));
      return;
    }
    const getAllowance = async (contract: any, targetAddr:any) => {
      const allowAmount = await contract.methods.allowance(address, targetAddr).call();
      setApproved(allowAmount !== '0');
    };

    if (type === SwapTypes.ETH_TO_BSC) {
      setLoadModalOpen(true);
      let changedNetwork = await switchEthereumChain(FromNetwork, true);
      setLoadModalOpen(false);
      if (!changedNetwork)
        return;
      setSwapAmount(swapEthAmount);
      const seasonContract = getContract(FromNetwork, season);
      getAllowance(seasonContract, ethBridgeAddress).then();
      // if (parseFloat(swapEthAmount.toString()) > parseFloat(seasonTokenAmounts[season].ethAmount)) {
      //   dispatch(error('Swap amount is bigger than current amount'));
      //   return;
      // }
      // if (parseFloat(swapEthAmount.toString()) < 100) {
      //   dispatch(error('Minimum swap amount is 100!'));
      //   return;
      // }
    }

    if (type === SwapTypes.BSC_TO_ETH) {
      setLoadModalOpen(true);
      let changedNetwork = await switchEthereumChain(ToNetwork, true);
      setLoadModalOpen(false);
      if (!changedNetwork)
        return;
      setSwapAmount(swapBscAmount);
      const seasonContract = getContract(ToNetwork, season);
      await getAllowance(seasonContract, bscBridgeAddress);
      // if (parseFloat(swapBscAmount.toString()) > parseFloat(seasonTokenAmounts[season].bscAmount)) {
      //   dispatch(error('Swap amount is bigger than current amount'));
      //   return;
      // }
      // if (parseFloat(swapBscAmount.toString()) < 100) {
      //   dispatch(error('Minimum swap amount is 100!'));
      //   return;
      // }
    }
    setSwapModalOpen(true);
    setSwapType(type);
  };
  const closeSwapModal = () => {
    setSwapModalOpen(false);
  };
  useEffect(() => {
    if (address === '') return;
    Object.keys(SeasonalTokens).forEach((season: string) => {
      getCurrentAmount(season).then();
    });
  }, [address]);

  return (
    <Layout>
      <Grid container spacing={ 1 } className="flex justify-between">
        <Grid item xs={ 12 } sm={ 12 } lg={ 4 } className="justify-box">
          <Box className="text-left text-32 leading-1.5em font-medium text-white py-30">Ethereum</Box>
          <EthTokenSection season={season} onChange={handleChange} swapAmount={swapEthAmount} tokenAmounts={seasonTokenAmounts} onSwapAmountChange = {swapEthAmountInput}/>
        </Grid>
        <Grid item xs={ 12 } sm={ 12 } lg={ 3 } className="">
          <Box className="w-full py-50 flex items-center justify-center"><img src={swapIcon} alt="swap image" className="w-60"/></Box>
            <div className="flex flex-wrap justify-center mt-15">
                <button className={ activeButtonStyle + ' lg:mb-20' } onClick={() => openSwapModal(SwapTypes.ETH_TO_BSC)}>
                  Swap from <img src={networks[FromNetwork].logo} className="mx-10 w-20" alt="ethereum"/> {networks[FromNetwork].name}
                </button>
                <button className={ defaultButtonStyle } onClick={() => openSwapModal(SwapTypes.BSC_TO_ETH)}>
                  Swap from <img src={networks[ToNetwork].logo} className="mx-10 w-20" alt="bsc"/> {networks[ToNetwork].name}
                </button>
            </div>
        </Grid>
        <Grid item xs={ 12 } sm={ 12 } lg={ 4 } className="justify-box">
          <Box className="text-left text-32 leading-1.5em font-medium text-white py-30">Polygon</Box>
          <BscTokenSection season={season} onChange={handleChange} swapAmount={swapBscAmount} tokenAmounts={seasonTokenAmounts}  onSwapAmountChange = {swapBscAmountInput}/>
        </Grid>
      </Grid>
      <SwapModal type={ swapType } season={season} open={ swapModalOpen } onClose={ closeSwapModal } amount={swapAmount} onSwapAfter={() => getCurrentAmount(season)} approved={approved} setApproved={setApproved}/>
      <Messages />
      <LoadingModal open={ loadModalOpen }/>
    </Layout>
  );
}