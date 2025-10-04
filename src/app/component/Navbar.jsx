// src/app/component/Navbar.js

"use client"; // This component uses hooks, so it must be a client component

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

// You still need the full ConnectButton for the connected state UI
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Navbar = () => {
    // Hook to get the function that opens the wallet connection modal
    const { openConnectModal } = useConnectModal();

    // Hook to check if a wallet is connected
    const { isConnected } = useAccount();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 p-4">
            <nav className="container mx-auto flex justify-between items-center glass-card rounded-xl p-3">
                <h1 className="text-xl text-slate-50 font-bold">CarbonChain Collective</h1>
                <div className='flex gap-5 items-center'>
                    <a href="/qualify" className="hidden sm:inline-block border-1 p-1.5 rounded-md text-slate-300 hover:text-white transition-colors">
                        Become a Generator
                    </a>
                    {!isConnected && openConnectModal ? (
                        <button
                            onClick={openConnectModal}
                            type="button"
                            className="bg-green-500 cursor-pointer hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/20"
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        // This will render RainbowKit's default UI for the connected state 
                        // (address, balance, disconnect button, etc.)
                        // It's the easiest way to handle the "connected" view.
                        <ConnectButton />
                    )}
                </div>
            </nav>
        </header>
    );
};