import { Box, Grid } from '@material-ui/core';
import { POSClient,use } from "@maticnetwork/maticjs"
import detectEthereumProvider from '@metamask/detect-provider';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import useForceUpdate from 'use-force-update';

import { Layout } from './layout';
import { SwapModal } from './pages/SwapModal';
import { LoadingModal } from './pages/LoadingModal';
import { EthTokenSection } from './pages/EthTokenSection';
import { PolygonTokenSection } from './pages/PolygonTokenSection';
import { useWeb3Context } from './hooks/web3Context';
import { networks, FromNetwork, ToNetwork } from './networks';
import Messages from './components/Messages/Messages';
import { error } from './core/store/slices/MessagesSlice';
import { SetEthProvider } from './core/store/slices/bridgeSlice';
import { polygonWeb3, ethWeb3, getContract, SeasonalTokens, serverSocketUrl, SwapTypes } from './core/constants/base';
import { chains } from './providers';
import swapIcon from './assets/images/swap/swap-img.png';
import './App.css';

export const App = (): JSX.Element => {

  const dispatch = useDispatch();
  const forceUpdate = useForceUpdate();
  const activeButtonStyle = 'max-w-280 min-w-280 bg-squash hover:bg-artySkyBlue text-white text-1em rounded-7 shadow-skyblue px-20 py-10 font-medium w-full flex justify-between uppercase items-center m-10';
  const defaultButtonStyle = 'max-w-280 min-w-280 bg-artySkyBlue hover:bg-squash text-white text-1em rounded-7 shadow-squash px-20 py-10 font-medium w-full flex justify-between uppercase items-center m-10';
  const [seasonTokenAmounts, setSeasonalTokenAmounts] = useState(Object.keys(SeasonalTokens).reduce((prev: any, season: string) => {
    prev[season] = {name: season, ethAmount: '0', polygonAmount: '0'};
    return prev;
  }, {}));
  const { connected, address, switchEthereumChain } = useWeb3Context();
  const [season, setSeason] = useState('SPRING');
  const [swapType, setSwapType] = useState('');
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [swapAmount, setSwapAmount] = useState(0);
  const [swapEthAmount, setSwapEthAmount] = useState(100);
  const [swapPolygonAmount, setswapPolygonAmount] = useState(10);
  const [approved, setApproved] = useState(false);
  // const [etherProvider, setEtherProvider] = useState(any);
  const handleChange = (event: any) => {
    setSeason(event.target.value);
  };
  const swapEthAmountInput = (event: any) => {
    setSwapEthAmount(event.target.value as number);
  };
  const swapPolygonAmountInput = (event: any) => {
    setswapPolygonAmount(event.target.value as number);
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
        const polygonAmount = await SeasonalTokens[season].polygonContract.methods.balanceOf(address).call();
        seasonTokenAmounts[season].polygonAmount = polygonWeb3.utils.fromWei(polygonAmount, 'ether');
      } catch (error) {
        console.log(error);
      }
    }
    else {
      seasonTokenAmounts[season].ethAmount = '0';
      seasonTokenAmounts[season].polygonAmount = '0';
    }
    setSeasonalTokenAmounts(seasonTokenAmounts);
    forceUpdate();
  };

  const openSwapModal = async (type:string) => {
    if(!connected){
      dispatch(error('Please connect to your wallet!'));
      return;
    }
    const getTokenAllowance = async (tokenAddress: string, swapAmount: number) => {
      const getPOSClient = async () => {
        const posClient = new POSClient();
        await posClient.init({
          network: 'mainnet',  // 'testnet' or 'mainnet'
          version: 'v1', // 'mumbai' or 'v1'
          parent: {
            provider: chains[FromNetwork].rpcUrls[0],
            defaultConfig: {
              from: address
            }
          },
          child: {
            provider: chains[ToNetwork].rpcUrls[0],
            defaultConfig: {
              from: address
            }
          }
        });
        return posClient;
      };
      const posClient = await getPOSClient();
      const erc20ParentToken = posClient.erc20(tokenAddress, true);
      let allowance = parseFloat( ethWeb3.utils.fromWei(await erc20ParentToken.getAllowance(address), 'ether') );
      // console.log('[Allowance] :', allowance, swapAmount, allowance >= swapAmount);
      setApproved(allowance >= swapAmount);
    };

    if (type === SwapTypes.ETH_TO_POLYGON) {
      setLoadModalOpen(true);
      let changedNetwork = await switchEthereumChain(FromNetwork, true);
      setLoadModalOpen(false);
      if (!changedNetwork)
        return;
      setSwapAmount(swapEthAmount);
      const seasonContract = getContract(FromNetwork, season);
      if (parseFloat(swapEthAmount.toString()) > parseFloat(seasonTokenAmounts[season].ethAmount)) {
        dispatch(error('Swap amount is bigger than current amount'));
        return;
      }
      if (parseFloat(swapEthAmount.toString()) < 100) {
        dispatch(error('Minimum swap amount is 100!'));
        return;
      }
      getTokenAllowance(networks[FromNetwork].addresses[season], swapEthAmount);
    }

    if (type === SwapTypes.POLYGON_TO_ETH) {
      setLoadModalOpen(true);
      let changedNetwork = await switchEthereumChain(ToNetwork, true);
      setLoadModalOpen(false);
      if (!changedNetwork)
        return;
      setSwapAmount(swapPolygonAmount);
      if (parseFloat(swapPolygonAmount.toString()) > parseFloat(seasonTokenAmounts[season].polygonAmount)) {
        dispatch(error('Swap amount is bigger than current amount'));
        return;
      }
      // if (parseFloat(swapPolygonAmount.toString()) < 100) {
      //   dispatch(error('Minimum swap amount is 100!'));
      //   return;
      // }
      setApproved(true);
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
  
  useEffect(() => {
    const getEthProvider = async () => {
      // return new Promise((resolve, reject) => {
      //   detectEthereumProvider()
      //   .then(res => resolve(res))
      //   .catch(err => reject(err))
      // })
      const current = await detectEthereumProvider();
      dispatch(SetEthProvider(current));
    }
    getEthProvider();
  }, [connected]);

  return (
    <Layout>
      <Grid container spacing={ 1 } className="flex justify-between">
        <Grid item xs={ 12 } sm={ 12 } lg={ 4 } className="justify-box">
          <Box className="text-left text-32 leading-1.5em font-medium text-white py-30">Ethereum</Box>
          <EthTokenSection season={season} onChange={handleChange} swapAmount={swapEthAmount} tokenAmounts={seasonTokenAmounts} onSwapAmountChange = {swapEthAmountInput}/>
        </Grid>
        <Grid item xs={ 12 } sm={ 12 } lg={ 4 } className="">
          <Box className="w-full py-50 flex items-center justify-center"><img src={swapIcon} alt="swap image" className="w-60"/></Box>
            <div className="flex flex-wrap justify-center mt-15">
                <button className={ activeButtonStyle + ' lg:mb-20' } onClick={() => openSwapModal(SwapTypes.ETH_TO_POLYGON)}>
                  Swap from <img src={networks[FromNetwork].logo} className="mx-10 w-20" alt="ethereum"/> {networks[FromNetwork].name}
                </button>
                <button className={ defaultButtonStyle } onClick={() => openSwapModal(SwapTypes.POLYGON_TO_ETH)}>
                  Swap from <img src={networks[ToNetwork].logo} className="mx-10 w-20" alt="bsc"/> {networks[ToNetwork].name}
                </button>
            </div>
        </Grid>
        <Grid item xs={ 12 } sm={ 12 } lg={ 4 } className="justify-box">
          <Box className="text-left text-32 leading-1.5em font-medium text-white py-30">Polygon</Box>
          <PolygonTokenSection season={season} onChange={handleChange} swapAmount={swapPolygonAmount} tokenAmounts={seasonTokenAmounts}  onSwapAmountChange = {swapPolygonAmountInput}/>
        </Grid>
      </Grid>
      <SwapModal type={ swapType } season={season} open={ swapModalOpen } onClose={ closeSwapModal } amount={swapAmount} onSwapAfter={() => getCurrentAmount(season)} approved={approved} setApproved={setApproved} />
      <Messages />
      <LoadingModal open={ loadModalOpen }/>
    </Layout>
  );
}