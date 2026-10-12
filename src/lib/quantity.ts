const FRACTIONAL_UNITS = new Set(["kg", "sq. feet"]);

export function supportsFractionalQuantity(unit: string): boolean {
  return FRACTIONAL_UNITS.has(unit.trim().toLowerCase());
}

export function hasAtMostThreeDecimalPlaces(
  quantity: number | string,
): boolean {
  const value = String(quantity);
  const match = value.match(
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e([+-]?\d+))?$/i,
  );

  if (!match) return false;

  const mantissa = value.split(/[eE]/, 1)[0];
  const fractionalDigits = mantissa.split(".")[1]?.length ?? 0;
  const exponent = Number(match[1] ?? 0);

  return Math.max(0, fractionalDigits - exponent) <= 3;
}

export function isQuantityValidForUnit(
  quantity: number | string,
  unit: string,
): boolean {
  const value = Number(quantity);
  if (!Number.isFinite(value)) return false;

  if (supportsFractionalQuantity(unit)) {
    return hasAtMostThreeDecimalPlaces(quantity);
  }

  return Number.isInteger(value);
}
