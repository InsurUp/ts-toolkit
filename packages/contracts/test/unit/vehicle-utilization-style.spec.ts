import { describe, it, expect } from 'vitest';
import {
  VehicleUtilizationStyle,
  VehicleUtilizationStyleOrdinal,
} from '../../src/common.vehicle.js';

describe('VehicleUtilizationStyleOrdinal', () => {
  const styles = Object.values(VehicleUtilizationStyle);

  it('maps every enum member to an ordinal', () => {
    for (const style of styles) {
      expect(VehicleUtilizationStyleOrdinal[style]).toBeTypeOf('number');
    }
  });

  it('assigns ordinals matching the backend declaration order (0..71, no gaps)', () => {
    const ordinals = styles.map((style) => VehicleUtilizationStyleOrdinal[style]);
    expect(ordinals).toEqual(styles.map((_, index) => index));
    expect(new Set(ordinals).size).toBe(ordinals.length);
  });

  it('matches the backend ordinals for representative members', () => {
    expect(VehicleUtilizationStyleOrdinal[VehicleUtilizationStyle.Unknown]).toBe(0);
    expect(VehicleUtilizationStyleOrdinal[VehicleUtilizationStyle.PrivateCar]).toBe(1);
    expect(VehicleUtilizationStyleOrdinal[VehicleUtilizationStyle.Truck]).toBe(8);
    expect(VehicleUtilizationStyleOrdinal[VehicleUtilizationStyle.PanelGlassVanKamyonet]).toBe(71);
  });
});
