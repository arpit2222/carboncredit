"useclient"
import { ConnectButton } from '@rainbow-me/rainbowkit';
export const Navbar = () => (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <nav className="container mx-auto flex justify-between items-center glass-card rounded-xl p-3">
            <h1 className="text-xl text-slate-50 font-bold">CarbonChain Collective</h1>
            <ConnectButton className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/20" />
        </nav>
    </header>
);