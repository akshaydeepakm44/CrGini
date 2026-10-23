/**
 * Currency & Tax Service for DiziGini Platform
 * 
 * Responsibilities:
 * 1. Dynamically fetch and cache daily live USD-to-INR exchange rates from verified forex APIs.
 * 2. Calculate Indian GST (Goods & Services Tax, 18% by default) for Razorpay INR transactions.
 * 3. Provide resilient fallbacks and bidirectional conversion helpers (USD <-> INR).
 */

const DEFAULT_USD_TO_INR = Number(process.env.USD_TO_INR_RATE || 94.90);
const DEFAULT_GST_RATE = Number(process.env.GST_RATE_PERCENT || 18);
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours cache TTL for daily stability

let cache = {
  rate: DEFAULT_USD_TO_INR,
  lastFetchedAt: null,
  source: 'INITIAL_DEFAULT',
  isLive: false,
};

/**
 * Fetch live USD to INR exchange rate with multi-source fallback and in-memory cache
 */
export async function getLiveUsdToInrRate({ forceRefresh = false } = {}) {
  const now = Date.now();

  // Return cached rate if still valid and not forced
  if (
    !forceRefresh &&
    cache.lastFetchedAt &&
    now - cache.lastFetchedAt < CACHE_TTL_MS
  ) {
    return {
      rate: cache.rate,
      lastFetchedAt: cache.lastFetchedAt,
      isLive: cache.isLive,
      source: cache.source,
      gstRatePercent: DEFAULT_GST_RATE,
    };
  }

  // 1. Primary Source: open.er-api.com (official real-time forex feed, no key required)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const inrRate = parseFloat(data?.rates?.INR);
      if (!isNaN(inrRate) && inrRate > 50 && inrRate < 200) {
        cache = {
          rate: Number(inrRate.toFixed(2)),
          lastFetchedAt: now,
          source: 'open.er-api.com',
          isLive: true,
        };
        return {
          rate: cache.rate,
          lastFetchedAt: cache.lastFetchedAt,
          isLive: true,
          source: cache.source,
          gstRatePercent: DEFAULT_GST_RATE,
        };
      }
    }
  } catch (err) {
    console.warn('[CurrencyService] Primary rate feed warning:', err.message);
  }

  // 2. Secondary Fallback Source: api.frankfurter.app (European Central Bank feed)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const inrRate = parseFloat(data?.rates?.INR);
      if (!isNaN(inrRate) && inrRate > 50 && inrRate < 200) {
        cache = {
          rate: Number(inrRate.toFixed(2)),
          lastFetchedAt: now,
          source: 'frankfurter.app',
          isLive: true,
        };
        return {
          rate: cache.rate,
          lastFetchedAt: cache.lastFetchedAt,
          isLive: true,
          source: cache.source,
          gstRatePercent: DEFAULT_GST_RATE,
        };
      }
    }
  } catch (err) {
    console.warn('[CurrencyService] Secondary rate feed warning:', err.message);
  }

  // 3. Fallback to environment variable or verified default
  if (!cache.lastFetchedAt) {
    cache.lastFetchedAt = now;
    cache.rate = DEFAULT_USD_TO_INR;
    cache.source = 'FALLBACK_ENV';
    cache.isLive = false;
  }

  return {
    rate: cache.rate,
    lastFetchedAt: cache.lastFetchedAt,
    isLive: cache.isLive,
    source: cache.source,
    gstRatePercent: DEFAULT_GST_RATE,
  };
}

/**
 * Synchronous helper to get current rate without awaiting
 */
export function getCurrentUsdToInrRate() {
  return cache.rate || DEFAULT_USD_TO_INR;
}

/**
 * Convert USD to INR
 */
export function convertUsdToInr(usdAmount, customRate = null) {
  const rate = customRate || cache.rate || DEFAULT_USD_TO_INR;
  return Math.round(Number(usdAmount || 0) * rate);
}

/**
 * Convert INR to USD
 */
export function convertInrToUsd(inrAmount, customRate = null) {
  const rate = customRate || cache.rate || DEFAULT_USD_TO_INR;
  if (!rate || rate <= 0) return 0;
  return Number((Number(inrAmount || 0) / rate).toFixed(2));
}

/**
 * Calculate Indian Goods and Services Tax (GST)
 * @param {number} baseAmountInr - Base price before tax
 * @param {number} [gstRatePercent=18] - GST rate percentage (defaults to 18%)
 */
export function calculateGst(baseAmountInr, gstRatePercent = DEFAULT_GST_RATE) {
  const base = Math.max(0, Math.round(Number(baseAmountInr || 0)));
  const rate = Number(gstRatePercent || DEFAULT_GST_RATE);
  const gstAmount = Math.round(base * (rate / 100));
  const totalAmount = base + gstAmount;

  return {
    baseAmount: base,
    gstRate: rate,
    gstAmount,
    totalAmount,
  };
}

/**
 * Full pricing calculation for a service ticket
 * Combines USD -> INR forex conversion + 18% GST calculation
 */
export async function calculateTicketPricing(priceUsd, { customRate = null } = {}) {
  const rateInfo = await getLiveUsdToInrRate();
  const effectiveRate = customRate ? Number(customRate) : rateInfo.rate;

  const validPriceUsd = Math.max(1, Number(priceUsd || 19));
  const baseAmountInr = Math.max(100, Math.round(validPriceUsd * effectiveRate));
  const tax = calculateGst(baseAmountInr, rateInfo.gstRatePercent);

  return {
    priceUsd: validPriceUsd,
    exchangeRate: effectiveRate,
    isLiveRate: rateInfo.isLive,
    rateSource: rateInfo.source,
    rateLastUpdated: rateInfo.lastFetchedAt,
    baseAmountInr: tax.baseAmount,
    gstRate: tax.gstRate,
    gstAmountInr: tax.gstAmount,
    totalAmountInr: tax.totalAmount, // This is the total payable via Razorpay
  };
}

// Prefetch rate on module startup
getLiveUsdToInrRate().catch(() => {});
