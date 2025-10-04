'use client';

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { UploadCloud, Leaf } from "lucide-react";
import Particles from '../../components/Particles';

export default function QualifyPage() {
  // In a real app, you'd handle form state with useState and submission logic here
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting qualification application...");
    // Add logic to submit data to your backend or a smart contract
  };

  return (
    <div className="">
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
        <div className="min-h-screen z-5  flex items-center justify-center  p-4 sm:p-8">
        <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 text-slate-200">
            <CardHeader className="text-center">
            <div className="mx-auto bg-green-900/50 border border-green-700 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-green-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">Become a Carbon Credit Generator</CardTitle>
            <CardDescription className="text-slate-400">
                Submit your details and proofs to start monetizing your sustainable practices.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="user-name" className="text-slate-300">Your Name</Label>
                    <Input id="user-name" placeholder="e.g., Rohan Kumar" className="bg-slate-800 border-slate-600" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user-email" className="text-slate-300">Email Address</Label>
                    <Input id="user-email" type="email" placeholder="e.g., rohan@example.com" className="bg-slate-800 border-slate-600" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="farm-name" className="text-slate-300">Farm or Project Name</Label>
                    <Input id="farm-name" placeholder="e.g., Green Valley Organics" className="bg-slate-800 border-slate-600" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="land-size" className="text-slate-300">Total Land Size (in Hectares)</Label>
                    <Input id="land-size" type="number" placeholder="e.g., 5.5" className="bg-slate-800 border-slate-600" />
                </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="practice-type" className="text-slate-300">Primary Sustainable Practice</Label>
                    <Select>
                    <SelectTrigger className="w-full bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Select a primary practice" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                        <SelectItem value="no-till">No-Till Farming</SelectItem>
                        <SelectItem value="cover-crops">Cover Cropping</SelectItem>
                        <SelectItem value="agroforestry">Agroforestry</SelectItem>
                        <SelectItem value="solar-irrigation">Solar-Powered Irrigation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Describe Your Practices in More Detail</Label>
                <Textarea
                    id="description"
                    placeholder="Provide specific details about your methods, crops, or technology used."
                    className="bg-slate-800 border-slate-600"
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="iot-endpoint" className="text-slate-300">IoT Device Endpoint (Optional)</Label>
                <Input id="iot-endpoint" placeholder="Enter API endpoint if you use sensors for verification" className="bg-slate-800 border-slate-600" />
                </div>

                <div className="space-y-2">
                <Label htmlFor="proof-upload" className="text-slate-300">Upload Proof Documents</Label>
                <div className="flex items-center justify-center w-full">
                    <label
                    htmlFor="proof-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800/80"
                    >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-4 text-slate-400" />
                        <p className="mb-2 text-sm text-slate-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">Land deeds, certifications, photos (PDF, PNG, JPG)</p>
                    </div>
                    <Input id="proof-upload" type="file" className="hidden" />
                    </label>
                </div>
                </div>
            </form>
            </CardContent>
            <CardFooter>
            <Button type="submit" size="lg" className="w-full cursor-pointer bg-green-500 hover:bg-green-600 text-lg py-6">
                Submit Application
            </Button>
            </CardFooter>
        </Card>
        </div>
    </div>
  );
}

