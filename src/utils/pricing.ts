/**
 * Integer-based KWD and bundle pricing utilities.
 * All monetary sources of truth use integer fils (1 KWD = 1000 fils).
 */

export function formatKwdFromFils(priceFils: number): string {
  const safeFils = Math.round(Number.isFinite(priceFils) ? priceFils : 0);
  const kwd = safeFils / 1000;
  return `${kwd.toFixed(3)} KWD`;
}

export function formatKwdDecimalFromFils(priceFils: number): string {
  const safeFils = Math.round(Number.isFinite(priceFils) ? priceFils : 0);
  return (safeFils / 1000).toFixed(3);
}

/**
 * Converts a user-entered KWD value (e.g. "19.500" or "5.5") into exact integer fils.
 * Uses string decimal parsing where possible to avoid IEEE-754 floating-point drift.
 */
export function parseKwdToFils(input: string | number): number | null {
  const raw = typeof input === 'number' ? input.toString() : input.trim();
  if (!raw) return null;

  if (!/^\d+(\.\d{1,3})?$/.test(raw)) {
    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return null;
    }
    const rounded = Math.round(numeric * 1000);
    return rounded > 0 ? rounded : null;
  }

  const [wholePart, fracPart = ''] = raw.split('.');
  const paddedFrac = fracPart.padEnd(3, '0').slice(0, 3);
  const fils = Number.parseInt(wholePart, 10) * 1000 + Number.parseInt(paddedFrac, 10);

  if (!Number.isSafeInteger(fils) || fils <= 0) {
    return null;
  }
  return fils;
}

export function calculateLineTotal(priceFils: number, bundleQuantity: number): number {
  const safeFils = Math.round(Number.isFinite(priceFils) ? priceFils : 0);
  const safeQty = Math.max(0, Math.trunc(Number.isFinite(bundleQuantity) ? bundleQuantity : 0));
  return safeFils * safeQty;
}

export function calculateInternalUnits(unitsPerBundle: number, bundleQuantity: number): number {
  const safeUnits = Math.max(0, Math.trunc(Number.isFinite(unitsPerBundle) ? unitsPerBundle : 0));
  const safeQty = Math.max(0, Math.trunc(Number.isFinite(bundleQuantity) ? bundleQuantity : 0));
  return safeUnits * safeQty;
}

export function formatBundlePackLabel(unitsPerBundle: number): string {
  return unitsPerBundle === 1 ? '1 pack' : `${unitsPerBundle} packs`;
}

export function formatBundlePackHyphenLabel(unitsPerBundle: number): string {
  return `${unitsPerBundle}-pack`;
}

export function formatBundleCountLabel(bundleQuantity: number): string {
  return bundleQuantity === 1 ? '1 bundle' : `${bundleQuantity} bundles`;
}
