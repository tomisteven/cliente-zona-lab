const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'A cotizar';
  }

  return currencyFormatter.format(Number(value));
}

export function formatDate(value, { withTime = false } = {}) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return withTime ? dateTimeFormatter.format(date) : dateFormatter.format(date);
}

export function formatQuantityRange(tier) {
  if (tier.maxQuantity === null || tier.maxQuantity === undefined) {
    return `${tier.minQuantity} o más unidades`;
  }

  if (tier.minQuantity === tier.maxQuantity) {
    return `${tier.minQuantity} unidades`;
  }

  return `${tier.minQuantity} a ${tier.maxQuantity} unidades`;
}

export function formatFileSize(sizeBytes) {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return '0 KB';
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.ceil(sizeBytes / 1024)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getErrorMessage(error, fallback = 'No se pudo completar la operación.') {
  if (error && typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
