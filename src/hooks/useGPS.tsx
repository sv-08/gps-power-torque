
import { useState, useEffect, useCallback } from 'react';
import { GPSData } from '@/types/dyno';
import { useToast } from '@/components/ui/use-toast';

export const useGPS = () => {
  const [gpsData, setGpsData] = useState<GPSData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [readings, setReadings] = useState<GPSData[]>([]);
  const { toast } = useToast();
  
  // Convert speed from m/s to km/h for display
  const speedKmh = gpsData ? Math.round(gpsData.speed * 3.6) : 0;
  
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast({
        variant: 'destructive',
        title: 'GPS Error',
        description: 'Geolocation is not supported by your browser'
      });
      return;
    }
    
    setError(null);
    setReadings([]);
    
    // Maximum performance settings for GPS
    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,      // Don't use cached positions
      timeout: 1000       // Further reduced timeout for faster updates (from 2000ms to 1000ms)
    };

    // We'll rely more on the polling approach since it can be more consistent
    // watchPosition as a backup for continuous monitoring
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newData: GPSData = {
          speed: position.coords.speed || 0,
          timestamp: position.timestamp,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setGpsData(newData);
        setReadings(prev => [...prev, newData]);
      },
      (err) => {
        setError(`GPS Error: ${err.message}`);
        toast({
          variant: 'destructive',
          title: 'GPS Error',
          description: err.message
        });
      },
      options
    );
    
    setWatchId(id);
    setIsTracking(true);
    
    // Aggressive polling at 10Hz (100ms) for maximum data points
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newData: GPSData = {
            speed: position.coords.speed || 0,
            timestamp: position.timestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          // Only add if timestamp is different from last reading
          setReadings(prev => {
            if (prev.length === 0 || prev[prev.length-1].timestamp !== newData.timestamp) {
              setGpsData(newData);
              return [...prev, newData];
            }
            return prev;
          });
        },
        // Silently fail on interval errors to not spam the user
        () => {},
        options
      );
    }, 100); // Set to 100ms interval for 10Hz sampling
    
    // Return a cleanup function
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(intervalId);
    };
  }, [toast]);
  
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
    }
  }, [watchId]);
  
  // Clean up all resources on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);
  
  return {
    gpsData,
    speedKmh,
    isTracking,
    error,
    readings,
    startTracking,
    stopTracking
  };
};
