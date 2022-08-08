import { Provider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { NetworkIds } from "./networks";

interface ChainDetailsOpts {
  networkName: string,
  rpcUrls: string[],
  symbol: string,
  decimals: number,
  blockExplorerUrls: string[],
  multicallAddress?: string,
}

class ChainDetails {
  readonly networkName: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly rpcUrls: string[];
  readonly blockExplorerUrls: string[];
  readonly multicallAddress?: string;
  readonly provider: Promise<Provider>;

  constructor(chainDetailsOpts: ChainDetailsOpts) {
    this.networkName = chainDetailsOpts.networkName;
    this.rpcUrls = chainDetailsOpts.rpcUrls;
    this.symbol = chainDetailsOpts.symbol;
    this.decimals = chainDetailsOpts.decimals;
    this.blockExplorerUrls = chainDetailsOpts.blockExplorerUrls;
    this.multicallAddress = chainDetailsOpts.multicallAddress;

    // Use the fastest node available
    this.provider = ChainDetails.getFastestRpcUrl(this.rpcUrls).then(rpcUrl => {
      const staticProvider = new StaticJsonRpcProvider(rpcUrl);
    //   if (this.multicallAddress) {
    //     return new MulticallProvider(this.networkName, staticProvider, this.multicallAddress);
    //   } else {
        return staticProvider;
    //   }
    });
  }

  // Return the fastest rpcUrl available
  private static async getFastestRpcUrl(rpcUrls: string[]): Promise<string> {
    return Promise.any(rpcUrls.map(rpcUrl => new Promise<string>((resolve, reject) => {
    //   NodeHelper.checkNodeStatus(rpcUrl).then(working => {
    //     if (working) {
    //       resolve(rpcUrl);
    //     } else {
    //       reject();
    //     }
    //   });
    })));
  }

}

interface AllChainDetails {
  [key: number]: ChainDetails
}

export const chains: AllChainDetails = {
  [NetworkIds.Ethereum]: new ChainDetails({
    networkName: 'Ethereum',
    rpcUrls: [
      'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213',
    ],
    symbol: 'ETH',
    decimals: 18,
    blockExplorerUrls: ['https://etherscan.io/'],
  }),
  [NetworkIds.Rinkeby]: new ChainDetails({
    networkName: 'Rinkeby',
    rpcUrls: [
      // 'https://rinkeby.infura.io/v3/1ff71c39bddd4d93971b23697b82bc0e',
      'https://eth-rinkeby.alchemyapi.io/v2/y1kcvsoSiVJTHDHfhIjt21dDrm-2vtPe'
    ],
    symbol: 'ETH',
    decimals: 18,
    blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
  }),
  [NetworkIds.Goerli]: new ChainDetails({
    networkName: 'Goerli',
    rpcUrls: [
      'https://eth-goerli.g.alchemy.com/v2/y1kcvsoSiVJTHDHfhIjt21dDrm-2vtPe'
    ],
    symbol: 'GoerliETH',
    decimals: 18,
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
  }),
  [NetworkIds.Bsc]: new ChainDetails({
    networkName: 'Bsc',
    rpcUrls: [
      'https://bsc-dataseed3.defibit.io',
    ],
    symbol: 'BNB',
    decimals: 18,
    blockExplorerUrls: [],
  }),
  [NetworkIds.BscTestnet]: new ChainDetails({
    networkName: 'BscTestnet',
    rpcUrls: [
      'https://hidden-hidden-cloud.bsc-testnet.discover.quiknode.pro/43eefa63d448ff86df7bf351b38474aab4b43eaa/',
      // 'https://data-seed-prebsc-2-s2.binance.org:8545',
    ],
    symbol: 'TBNB',
    decimals: 18,
    blockExplorerUrls: [],
  }),
  [NetworkIds.Polygon]: new ChainDetails({
    networkName: 'Polygon Mumbai',
    rpcUrls: [
      'https://polygon-mainnet.g.alchemy.com/v2/1V2Is3n6NgKS8nCqL2sbJda7QpzRVfnm',
    ],
    symbol: 'MATIC',
    decimals: 18,
    blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com/'],
  }),
  [NetworkIds.Mumbai]: new ChainDetails({
    networkName: 'Polygon Mumbai',
    rpcUrls: [
      'https://polygon-mumbai.g.alchemy.com/v2/qtlAPHR1vwhPIBrb2GKMvRC6HidY89Tj',
    ],
    symbol: 'MATIC',
    decimals: 18,
    blockExplorerUrls: ['https://explorer-mumbai.maticvigil.com/'],
  }),
};
