import { useEffect, useRef } from 'react';
import { Users, BrainCircuit, Check } from 'lucide-react'; 
import { FeatureCard } from "./FeatureCard";

const useScrollAnimation = () => {
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            {
                threshold: 0.1,
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            const revealElements = currentRef.querySelectorAll('.reveal');
            revealElements.forEach((el) => observer.observe(el));
        }

        return () => {
            if (currentRef) {
                const revealElements = currentRef.querySelectorAll('.reveal');
                revealElements.forEach((el) => observer.unobserve(el));
            }
        };
    }, []);

    return ref;
};
export const FeaturesSection = () => {
    const sectionRef = useScrollAnimation();

    return (
        <section ref={sectionRef} id="features" className="py-24 px-4 container mx-auto">
            <div className="text-center mb-16 reveal">
                <h2 className="text-4xl font-bold">A Platform Built for Trust and Scale</h2>
                <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
                    We combine cutting-edge technology to solve real-world problems.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<BrainCircuit size={24} />} 
                    title="AI-Powered Verification" 
                    description="Our advanced AI models analyze submitted proofs to ensure every carbon credit is backed by real, verifiable environmental action." 
                />
                <FeatureCard 
                    icon={<Users size={24} />} 
                    title="On-Chain Farmer Alliances" 
                    description="Small farmers form on-chain collectives via smart contracts, pooling resources to meet credit thresholds and share rewards fairly." 
                    delay="0.2s"
                />
                <FeatureCard 
                    icon={<Check size={24} />} 
                    title="Instant B3TR Rewards" 
                    description="Once an action is verified, our smart contracts automatically mint and distribute B3TR tokens to the user's VeWorld wallet."
                    delay="0.4s"
                />
            </div>
        </section>
    );
};