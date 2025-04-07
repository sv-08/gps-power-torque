
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDyno } from '@/context/DynoContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TestRun } from '@/types/dyno';
import { BarChart2, Clock, Trash2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { formatDistanceToNow } from 'date-fns';

const TestResults: React.FC = () => {
  const { savedTests, deleteTest } = useDyno();
  const [selectedTest, setSelectedTest] = useState<TestRun | null>(null);
  
  if (savedTests.length === 0) {
    return null;
  }
  
  const handleViewTest = (test: TestRun) => {
    setSelectedTest(test);
  };
  
  const handleDeleteTest = (id: string) => {
    deleteTest(id);
    if (selectedTest?.id === id) {
      setSelectedTest(null);
    }
  };
  
  return (
    <Card className="bg-racing-gray border-racing-gray shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-racing-red" />
          <CardTitle className="text-lg">Saved Tests</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list">
          <TabsList className="bg-racing-black">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="graph" disabled={!selectedTest}>Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="border-none p-0 mt-4">
            <div className="space-y-2">
              {savedTests.map((test) => (
                <div 
                  key={test.id} 
                  className="p-3 bg-racing-black rounded-md flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-semibold">{test.vehicle.name}</h4>
                      <span className="ml-2 text-muted-foreground text-xs flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(test.date), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(test.maxPower)} HP / {Math.round(test.maxTorque)} Nm
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-racing-gray text-racing-light hover:bg-racing-black"
                      onClick={() => handleViewTest(test)}
                    >
                      View
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-racing-gray border-racing-gray">
                        <DialogHeader>
                          <DialogTitle>Delete Test</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this test? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" className="border-racing-gray text-racing-light">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDeleteTest(test.id)}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="graph" className="border-none p-0 mt-4">
            {selectedTest && (
              <div className="space-y-4">
                <div className="bg-racing-black p-4 rounded-md">
                  <h3 className="font-semibold mb-1">{selectedTest.vehicle.name}</h3>
                  <div className="text-sm text-muted-foreground mb-3">
                    Tested {new Date(selectedTest.date).toLocaleDateString()} - Vehicle mass: {selectedTest.vehicle.mass}kg
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 bg-racing-gray rounded-lg">
                      <p className="text-muted-foreground text-xs">Max Power</p>
                      <p className="text-xl font-bold text-racing-red">{Math.round(selectedTest.maxPower)} HP</p>
                    </div>
                    
                    <div className="text-center p-2 bg-racing-gray rounded-lg">
                      <p className="text-muted-foreground text-xs">Max Torque</p>
                      <p className="text-xl font-bold text-racing-red">{Math.round(selectedTest.maxTorque)} Nm</p>
                    </div>
                  </div>
                </div>
                
                <div className="h-72 w-full power-graph">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={selectedTest.data}
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
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TestResults;
