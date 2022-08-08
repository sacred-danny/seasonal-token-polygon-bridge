import { useWeb3Context } from '../../hooks/web3Context';

export const ConnectWalletButton = () => {
  const { connect, disconnect, address } = useWeb3Context();
  return (
    <div>
      {
        address === '' ? (
          <button className="uppercase bg-squash hover:bg-artySkyBlue text-white text-1em rounded-7 shadow-skyblue px-24 py-10 font-medium" onClick={connect}>
            Connect wallet
          </button> ) :
          (
            <button className="uppercase bg-artySkyBlue hover:bg-squash text-white text-1em rounded-7 shadow-squash px-24 py-10 font-medium" onClick={disconnect}>
              Disconnect wallet
            </button>
          )
      }
    </div>
  );
}
