const STORAGE_KEY = 'zl_attribution';
const UTM_FIELDS = {
  utm_source: 'source',
  utm_medium: 'medium',
  utm_campaign: 'campaign',
  utm_term: 'term',
  utm_content: 'content',
};

function readStored() {
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

export function getAttribution() {
  return readStored() ?? {};
}

export function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const values = {};

  for (const [parameter, field] of Object.entries(UTM_FIELDS)) {
    values[field] = params.get(parameter)?.trim().slice(0, 120) ?? '';
  }

  const hasCampaign = Object.values(values).some(Boolean);

  if (!hasCampaign) {
    return getAttribution();
  }

  const attribution = {
    ...values,
    landingPage: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    referrer: (document.referrer || '').slice(0, 1000),
    capturedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    return attribution;
  }

  return attribution;
}
