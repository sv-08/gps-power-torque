
import React from 'react';
import { DynoProvider } from '@/context/DynoContext';
import VehicleSetup from '@/components/VehicleSetup';
import PowerMeter from '@/components/PowerMeter';
import PowerGraph from '@/components/PowerGraph';
import TestResults from '@/components/TestResults';
import { Gauge } from 'lucide-react';

const Index = () => {
  return (
    <DynoProvider>
      <div className="min-h-screen flex flex-col bg-racing-black text-racing-light">
        <header className="border-b border-racing-gray p-4">
          <div className="container flex items-center justify-center">
            <Gauge className="h-6 w-6 mr-2 text-racing-red" />
            <h1 className="text-xl font-bold">GPS Power Dyno</h1>
          </div>
        </header>
        
        <main className="flex-1 container py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <PowerMeter />
              <TestResults />
            </div>
            
            <div className="space-y-6">
              <VehicleSetup />
              <PowerGraph />
            </div>
          </div>
        </main>
        
        <footer className="border-t border-racing-gray p-4 text-center text-sm text-muted-foreground">
          <p>GPS Power & Torque Dynamometer</p>
        </footer>
      </div>
    </DynoProvider>
  );
};

export default Index;
