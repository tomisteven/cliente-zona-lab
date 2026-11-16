const STORAGE_KEY = 'zl_quote_draft';

export function readQuoteDraft() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function saveQuoteDraft(draft) {
  if (!draft?.slug) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        slug: draft.slug,
        selections: draft.selections ?? {},
        quantity: draft.quantity ?? '',
        designNotes: draft.designNotes ?? '',
        savedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // El borrador es una mejora de experiencia; si falla, el wizard sigue funcionando.
  }
}

export function clearQuoteDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin almacenamiento disponible no hay nada que limpiar.
  }
}
