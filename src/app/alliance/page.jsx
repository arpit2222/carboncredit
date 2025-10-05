'use client';

import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Users, PlusCircle } from "lucide-react";
import Particles from '../components/Particles';

// Mock data for demonstration
const alliances = [
  {
    name: "Vindhya Valley Growers",
    members: 12,
    totalLand: 28.5,
    status: "Open"
  },
  {
    name: "Deccan Eco-Farmers",
    members: 8,
    totalLand: 19.0,
    status: "Open"
  },
  {
    name: "Himalayan Regenerative Collective",
    members: 25,
    totalLand: 55.2,
    status: "Full"
  }
];

export default function AlliancePage() {
  return (
    <div className="mt-10">
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
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl">
            <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid cursor-pointer w-full grid-cols-2 bg-slate-800 text-white border-slate-700">
                {/* Added styles for the active state to both triggers */}
                <TabsTrigger value="discover" className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-900">Discover Alliances</TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-900">Create an Alliance</TabsTrigger>
            </TabsList>
            
            {/* Discover Alliances Tab */}
            <TabsContent value="discover">
                {/* Added min-height to stabilize the layout */}
                <Card className="bg-slate-900 border-slate-700 text-slate-200 min-h-[520px]">
                <CardHeader>
                    <CardTitle className="text-white">Join an Existing Alliance</CardTitle>
                    <CardDescription>Browse and request to join nearby farmer collectives.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700">
                        <TableHead className="text-white">Alliance Name</TableHead>
                        <TableHead className="text-white text-center">Members</TableHead>
                        <TableHead className="text-white text-center">Land (Hectares)</TableHead>
                        <TableHead className="text-right text-white">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alliances.map((alliance) => (
                        <TableRow key={alliance.name} className="border-slate-800">
                            <TableCell className="font-medium">{alliance.name}</TableCell>
                            <TableCell className="text-center">{alliance.members}</TableCell>
                            <TableCell className="text-center">{alliance.totalLand.toFixed(1)}</TableCell>
                            <TableCell className="text-right">
                            <Button 
                                variant={alliance.status === 'Open' ? 'secondary' : 'outline'} 
                                size="sm"
                                disabled={alliance.status !== 'Open'}
                                >
                                {alliance.status === 'Open' ? 'Request to Join' : 'Full'}
                            </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
                </Card>
            </TabsContent>

            {/* Create Alliance Tab */}
            <TabsContent value="create">
                {/* Added min-height to stabilize the layout */}
                <Card className="bg-slate-900 border-slate-700 text-slate-200 min-h-[520px]">
                <CardHeader className="items-center text-center">
                    <div className="mx-auto bg-blue-900/50 border border-blue-700 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-blue-400" />
                    </div>
                    <CardTitle className="text-white">Form Your Own Collective</CardTitle>
                    <CardDescription>Bring together local farmers to pool resources and generate credits.</CardDescription>
                </CardHeader>
                <CardContent className="text-center p-12 flex items-center justify-center">
                    <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg" className="bg-green-500 hover:bg-green-600 text-lg py-6 px-8">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create a New Alliance
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-slate-200">
                        <DialogHeader>
                        <DialogTitle className="text-white">New Alliance Details</DialogTitle>
                        <DialogDescription>
                            Set up your new on-chain organization. This can be edited later.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" placeholder="e.g., Coastal Growers United" className="col-span-3 bg-slate-800 border-slate-600" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Input id="description" placeholder="A collective for sustainable farming..." className="col-span-3 bg-slate-800 border-slate-600" />
                        </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit" className="bg-green-500 hover:bg-green-600">Create Alliance</Button>
                        </DialogFooter>
                    </DialogContent>
                    </Dialog>
                </CardContent>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
        </div>
    </div>
  );
}