'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

// NavLink Component to handle active states
const NavLink = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? 'text-white bg-slate-700/50' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      {children}
    </Link>
  );
};


export default function Navbar() {
  const { isConnected } = useAccount();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <nav className="container mx-auto flex justify-between items-center glass-card rounded-xl p-3">
        <Link href="/" className="text-xl font-bold text-white">
          CarbonChain Collective
        </Link>
        <div className="hidden md:flex items-center gap-2">
          <NavLink href="/qualify">Become a Generator</NavLink>
          <NavLink href="/alliance">Alliances</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/marketplace">Marketplace</NavLink>
        </div>
        <div>
          <ConnectButton.Custom>
            {({ openConnectModal }) => {
              // If the user is already connected, we show the default RainbowKit button.
              // It perfectly handles showing the address, disconnecting, and switching networks.
              if (isConnected) {
                return <ConnectButton />;
              }

              // If the user is not connected, we show your custom-styled button.
              return (
                <button
                  onClick={openConnectModal}
                  type="button"
                  className="bg-green-500 cursor-pointer hover:bg-green-600 shadow-lg shadow-green-500/20 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Connect Wallet
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </nav>
    </header>
  );
}

