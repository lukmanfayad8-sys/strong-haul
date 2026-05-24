const CURRENCY_MAP = {
  GH: { code: "GHS", symbol: "GH₵", name: "Ghana Cedi" },
  NG: { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  KE: { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  ZA: { code: "ZAR", symbol: "R", name: "South African Rand" },
  SN: { code: "XOF", symbol: "CFA", name: "West African CFA" },
  CI: { code: "XOF", symbol: "CFA", name: "West African CFA" },
  CM: { code: "XAF", symbol: "CFA", name: "Central African CFA" },
  GB: { code: "GBP", symbol: "£", name: "British Pound" },
  DE: { code: "EUR", symbol: "€", name: "Euro" },
  FR: { code: "EUR", symbol: "€", name: "Euro" },
  US: { code: "USD", symbol: "$", name: "US Dollar" },
  CA: { code: "USD", symbol: "$", name: "US Dollar" },
};

const DEFAULT_CURRENCY = { code: "GHS", symbol: "GH₵", name: "Ghana Cedi" };

export const detectCurrency = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return CURRENCY_MAP[data.country_code] ?? DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
};

export const formatPrice = (amount, currency) => {
  return `${currency.symbol}${amount}`;
};

export const PLAN_PRICES = {
  GHS: { Premium: 350, Enterprise: "Custom" },
  NGN: { Premium: 15000, Enterprise: "Custom" },
  KES: { Premium: 3500, Enterprise: "Custom" },
  ZAR: { Premium: 550, Enterprise: "Custom" },
  XOF: { Premium: 17000, Enterprise: "Custom" },
  XAF: { Premium: 17000, Enterprise: "Custom" },
  GBP: { Premium: 23, Enterprise: "Custom" },
  EUR: { Premium: 27, Enterprise: "Custom" },
  USD: { Premium: 29, Enterprise: "Custom" },
};
