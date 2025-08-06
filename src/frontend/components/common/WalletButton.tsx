import { ConnectWallet, ConnectWalletDropdownMenu, ConnectWalletDropdownMenuAddressItem, ConnectWalletDropdownMenuButton, ConnectWalletDropdownMenuDisconnectItem, ConnectWalletDropdownMenuItems, useSigner } from "@nfid/identitykit/react";

// Utility function to truncate account address
const truncateAccount = (account: string | undefined, startChars = 5, endChars = 5): string => {
  if (!account || account.length <= startChars + endChars + 3) {
    return account || 'Unknown';
  }
  return `${account.slice(0, startChars)}...${account.slice(-endChars)}`;
};

interface CustomConnectButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

interface CustomConnectedButtonProps {
  connectedAccount?: string;
  icpBalance?: number;
  signerIcon?: string;
  signerLabel?: string;
}

interface CustomMenuProps {
  connectedAccount?: string;
  icpBalance?: number;
  disconnect: () => void;
  signerIcon?: string;
  signerLabel?: string;
}

const CustomConnectWalletButton = ({ onClick }: CustomConnectButtonProps) => {
  return (
    <button
      className="flex w-11/12 items-center justify-center gap-x-2 rounded-lg bg-gradient-to-t from-primary to-secondary py-4 font-medium text-white sm:w-[350px]"
      onClick={onClick}
    >
      Connect Wallet
    </button>
  )
}

const CustomConnectedWalletButton = ({ connectedAccount, signerIcon, signerLabel }: CustomConnectedButtonProps) => {
  return (
    <button className="flex w-11/12 items-center justify-center gap-x-2 rounded-lg bg-gradient-to-t from-primary to-secondary py-4 font-medium text-white sm:w-[350px]">
      {signerIcon && (
        <img src={signerIcon} alt={signerLabel || 'Wallet'} className="h-5 w-5" />
      )}
      <span>Connected: {truncateAccount(connectedAccount)}</span>
    </button>
  )
}

const CustomDropdownMenu = ({ connectedAccount, disconnect, signerIcon, signerLabel }: CustomMenuProps) => {
  return (
    <ConnectWalletDropdownMenu>
      <ConnectWalletDropdownMenuButton>
        <div className="flex items-center justify-center gap-2 bg-primary/10 p-2 rounded-full">
          {signerIcon && (
            <img src={signerIcon} alt={signerLabel || 'Wallet'} className="h-6 w-6 rounded-full bg-secondary/10 p-1 flex-shrink-0" />
          )}
          <span className="text-center">{truncateAccount(connectedAccount)}</span>
        </div>
      </ConnectWalletDropdownMenuButton>
      <ConnectWalletDropdownMenuItems>
        <ConnectWalletDropdownMenuDisconnectItem onClick={disconnect} />
        <ConnectWalletDropdownMenuAddressItem value={connectedAccount || ''} />
      </ConnectWalletDropdownMenuItems>
    </ConnectWalletDropdownMenu>
  )
}

const WalletButton = () => {
  const signer = useSigner();

  // Get the signer icon and label from the signer object
  const signerIcon = signer?.icon;
  const signerLabel = signer?.label || 'Unknown Wallet';

  return (
    <ConnectWallet
      connectButtonComponent={CustomConnectWalletButton}
      connectedButtonComponent={(props) => (
        <CustomConnectedWalletButton 
          {...props} 
          signerIcon={signerIcon} 
          signerLabel={signerLabel} 
        />
      )}
      dropdownMenuComponent={(props) => (
        <CustomDropdownMenu 
          {...props} 
          signerIcon={signerIcon} 
          signerLabel={signerLabel} 
        />
      )}
    />
  );
};

export default WalletButton;