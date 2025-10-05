'use client';

import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Leaf, Users, ShieldCheck } from "lucide-react";
import Particles from '../components/Particles';

// Mock data for the marketplace
const availableCredits = [
  {
    id: "BATCH-001",
    allianceName: "Vindhya Valley Growers",
    amount: 5.1,
    pricePerTon: 15.50,
    verificationMethod: "AI + IoT",
  },
  {
    id: "BATCH-004",
    allianceName: "Deccan Eco-Farmers",
    amount: 8.2,
    pricePerTon: 14.75,
    verificationMethod: "AI Verified",
  },
  {
    id: "BATCH-005",
    allianceName: "Coastal Regenerative",
    amount: 12.5,
    pricePerTon: 16.25,
    verificationMethod: "AI + IoT",
  },
   {
    id: "BATCH-006",
    allianceName: "Vindhya Valley Growers",
    amount: 3.8,
    pricePerTon: 15.50,
    verificationMethod: "Manual Audit",
  },
];

const CreditCard = ({ credit }) => (
  <Card className="bg-slate-900 border-slate-700 text-slate-200 flex flex-col">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl text-white">{credit.allianceName}</CardTitle>
          <CardDescription>Batch ID: {credit.id}</CardDescription>
        </div>
         <Badge variant="secondary" className="bg-green-900/80 border-green-700 text-green-300">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Verified
          </Badge>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="flex justify-between items-baseline mb-4">
        <span className="text-4xl font-bold text-white">{credit.amount.toFixed(1)}</span>
        <span className="text-slate-400">CO2e Tons</span>
      </div>
      <div className="text-center text-lg text-green-400 font-semibold">
        ${credit.pricePerTon.toFixed(2)} / ton
      </div>
       <p className="text-xs text-center text-slate-500 mt-2">
        Verification: {credit.verificationMethod}
      </p>
    </CardContent>
    <div className="p-6 pt-0">
      <Button className="w-full bg-green-500 hover:bg-green-600 text-lg py-6">
        Purchase Credits
      </Button>
    </div>
  </Card>
);


export default function MarketplacePage() {
  return (
    <div className="mt-19">
        <div className="absolute inset-0 -z-1" style={{ width: '100%', height: '100%' }}>
            <Particles
                particleColors={['#0CDF2F', '#0CDF2F']}
                particleCount={500}
                particleSpread={15}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover={true}
                alphaParticles={true}
                disableRotation={false}
            />
        </div>
        <div className="min-h-screen p-4 sm:p-8">
        <div className="container mx-auto">
            <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white">Carbon Credit Marketplace</h1>
            <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
                Purchase verified carbon credits directly from our network of sustainable farmer alliances.
            </p>
            </header>

            {/* Credits Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {availableCredits.map((credit) => (
                <CreditCard key={credit.id} credit={credit} />
            ))}
            </div>

        </div>
        </div>
    </div>
  );
}
