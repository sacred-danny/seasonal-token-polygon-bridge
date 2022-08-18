import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useWeb3Context } from '../../hooks/web3Context';
import { ConnectWalletButton } from './ConnectWalletButton';
import seasonalLogo from '../../assets/images/seasonal-logo.svg';

export const Nav = () => {
  const { address } = useWeb3Context();
  const [showTX, setShowTX] = useState(false);
  let jsonFile = localStorage.getItem('transactions');
  let transactions = [];
  if (jsonFile) {
    transactions = JSON.parse(jsonFile);
  }
  const toggleTransaction = (flag:boolean) => {
    setShowTX(flag);
  };

  return (
    <div>
      <div className="flex flex-between justify-between items-center w-full">
        <img src={seasonalLogo}/>
        <ConnectWalletButton/>
      </div>
      {
        (address != '') &&
        <div className="flex text-white justify-end mt-10">
          <label className='mr-10'>Burn Transaction Hashes</label>
          {
            showTX === true ? (<button onClick={() => toggleTransaction(false)}><FontAwesomeIcon icon={faCaretUp} /></button>) : (<button onClick={() => toggleTransaction(true)}><FontAwesomeIcon icon={faCaretDown} /></button>)
          }
        </div>
      }
      {
        showTX &&
        <div className="text-white max-h-120 overflow-auto">
          {
            transactions.map((tx:string , index:number) => {
              return <div className="flex justify-end" key={index}>{index+1}. {tx}</div>;
            })
          }
        </div>
      }
    </div>
  )
}
