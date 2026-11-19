import { parseKwdToFils } from './pricing';

export function parsePositiveInt(value: string | number): number | null {
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value <= 0) return null;
    return value;
  }
  const trimmed = value.trim();
  if (!/^[1-9]\d*$/.test(trimmed)) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export interface EditablePricingTierRow {
  clientId: string;
  id?: string;
  unitsPerBundle: string;
  priceKwd: string;
}

export interface TierValidationErrors {
  unitsPerBundle?: string;
  priceKwd?: string;
}

export interface ProductFormValidationResult {
  isValid: boolean;
  fieldErrors: {
    name?: string;
    description?: string;
    imageUrl?: string;
    brandId?: string;
    categoryId?: string;
    tiersGeneral?: string;
    tierRows: Record<string, TierValidationErrors>;
  };
}

export function validateProductForm(values: {
  name: string;
  description: string;
  imageUrl: string;
  brandId: string;
  categoryId: string;
  tiers: EditablePricingTierRow[];
}): ProductFormValidationResult {
  const fieldErrors: ProductFormValidationResult['fieldErrors'] = {
    tierRows: {},
  };

  if (!values.name.trim()) {
    fieldErrors.name = 'Product name is required.';
  } else if (values.name.trim().length < 2) {
    fieldErrors.name = 'Product name must be at least 2 characters.';
  }

  if (!values.description.trim()) {
    fieldErrors.description = 'Product description is required.';
  }

  const trimmedImage = values.imageUrl.trim();
  if (trimmedImage) {
    const isRelative = trimmedImage.startsWith('/');
    if (!isRelative) {
      try {
        const parsed = new URL(trimmedImage);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          fieldErrors.imageUrl = 'Image URL must use http://, https://, or a root-relative path.';
        }
      } catch {
        fieldErrors.imageUrl = 'Enter a valid image URL or leave blank.';
      }
    }
  }

  if (!values.brandId) {
    fieldErrors.brandId = 'Please select a brand.';
  }

  if (!values.categoryId) {
    fieldErrors.categoryId = 'Please select a category.';
  }

  if (!values.tiers || values.tiers.length === 0) {
    fieldErrors.tiersGeneral = 'At least one pricing tier is required before saving.';
  } else {
    const seenUnits = new Map<number, string[]>();

    for (const row of values.tiers) {
      const rowErrors: TierValidationErrors = {};
      const parsedUnits = parsePositiveInt(row.unitsPerBundle);
      if (parsedUnits === null) {
        rowErrors.unitsPerBundle = 'Must be a positive whole integer (1 or more).';
      } else {
        const existing = seenUnits.get(parsedUnits) ?? [];
        existing.push(row.clientId);
        seenUnits.set(parsedUnits, existing);
      }

      const parsedFils = parseKwdToFils(row.priceKwd);
      if (parsedFils === null || parsedFils <= 0) {
        rowErrors.priceKwd = 'Enter a bundle price greater than 0.000 KWD (up to 3 decimals).';
      }

      if (rowErrors.unitsPerBundle || rowErrors.priceKwd) {
        fieldErrors.tierRows[row.clientId] = rowErrors;
      }
    }

    for (const [, clientIds] of seenUnits.entries()) {
      if (clientIds.length > 1) {
        for (const cid of clientIds) {
          fieldErrors.tierRows[cid] = {
            ...fieldErrors.tierRows[cid],
            unitsPerBundle: 'Duplicate units per bundle are not allowed on the same product.',
          };
        }
      }
    }
  }

  const hasRowErrors = Object.keys(fieldErrors.tierRows).length > 0;
  const isValid =
    !fieldErrors.name &&
    !fieldErrors.description &&
    !fieldErrors.imageUrl &&
    !fieldErrors.brandId &&
    !fieldErrors.categoryId &&
    !fieldErrors.tiersGeneral &&
    !hasRowErrors;

  return { isValid, fieldErrors };
}

export function validateNamedEntity(name: string, label: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return `${label} name is required.`;
  }
  if (trimmed.length < 2) {
    return `${label} name must be at least 2 characters.`;
  }
  return null;
}
