import LiquidEther from '../../components/LiquidEther';
export const Herosection = () => (
    <section id="hero" className="h-[89vh] flex items-center justify-center text-center px-4">
        <div className='absolute inset-0 z-0' style={{ width: '100%', height: '100%', }}>
            <LiquidEther
                colors={[ '#1DA551', '#17BA91', '#02643E' ]}
                mouseForce={9}
                cursorSize={80}
                isViscous={false}
                viscous={30}
                iterationsViscous={32}
                iterationsPoisson={32}
                resolution={.35}
                isBounce={false}
                autoDemo={true}
                autoSpeed={0.5}
                autoIntensity={2.2}
                takeoverDuration={0.25}
                autoResumeDelay={100}
                autoRampDuration={0.6}
            />
        </div>
        <div className="max-w-4xl">
            <div className="inline-block bg-slate-800 border border-slate-700 rounded-full px-4 py-1 text-sm text-green-300 mb-6 fade-in-text">
                Powered by VeChain & AI
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-slate-50 to-slate-400 fade-in-text fade-in-delay-1">
                Monetize Your Impact
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto fade-in-text fade-in-delay-2">
                The decentralized platform empowering farmers and individuals to turn verified environmental actions into valuable, tradable assets.
            </p>
            <div className="mt-16 fade-in-text fade-in-delay-3">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transform hover:scale-105">
                    Start Earning B3TR
                </button>
            </div>
        </div>
    </section>
);