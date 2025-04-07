import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGPS } from '@/hooks/useGPS';
import { useDyno } from '@/context/DynoContext';
import { Play, Square, RotateCcw, AlertTriangle, Gauge } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PowerMeter: React.FC = () => {
  const { gpsData, speedKmh, isTracking, error, readings, startTracking, stopTracking } = useGPS();
  const { status, setStatus, processPowerData, resetCurrentTest } = useDyno();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sampleRate, setSampleRate] = useState<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());
  const samplesCountRef = useRef<number[]>([]);
  
  // Calculate the current sample rate (readings per second)
  useEffect(() => {
    if (isTracking && readings.length > 0) {
      const now = Date.now();
      const elapsed = now - lastUpdateRef.current;
      
      // Update stats every 1 second
      if (elapsed >= 1000) {
        const samplesInLastSecond = readings.length - (samplesCountRef.current[samplesCountRef.current.length - 1] || 0);
        samplesCountRef.current.push(readings.length);
        
        // Calculate samples per second
        setSampleRate(samplesInLastSecond);
        lastUpdateRef.current = now;
        
        // Keep only the last 5 measurements for memory efficiency
        if (samplesCountRef.current.length > 5) {
          samplesCountRef.current.shift();
        }
      }
    } else if (!isTracking) {
      // Reset on stop
      samplesCountRef.current = [];
      setSampleRate(0);
    }
  }, [readings, isTracking]);
  
  // Handle status changes based on GPS tracking
  useEffect(() => {
    if (status === 'recording' && !isTracking) {
      startTracking();
    } else if (status === 'idle' && isTracking) {
      stopTracking();
    }
  }, [status, isTracking, startTracking, stopTracking]);
  
  // Handle the countdown timer
  useEffect(() => {
    let timer: number | null = null;
    
    if (countdown !== null && countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setStatus('recording');
      setCountdown(null);
    }
    
    return () => {
      if (timer !== null) clearTimeout(timer);
    };
  }, [countdown, setStatus]);
  
  const handleStart = () => {
    if (status === 'idle' || status === 'complete') {
      resetCurrentTest();
      setCountdown(3); // 3 second countdown
      setStatus('ready');
      
      toast({
        title: "Prepare to accelerate",
        description: "Recording will start in 3 seconds",
      });
    }
  };
  
  const handleStop = () => {
    if (status === 'recording') {
      stopTracking();
      setStatus('processing');
      
      // Process the data
      processPowerData(readings);
      setStatus('complete');
      
      toast({
        title: "Run complete",
        description: "Power data has been calculated",
      });
    }
  };
  
  const handleReset = () => {
    stopTracking();
    resetCurrentTest();
    toast({
      title: "Reset complete",
      description: "Ready for a new run",
    });
  };
  
  return (
    <div className="space-y-4">
      <Card className="bg-racing-gray border-racing-gray shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Gauge className="h-6 w-6 mr-2 text-racing-red" />
              <h3 className="font-semibold text-lg">Dynamometer</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {status === 'idle' && 'Ready'}
              {status === 'ready' && 'Starting...'}
              {status === 'recording' && 'Recording'}
              {status === 'processing' && 'Processing...'}
              {status === 'complete' && 'Run complete'}
            </div>
          </div>
          
          <div className="dyno-gauge w-full aspect-video rounded-lg flex flex-col justify-center items-center mb-6">
            {error ? (
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-racing-red mb-2" />
                <p className="text-racing-red font-medium">{error}</p>
              </div>
            ) : countdown !== null ? (
              <div className="text-center">
                <div className="text-7xl font-bold text-racing-red">{countdown}</div>
                <p className="text-racing-light mt-2">Get ready...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-7xl font-bold text-racing-light">{speedKmh}</div>
                <p className="text-muted-foreground mt-2">km/h</p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleStart}
              disabled={status === 'recording' || status === 'ready' || status === 'processing'}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
            
            <Button 
              onClick={handleStop}
              disabled={status !== 'recording'}
              className="flex-1 bg-racing-red hover:bg-red-700"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
            
            <Button 
              onClick={handleReset}
              variant="outline"
              className="border-racing-gray text-racing-light hover:bg-racing-black"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {(status === 'recording' || status === 'complete') && (
        <Card className="bg-racing-gray border-racing-gray shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">GPS Readings</p>
                <p className="text-2xl font-semibold">{readings.length}</p>
              </div>
              
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Refresh Rate</p>
                <p className="text-2xl font-semibold">
                  {sampleRate} <span className="text-xs">Hz</span>
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-muted-foreground text-sm">GPS Accuracy</p>
                <p className="text-2xl font-semibold">
                  {gpsData ? `${Math.round(gpsData.accuracy)}m` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PowerMeter;
