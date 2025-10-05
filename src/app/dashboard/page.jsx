'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { LineChart, DollarSign, Leaf, Users } from "lucide-react";
import Particles from '../components/Particles';

// Mock data for the dashboard
const dashboardData = {
  allianceName: "Vindhya Valley Growers",
  btrBalance: 4850.75,
  creditsGenerated: 15.3,
  progressToNextCredit: 75,
  recentCredits: [
    {
      id: "BATCH-001",
      date: "2025-10-01",
      amount: 5.1,
      status: "For Sale"
    },
    {
      id: "BATCH-002",
      date: "2025-09-15",
      amount: 4.5,
      status: "Sold"
    },
    {
      id: "BATCH-003",
      date: "2025-09-02",
      amount: 5.7,
      status: "Sold"
    }
  ]
};

const StatCard = ({ title, value, icon }) => (
  <Card className="bg-slate-900 border-slate-700">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  return (
    <div className="mt-15">
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
      <div className="min-h-screen  p-4 sm:p-8">
        <div className="container mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Producer Dashboard</h1>
            <p className="text-slate-400">Welcome back, {dashboardData.allianceName} member!</p>
          </header>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard 
              title="B3TR Balance" 
              value={dashboardData.btrBalance.toLocaleString()} 
              icon={<DollarSign className="h-4 w-4 text-slate-400" />}
            />
            <StatCard 
              title="Total Credits Generated (CO2e Ton)" 
              value={dashboardData.creditsGenerated.toFixed(1)} 
              icon={<Leaf className="h-4 w-4 text-slate-400" />}
            />
            <StatCard 
              title="Your Alliance" 
              value={dashboardData.allianceName} 
              icon={<Users className="h-4 w-4 text-slate-400" />}
            />
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Progress to Next Credit Batch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">{dashboardData.progressToNextCredit}%</div>
                <Progress value={dashboardData.progressToNextCredit} className="w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Credits Table */}
          <Card className="bg-slate-900 border-slate-700 text-slate-200">
            <CardHeader>
              <CardTitle className="text-white">Generated Carbon Credits</CardTitle>
              <CardDescription>Manage and list your generated credit batches for sale.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-white">Batch ID</TableHead>
                    <TableHead className="text-white">Date Generated</TableHead>
                    <TableHead className="text-white text-center">Amount (CO2e Ton)</TableHead>
                    <TableHead className="text-white text-center">Status</TableHead>
                    <TableHead className="text-right text-white">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.recentCredits.map((credit) => (
                    <TableRow key={credit.id} className="border-slate-800">
                      <TableCell className="font-medium">{credit.id}</TableCell>
                      <TableCell>{credit.date}</TableCell>
                      <TableCell className="text-center">{credit.amount.toFixed(1)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={credit.status === 'Sold' ? 'secondary' : 'default'} className={credit.status === 'For Sale' ? 'bg-green-500' : 'bg-slate-600'}>
                          {credit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" disabled={credit.status !== 'For Sale'}>
                          List on Marketplace
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

