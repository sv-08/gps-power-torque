
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Vehicle, TestRun, DynoStatus, PowerData } from '@/types/dyno';
import { calculatePower, findPeaks, generateTestId } from '@/utils/powerCalculations';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface DynoContextProps {
  vehicle: Vehicle;
  updateVehicle: (vehicle: Vehicle) => void;
  status: DynoStatus;
  setStatus: (status: DynoStatus) => void;
  currentTest: PowerData[];
  setCurrentTest: (data: PowerData[]) => void;
  savedTests: TestRun[];
  saveCurrentTest: () => void;
  deleteTest: (id: string) => void;
  processPowerData: (gpsReadings: any[]) => PowerData[];
  resetCurrentTest: () => void;
}

const DynoContext = createContext<DynoContextProps | undefined>(undefined);

// Create local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export const DynoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default vehicle
  const [vehicle, setVehicle] = useState<Vehicle>({
    mass: 1500, // Default to 1500kg
    name: 'My Vehicle'
  });
  
  const [status, setStatus] = useState<DynoStatus>('idle');
  const [currentTest, setCurrentTest] = useState<PowerData[]>([]);
  const [savedTests, setSavedTests] = useLocalStorage<TestRun[]>('dyno-saved-tests', []);
  
  const updateVehicle = useCallback((newVehicle: Vehicle) => {
    setVehicle(newVehicle);
  }, []);
  
  const processPowerData = useCallback((gpsReadings: any[]) => {
    const powerData = calculatePower(gpsReadings, vehicle);
    setCurrentTest(powerData);
    return powerData;
  }, [vehicle]);
  
  const saveCurrentTest = useCallback(() => {
    if (currentTest.length === 0) return;
    
    const { maxPower, maxTorque } = findPeaks(currentTest);
    
    const newTest: TestRun = {
      id: generateTestId(),
      vehicle: { ...vehicle },
      date: new Date().toISOString(),
      maxPower,
      maxTorque,
      data: [...currentTest]
    };
    
    setSavedTests(prev => [newTest, ...prev]);
  }, [currentTest, vehicle, setSavedTests]);
  
  const deleteTest = useCallback((id: string) => {
    setSavedTests(prev => prev.filter(test => test.id !== id));
  }, [setSavedTests]);
  
  const resetCurrentTest = useCallback(() => {
    setCurrentTest([]);
    setStatus('idle');
  }, []);
  
  const value = {
    vehicle,
    updateVehicle,
    status,
    setStatus,
    currentTest,
    setCurrentTest,
    savedTests,
    saveCurrentTest,
    deleteTest,
    processPowerData,
    resetCurrentTest
  };
  
  return <DynoContext.Provider value={value}>{children}</DynoContext.Provider>;
};

export const useDyno = (): DynoContextProps => {
  const context = useContext(DynoContext);
  if (context === undefined) {
    throw new Error('useDyno must be used within a DynoProvider');
  }
  return context;
};
