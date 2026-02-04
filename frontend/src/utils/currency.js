// Detect browser locale and return appropriate currency settings
export const getCurrencySettings = () => {
  const locale = navigator.language || navigator.userLanguage || 'en-US';

  // Map common locales to currencies
  const localeToCurrency = {
    // US Dollar
    'en-US': { code: 'USD', symbol: '$', locale: 'en-US' },
    'en': { code: 'USD', symbol: '$', locale: 'en-US' },

    // Euro
    'de': { code: 'EUR', symbol: '€', locale: 'de-DE' },
    'de-DE': { code: 'EUR', symbol: '€', locale: 'de-DE' },
    'de-AT': { code: 'EUR', symbol: '€', locale: 'de-AT' },
    'de-CH': { code: 'CHF', symbol: 'CHF', locale: 'de-CH' },
    'fr': { code: 'EUR', symbol: '€', locale: 'fr-FR' },
    'fr-FR': { code: 'EUR', symbol: '€', locale: 'fr-FR' },
    'fr-BE': { code: 'EUR', symbol: '€', locale: 'fr-BE' },
    'fr-CH': { code: 'CHF', symbol: 'CHF', locale: 'fr-CH' },
    'it': { code: 'EUR', symbol: '€', locale: 'it-IT' },
    'it-IT': { code: 'EUR', symbol: '€', locale: 'it-IT' },
    'es': { code: 'EUR', symbol: '€', locale: 'es-ES' },
    'es-ES': { code: 'EUR', symbol: '€', locale: 'es-ES' },
    'nl': { code: 'EUR', symbol: '€', locale: 'nl-NL' },
    'nl-NL': { code: 'EUR', symbol: '€', locale: 'nl-NL' },
    'pt-PT': { code: 'EUR', symbol: '€', locale: 'pt-PT' },

    // British Pound
    'en-GB': { code: 'GBP', symbol: '£', locale: 'en-GB' },

    // Japanese Yen
    'ja': { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
    'ja-JP': { code: 'JPY', symbol: '¥', locale: 'ja-JP' },

    // Chinese Yuan
    'zh': { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
    'zh-CN': { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
    'zh-Hans': { code: 'CNY', symbol: '¥', locale: 'zh-CN' },

    // Indian Rupee
    'hi': { code: 'INR', symbol: '₹', locale: 'hi-IN' },
    'hi-IN': { code: 'INR', symbol: '₹', locale: 'hi-IN' },
    'en-IN': { code: 'INR', symbol: '₹', locale: 'en-IN' },

    // Canadian Dollar
    'en-CA': { code: 'CAD', symbol: 'CA$', locale: 'en-CA' },
    'fr-CA': { code: 'CAD', symbol: 'CA$', locale: 'fr-CA' },

    // Australian Dollar
    'en-AU': { code: 'AUD', symbol: 'A$', locale: 'en-AU' },

    // Brazilian Real
    'pt': { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    'pt-BR': { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },

    // Mexican Peso
    'es-MX': { code: 'MXN', symbol: '$', locale: 'es-MX' },

    // South Korean Won
    'ko': { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
    'ko-KR': { code: 'KRW', symbol: '₩', locale: 'ko-KR' },

    // Philippine Peso
    'fil': { code: 'PHP', symbol: '₱', locale: 'fil-PH' },
    'tl': { code: 'PHP', symbol: '₱', locale: 'fil-PH' },
    'en-PH': { code: 'PHP', symbol: '₱', locale: 'en-PH' },
  };

  // Try exact match first
  if (localeToCurrency[locale]) {
    return localeToCurrency[locale];
  }

  // Try language code only (e.g., 'en' from 'en-US')
  const languageCode = locale.split('-')[0];
  if (localeToCurrency[languageCode]) {
    return localeToCurrency[languageCode];
  }

  // Default to USD
  return { code: 'USD', symbol: '$', locale: 'en-US' };
};

// Format amount based on locale
export const formatCurrency = (amount, overrideCurrency = null) => {
  const currency = overrideCurrency || getCurrencySettings();

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback if Intl fails
    return `${currency.symbol}${parseFloat(amount).toFixed(2)}`;
  }
};

// Get currency symbol
export const getCurrencySymbol = () => {
  return getCurrencySettings().symbol;
};

// Get currency code
export const getCurrencyCode = () => {
  return getCurrencySettings().code;
};
