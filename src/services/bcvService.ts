import { BCVRates } from '../types/finance';

const STORAGE_KEY_BCV = 'treinta_finance_bcv_rates_v1';

// Initial realistic baseline rates matching today's BCV publication from report
export const defaultBCVRates: BCVRates = {
  usdRate: 916.65,
  eurRate: 1007.39,
  paraleloRate: 1068.81,
  lastUpdated: '18 nov 2026, 09:08 a. m.',
  source: 'Banco Central de Venezuela (BCV Oficial)',
  isLive: true,
};

export const getCachedBCVRates = (): BCVRates => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BCV);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.usdRate > 0 && parsed.eurRate > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }
  return defaultBCVRates;
};

export const fetchLiveBCVRates = async (): Promise<BCVRates> => {
  try {
    // Fetch USD and EUR official rates in parallel
    const [usdRes, eurRes, paraleloRes] = await Promise.allSettled([
      fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
      fetch('https://ve.dolarapi.com/v1/euros/oficial'),
      fetch('https://ve.dolarapi.com/v1/dolares/paralelo'),
    ]);

    let usdRate = defaultBCVRates.usdRate;
    let eurRate = defaultBCVRates.eurRate;
    let paraleloRate = defaultBCVRates.paraleloRate;
    let updateTime = new Date().toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (usdRes.status === 'fulfilled' && usdRes.value.ok) {
      const data = await usdRes.value.json();
      if (data && typeof data.promedio === 'number' && data.promedio > 0) {
        usdRate = data.promedio;
        if (data.fechaActualizacion) {
          updateTime = new Date(data.fechaActualizacion).toLocaleDateString('es-VE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      }
    }

    if (eurRes.status === 'fulfilled' && eurRes.value.ok) {
      const data = await eurRes.value.json();
      if (data && typeof data.promedio === 'number' && data.promedio > 0) {
        eurRate = data.promedio;
      }
    }

    if (paraleloRes.status === 'fulfilled' && paraleloRes.value.ok) {
      const data = await paraleloRes.value.json();
      if (data && typeof data.promedio === 'number' && data.promedio > 0) {
        paraleloRate = data.promedio;
      }
    }

    const newRates: BCVRates = {
      usdRate,
      eurRate,
      paraleloRate,
      lastUpdated: updateTime,
      source: 'Banco Central de Venezuela (BCV Oficial)',
      isLive: true,
    };

    localStorage.setItem(STORAGE_KEY_BCV, JSON.stringify(newRates));
    return newRates;
  } catch (error) {
    console.warn('No se pudo conectar a la API del BCV en vivo, utilizando tasas de respaldo:', error);
    return getCachedBCVRates();
  }
};

/**
 * Currency conversion based on BCV exchange rates:
 * Base internal currency is USD.
 */
export const convertCurrency = (
  amount: number,
  from: 'USD' | 'VES' | 'EUR',
  to: 'USD' | 'VES' | 'EUR',
  rates: BCVRates
): number => {
  if (from === to) return amount;
  if (amount === 0) return 0;

  const usdRate = rates.usdRate || 911.62;
  const eurRate = rates.eurRate || 1009.34;

  // Step 1: Convert `from` to Bolívares (VES)
  let inVES = 0;
  if (from === 'VES') {
    inVES = amount;
  } else if (from === 'USD') {
    inVES = amount * usdRate;
  } else if (from === 'EUR') {
    inVES = amount * eurRate;
  }

  // Step 2: Convert Bolívares (VES) to target `to`
  if (to === 'VES') {
    return inVES;
  } else if (to === 'USD') {
    return inVES / usdRate;
  } else if (to === 'EUR') {
    return inVES / eurRate;
  }

  return amount;
};

/**
 * Formats a currency amount with correct Venezuelan Bolívares, USD or EUR formatting
 */
export const formatBcvCurrency = (
  amount: number,
  currency: 'USD' | 'VES' | 'EUR' = 'USD'
): string => {
  if (currency === 'VES') {
    return `Bs. ${amount.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (currency === 'EUR') {
    return `€ ${amount.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$ ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export interface CurrencyBreakdown {
  primaryAmount: number;
  primaryCurrency: 'USD' | 'EUR';
  primaryFormatted: string;
  counterpartCurrency: 'USD' | 'EUR';
  counterpartAmount: number;
  counterpartFormatted: string;
  vesAmount: number;
  vesFormatted: string;
  compactSummary: string; // e.g. "≈ € 9.03 | Bs. 9,116.24"
}

/**
 * Calculates primary currency and both counterparts (foreign currency + bolívares)
 * using Banco Central de Venezuela (BCV) official exchange rates.
 */
export const getCurrencyBreakdown = (
  amountInUSD: number,
  primaryCurrency: 'USD' | 'EUR' = 'USD',
  rates: BCVRates
): CurrencyBreakdown => {
  const usdRate = rates.usdRate || 911.6243;
  const eurRate = rates.eurRate || 1009.3413;

  // Cross conversion
  const inEUR = (amountInUSD * usdRate) / eurRate;
  const inVES = amountInUSD * usdRate;

  if (primaryCurrency === 'EUR') {
    return {
      primaryAmount: inEUR,
      primaryCurrency: 'EUR',
      primaryFormatted: formatBcvCurrency(inEUR, 'EUR'),
      counterpartCurrency: 'USD',
      counterpartAmount: amountInUSD,
      counterpartFormatted: formatBcvCurrency(amountInUSD, 'USD'),
      vesAmount: inVES,
      vesFormatted: formatBcvCurrency(inVES, 'VES'),
      compactSummary: `≈ ${formatBcvCurrency(amountInUSD, 'USD')} | ${formatBcvCurrency(inVES, 'VES')}`,
    };
  }

  return {
    primaryAmount: amountInUSD,
    primaryCurrency: 'USD',
    primaryFormatted: formatBcvCurrency(amountInUSD, 'USD'),
    counterpartCurrency: 'EUR',
    counterpartAmount: inEUR,
    counterpartFormatted: formatBcvCurrency(inEUR, 'EUR'),
    vesAmount: inVES,
    vesFormatted: formatBcvCurrency(inVES, 'VES'),
    compactSummary: `≈ ${formatBcvCurrency(inEUR, 'EUR')} | ${formatBcvCurrency(inVES, 'VES')}`,
  };
};
