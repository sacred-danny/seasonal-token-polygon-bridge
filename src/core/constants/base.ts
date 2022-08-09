import { POSClient, use } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';
// import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3 from 'web3';

import { SeasonalToken } from '../interfaces/base';
import { contractABIs, networks, FromNetwork, ToNetwork} from '../../networks';
import { chains } from '../../providers';

import springImg from '../../assets/images/tokens/spring.png';
import summerImg from '../../assets/images/tokens/summer.png';
import autumnImg from '../../assets/images/tokens/autumn.png';
import winterImg from '../../assets/images/tokens/winter.png';

const ethWeb3 = new Web3(chains[FromNetwork].rpcUrls[0]);

const polygonWeb3 = new Web3(chains[ToNetwork].rpcUrls[0]);

const polygonSeasonalContracts = Object.keys(networks[ToNetwork].addresses).reduce((prev:any, season: string)=>{
    prev[season] = new polygonWeb3.eth.Contract(contractABIs[season], networks[ToNetwork].addresses[season]);
    return prev;
}, {});

const ethSeasonalContracts = Object.keys(networks[FromNetwork].addresses).reduce((prev:any, season: string)=>{
    prev[season] = new ethWeb3.eth.Contract(contractABIs[season], networks[FromNetwork].addresses[season]);
    return prev;
}, {});

export {ethWeb3, polygonWeb3};

export const getContract = (networkId:number, season: string) => {
    const connectWeb3 = new Web3(Web3.givenProvider);
    return new connectWeb3.eth.Contract(contractABIs[season], networks[networkId].addresses[season]);
};

export const SeasonalTokens: {[key: string]:SeasonalToken} = {
    SPRING : {
        name: 'SPRING',
        ethContract: ethSeasonalContracts.SPRING,
        polygonContract: polygonSeasonalContracts.SPRING,
        img: springImg,
    },
    SUMMER : {
        name: 'SUMMER',
        ethContract: ethSeasonalContracts.SUMMER,
        polygonContract: polygonSeasonalContracts.SUMMER,
        img: summerImg,
    },
    AUTUMN : {
        name: 'AUTUMN',
        ethContract: ethSeasonalContracts.AUTUMN,
        polygonContract: polygonSeasonalContracts.AUTUMN,
        img: autumnImg,
    },
    WINTER : {
        name: 'WINTER',
        ethContract: ethSeasonalContracts.WINTER,
        polygonContract: polygonSeasonalContracts.WINTER,
        img: winterImg,
    },
};

export const SwapTypes: {[key: string]:string} = {
    ETH_TO_POLYGON: 'eth-polygon',
    POLYGON_TO_ETH: 'polygon-eth',
    BIG_AMOUNT: 'big_amount',
}

export const serverSocketUrl = '38.242.141.54:3000';

