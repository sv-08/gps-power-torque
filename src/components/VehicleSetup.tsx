
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDyno } from '@/context/DynoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';

const VehicleSetup: React.FC = () => {
  const { vehicle, updateVehicle } = useDyno();
  
  const handleMassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mass = parseInt(e.target.value) || 0;
    updateVehicle({ ...vehicle, mass });
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateVehicle({ ...vehicle, name: e.target.value });
  };
  
  return (
    <Card className="bg-racing-gray border-racing-gray shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center">
          <Car className="h-6 w-6 mr-2 text-racing-red" />
          <CardTitle className="text-lg">Vehicle Setup</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle-name">Vehicle Name</Label>
            <Input
              id="vehicle-name"
              value={vehicle.name}
              onChange={handleNameChange}
              className="bg-racing-black border-racing-gray text-racing-light"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicle-mass">
              Vehicle Mass (kg)
            </Label>
            <Input
              id="vehicle-mass"
              type="number"
              min="500"
              max="10000"
              value={vehicle.mass}
              onChange={handleMassChange}
              className="bg-racing-black border-racing-gray text-racing-light"
            />
            <p className="text-xs text-muted-foreground">
              Mass is essential for accurate power calculations
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleSetup;
