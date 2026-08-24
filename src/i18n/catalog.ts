export type MessageCatalog = Readonly<Record<string, string>>;

export type MessageResolution = {
  key: string;
  value: string;
  locale: string;
  fallbackUsed: boolean;
};

export function resolveMessage(
  key: string,
  locale: string,
  catalogs: Readonly<Record<string, MessageCatalog>>,
  fallbackLocale: string,
): MessageResolution {
  const primary = catalogs[locale];
  const fallback = catalogs[fallbackLocale];
  const primaryValue = primary?.[key];
  if (primaryValue !== undefined) {
    return { key, value: primaryValue, locale, fallbackUsed: false };
  }
  const fallbackValue = fallback?.[key];
  if (fallbackValue !== undefined) {
    return { key, value: fallbackValue, locale: fallbackLocale, fallbackUsed: true };
  }
  return { key, value: key, locale: fallbackLocale, fallbackUsed: true };
}

export function interpolateMessage(
  message: string,
  values: Readonly<Record<string, string | number | bigint>>,
): string {
  return message.replace(/\{([A-Za-z0-9_.-]+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
