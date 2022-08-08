import { ConnectWalletButton } from './ConnectWalletButton';
import seasonalLogo from '../../assets/images/seasonal-logo.svg';

export const Nav = () => {
  return (
    <div className="flex flex-between justify-between items-center w-full">
      <img src={seasonalLogo}/>
      <ConnectWalletButton/>
    </div>
  )
}
