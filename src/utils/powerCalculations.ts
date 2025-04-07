
import { GPSData, PowerData, Vehicle } from '@/types/dyno';

// Constants
const G = 9.81; // Gravity constant in m/s²
const AIR_DENSITY = 1.225; // kg/m³
const DRAG_COEFFICIENT = 0.3; // Default, but could be configured per vehicle
const FRONTAL_AREA = 2.2; // m², default, but could be configured per vehicle
const ROLLING_RESISTANCE = 0.015; // Default, but could be configured
const KW_TO_HP = 1.34102; // Conversion from kW to horsepower

/**
 * Calculates power (in horsepower) from GPS readings and vehicle data
 */
export const calculatePower = (
  readings: GPSData[],
  vehicle: Vehicle
): PowerData[] => {
  if (readings.length < 2) return [];
  
  const powerData: PowerData[] = [];
  const firstTimestamp = readings[0].timestamp;
  
  // Process raw GPS data into time series with power calculations
  for (let i = 1; i < readings.length; i++) {
    const prev = readings[i - 1];
    const current = readings[i];
    
    // Time step in seconds
    const deltaTime = (current.timestamp - prev.timestamp) / 1000;
    if (deltaTime <= 0) continue; // Skip invalid time steps
    
    // Calculate acceleration in m/s²
    const acceleration = (current.speed - prev.speed) / deltaTime;
    
    // Current speed in m/s
    const speed = current.speed;
    
    // Resistance forces
    // 1. Rolling resistance
    const rollingResistance = ROLLING_RESISTANCE * vehicle.mass * G;
    
    // 2. Aerodynamic drag
    const aerodynamicDrag = 0.5 * AIR_DENSITY * DRAG_COEFFICIENT * FRONTAL_AREA * speed * speed;
    
    // 3. Acceleration force
    const accelerationForce = vehicle.mass * acceleration;
    
    // Total force
    const totalForce = rollingResistance + aerodynamicDrag + accelerationForce;
    
    // Power in watts
    const powerWatts = totalForce * speed;
    
    // Convert watts to horsepower
    const powerHP = (powerWatts / 1000) * KW_TO_HP;
    
    // Torque in Nm (P = τω, so τ = P/ω)
    const angularVelocity = speed > 0 ? speed / 0.3 : 0.1; // Approximate wheel radius of 0.3m
    const torque = powerWatts / angularVelocity;
    
    // Relative time from start in seconds
    const timeFromStart = (current.timestamp - firstTimestamp) / 1000;
    
    powerData.push({
      power: Math.max(0, powerHP), // Ensure non-negative
      torque: Math.max(0, torque), // Ensure non-negative
      speed: speed * 3.6, // Convert m/s to km/h
      time: timeFromStart
    });
  }
  
  return powerData;
};

/**
 * Find peak power and torque from the data
 */
export const findPeaks = (data: PowerData[]) => {
  if (data.length === 0) return { maxPower: 0, maxTorque: 0 };
  
  let maxPower = 0;
  let maxTorque = 0;
  
  data.forEach(point => {
    maxPower = Math.max(maxPower, point.power);
    maxTorque = Math.max(maxTorque, point.torque);
  });
  
  return { maxPower, maxTorque };
};

/**
 * Generate a unique ID for test runs
 */
export const generateTestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
