'use client'; 

import { Herosection } from '../Herosection';
import { Footer } from '../Footer';
import { FeaturesSection } from '../FeaturesSection';

export default function LandingPage() {
    return (
        <main className="text-slate-200">
            <Herosection />
            <FeaturesSection />
            <Footer />
        </main>
    );
}
