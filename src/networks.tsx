import seasonalTokenABI from './abi/seasonalTokenABI.json';
import ethBridgeABI from './abi/ethBridgeABI.json';
import bscBridgeABI from './abi/bscBridgeABI.json';

import EthereumIcon from "./assets/images/networks/ethereum.svg";
import BscIcon from "./assets/images/networks/bsc.svg";
import PolygonIcon from "./assets/images/networks/polygon.svg";

export type NetworkId = number;

// seasonal token bridge
export enum NetworkIds {
  Ethereum = 1,
  Rinkeby = 4,
  Goerli = 5,
  Bsc = 56,
  BscTestnet = 97,
  Mumbai = 80001,
  Polygon = 137
}

export const FromNetwork = NetworkIds.Ethereum;
export const ToNetwork = NetworkIds.Mumbai;

interface INetwork {
  name: string,
  isEnabled: boolean,
  addresses: { [key: string]: string },
  logo?: any
}

interface INetworks {
  [key: string]: INetwork;
}

export const networks: INetworks = {
  [NetworkIds.Ethereum]: {
    name: 'Ethereum',
    isEnabled: true,
    addresses: {
      // SPRING: '0xf0a4c5b65317cE6Fed4E262E514DEC83837d146A',
      SPRING: '0xf04aF3f4E4929F7CD25A751E6149A3318373d4FE',
      SUMMER: '0x4D4f3715050571A447FfFa2Cd4Cf091C7014CA5c',
      AUTUMN: '0x4c3bAe16c79c30eEB1004Fb03C878d89695e3a99',
      WINTER: '0xccba0b2bc4babe4cbfb6bd2f1edc2a9e86b7845f',
      ETH_BRIDGE: '0x9d2Ff563417A32B9865c27B48F6B1E4626606630'
    },
    logo: EthereumIcon
  },
  [NetworkIds.Rinkeby]: {
    name: 'Ethereum Rinkeby',
    isEnabled: true,
    addresses: {
      SPRING: '0xaaAdB5a20a6f01e876806Cf3e47f588eE8F18A4c',
      SUMMER: '0x4c27932e231Ee0B5603db28E6ed791E9EEAD999E',
      AUTUMN: '0xfAB3dB95241411cF9Fc198E39aCb97219a83866a',
      WINTER: '0x9d2Ff563417A32B9865c27B48F6B1E4626606630',
      ETH_BRIDGE: '0xf0a4c5b65317cE6Fed4E262E514DEC83837d146A'
    },
    logo: EthereumIcon
  },
  [NetworkIds.Goerli]: {
    name: 'Goerli Testnet',
    isEnabled: true,
    addresses: {
      // SPRING: '0x141835Ee134E28f2785d39c04262A86964080F2b',
      SPRING: '0x88f257116f56fb6e29d6ee89216207261ca900ca',
      SUMMER: '0x7dFacDC0aba316e829C9eB304C984a2f5530701F',
      AUTUMN: '0xBeea9dC107D6c12bBDd8d71663DD05B22e6950D1',
      WINTER: '0xa2F59eeC1ac5540DE2D9351011575364037395b2',
      ETH_BRIDGE: '0xc1Cb25E0d84b40fB4590F4b5a93346703095db8D'
    },
    logo: EthereumIcon
  },
  [NetworkIds.Bsc]: {
    name: 'BSC',
    isEnabled: true,
    addresses: {
      SPRING: '0x8d725B8848cf9C971Fa8991cbDeE2e1a35ac9DeC',
      SUMMER: '0x21B174B45f930C1b5E34b5066C95d4dBe23Ef421',
      AUTUMN: '0xec964DeE5172d86A0188B992B1F5603DE947f41b',
      WINTER: '0x8080821eec2B90Bc18dd7Fd9D5Fc7c3F820EB7e9',
      BSC_BRIDGE: '0xA2E1136d323896eD56F15ff85b9C73C6DdC98a96'
    },
    logo: BscIcon
  },
  [NetworkIds.BscTestnet]: {
    name: 'BSC Testnet',
    isEnabled: true,
    addresses: {
      SPRING: '0xe9E8c46bd24c22F7a5C7A1a6161032E7F1e46440',
      SUMMER: '0x022333A624a2B322D0D1b14d976a2410d2105eE3',
      AUTUMN: '0xfAB3dB95241411cF9Fc198E39aCb97219a83866a',
      WINTER: '0x4DF858CB94A329000895C34EAD6Db56f99511481',
      BSC_BRIDGE: '0x686Ab5d5AE00c289CB5F731739a7eDB083bE2c0a'
    },
    logo: BscIcon
  },
  [NetworkIds.Polygon]: {
    name: 'POLYGON Mainnet',
    isEnabled: true,
    addresses: {
      SPRING: '0x70d59baA5ab360b2723dD561415bdBcD4435E1C4',
      SUMMER: '0x4DF858CB94A329000895C34EAD6Db56f99511481',
      AUTUMN: '0x4DF858CB94A329000895C34EAD6Db56f99511481',
      WINTER: '0xf0a4c5b65317cE6Fed4E262E514DEC83837d146A',
      BSC_BRIDGE: '0xC7C0782A4648781bCa43433A81839543AF206329'
    },
    logo: PolygonIcon
  },
  [NetworkIds.Mumbai]: {
    name: 'Polygon Mumbai',
    isEnabled: true,
    addresses: {
      SPRING: '0x73346ED2E0828B069038b76dE9845C2ad4F16d2A',
      SUMMER: '0xdd28ec6b06983d01d37dbd9ab581d8d884d95264',
      AUTUMN: '0xfba4d30e964e40775c95b58acf6b5a621b929c0a',
      WINTER: '0x51540d15957bdc0fdb87d32616c8d658d59f77c6',
      BSC_BRIDGE: '0xCD27649E5BD4d636ac2db36d80cB39f58423bBe9'
    },
    logo: PolygonIcon
  },
};

interface SeasonalABIS {
  [key: string]: any;
};
export const contractABIs: SeasonalABIS = {
  SPRING: seasonalTokenABI,
  SUMMER: seasonalTokenABI,
  AUTUMN: seasonalTokenABI,
  WINTER: seasonalTokenABI,
  ETH_BRIDGE: ethBridgeABI,
  BSC_BRIDGE: bscBridgeABI
}

export const enabledNetworkIds: NetworkId[] = Object.keys(networks).map(networkId => parseInt(networkId)).filter(networkId => networks[networkId].isEnabled);
