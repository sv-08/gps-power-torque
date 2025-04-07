
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
    
    // Request high accuracy and update frequency
    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    };

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
    
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [toast]);
  
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
    }
  }, [watchId]);
  
  // Clear tracking on unmount
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
