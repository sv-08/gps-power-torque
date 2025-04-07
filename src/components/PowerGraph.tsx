
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDyno } from '@/context/DynoContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { findPeaks } from '@/utils/powerCalculations';
import { Bookmark, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PowerGraph: React.FC = () => {
  const { currentTest, status, saveCurrentTest } = useDyno();
  const { toast } = useToast();
  
  // Only show graph if we have data
  if (currentTest.length === 0 || status !== 'complete') {
    return null;
  }
  
  const { maxPower, maxTorque } = findPeaks(currentTest);
  
  const handleSave = () => {
    saveCurrentTest();
    toast({
      title: "Test saved",
      description: "You can view it in your saved tests",
    });
  };
  
  return (
    <Card className="bg-racing-gray border-racing-gray shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-lg">Power Results</CardTitle>
          </div>
          <Button 
            onClick={handleSave} 
            size="sm" 
            className="bg-racing-red hover:bg-red-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Run
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-racing-black rounded-lg">
            <p className="text-muted-foreground text-sm">Max Power</p>
            <p className="text-2xl font-bold text-racing-red">{Math.round(maxPower)} HP</p>
          </div>
          
          <div className="text-center p-4 bg-racing-black rounded-lg">
            <p className="text-muted-foreground text-sm">Max Torque</p>
            <p className="text-2xl font-bold text-racing-red">{Math.round(maxTorque)} Nm</p>
          </div>
        </div>
        
        <div className="h-72 w-full power-graph">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={currentTest}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="speed"
                label={{ value: 'Speed (km/h)', position: 'insideBottomRight', offset: 0, fill: '#aaa' }}
                stroke="#aaa"
              />
              <YAxis 
                yAxisId="left"
                label={{ value: 'Power (HP)', angle: -90, position: 'insideLeft', fill: '#aaa' }}
                stroke="#aaa"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                label={{ value: 'Torque (Nm)', angle: 90, position: 'insideRight', fill: '#aaa' }}
                stroke="#aaa"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#15151e', border: 'none' }} 
                labelStyle={{ color: '#f0f0f0' }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="power" 
                name="Power (HP)"
                stroke="#e10600"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="torque" 
                name="Torque (Nm)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerGraph;
