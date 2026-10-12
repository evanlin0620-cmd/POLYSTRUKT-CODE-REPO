import { CADUnitLength, CADUnitAngle } from './types';

/**
 * Strict Unit Conversion Engine for Professional CAD Systems.
 * Never relies on implicit unit conversions.
 */

// Exact conversion factors to standard SI base millimeters (mm)
const LENGTH_FACTORS_TO_MM: Record<CADUnitLength, number> = {
  mm: 1.0,
  cm: 10.0,
  m: 1000.0,
  in: 25.4,
  ft: 304.8,
};

export class CADUnitSystem {
  /**
   * Converts a length value from source units to target units with exact floating-point precision.
   */
  public static convertLength(
    value: number,
    from: CADUnitLength,
    to: CADUnitLength
  ): number {
    if (from === to) return value;
    const valueInMm = value * LENGTH_FACTORS_TO_MM[from];
    const converted = valueInMm / LENGTH_FACTORS_TO_MM[to];
    // Clean IEEE-754 floating point artifacts
    return Math.round(converted * 1e12) / 1e12;
  }

  /**
   * Converts angles between degrees and radians.
   */
  public static convertAngle(
    value: number,
    from: CADUnitAngle,
    to: CADUnitAngle
  ): number {
    if (from === to) return value;
    if (from === 'deg' && to === 'rad') {
      return (value * Math.PI) / 180.0;
    }
    if (from === 'rad' && to === 'deg') {
      return (value * 180.0) / Math.PI;
    }
    return value;
  }

  /**
   * Formats a dimension with unit symbol according to engineering standard conventions.
   */
  public static formatWithUnit(
    value: number,
    unit: CADUnitLength | CADUnitAngle,
    precision: number = 3
  ): string {
    const rounded = Number(value.toFixed(precision));
    return `${rounded} ${unit}`;
  }

  /**
   * Parses dimension strings with embedded units (e.g. "50 mm", "2.5 in", "15 deg")
   */
  public static parseDimension(
    input: string,
    defaultUnit: CADUnitLength = 'mm'
  ): { value: number; unit: CADUnitLength } {
    const trimmed = input.trim().toLowerCase();
    const match = trimmed.match(/^([-+]?[0-9]*\.?[0-9]+)\s*([a-z]+)?$/);
    if (!match) {
      const fallbackVal = parseFloat(trimmed);
      return {
        value: isNaN(fallbackVal) ? 0 : fallbackVal,
        unit: defaultUnit,
      };
    }

    const num = parseFloat(match[1]);
    const rawUnit = match[2];

    let unit: CADUnitLength = defaultUnit;
    if (rawUnit === 'mm' || rawUnit === 'millimeter' || rawUnit === 'millimeters') unit = 'mm';
    else if (rawUnit === 'cm' || rawUnit === 'centimeter') unit = 'cm';
    else if (rawUnit === 'm' || rawUnit === 'meter' || rawUnit === 'meters') unit = 'm';
    else if (rawUnit === 'in' || rawUnit === 'inch' || rawUnit === 'inches') unit = 'in';
    else if (rawUnit === 'ft' || rawUnit === 'foot' || rawUnit === 'feet') unit = 'ft';

    return { value: num, unit };
  }
}
