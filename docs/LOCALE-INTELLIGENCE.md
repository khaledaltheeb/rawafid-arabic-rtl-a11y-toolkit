# Locale intelligence

The toolkit treats locale metadata as **runtime standards data**, not as a private database maintained by Rawafid.

## Principle

When ECMA-402 exposes locale information, the toolkit reads it. When the running engine does not expose a capability, the toolkit returns an empty/undefined result or fails explicitly for an API whose purpose is to expose that capability.

It does not silently substitute hand-maintained CLDR tables that can drift from the browser/runtime.

## `getLocaleCapabilities()`

For a canonical locale, the capability object can include:

- language;
- effective script;
- effective region;
- text direction;
- preferred/available calendars;
- collations;
- numbering systems;
- hour cycles;
- regional time zones;
- week information (`firstDay`, `weekend`, `minimalDays`).

Direction continues to use the toolkit's script-aware contract. Optional locale-info arrays and week information are read dynamically from the host's `Intl.Locale` implementation when available.

### Empty data is meaningful

An empty array does **not** mean the locale has no valid values in CLDR. It can mean the current engine does not expose that Locale Info method/property. Consumers that require a particular capability should test its presence rather than treating an empty result as linguistic truth.

For example, locale-specific time-zone information depends on regional locale data and runtime support. The toolkit does not fabricate region-to-zone mappings.

## `supportedIntlValues()`

`Intl.supportedValuesOf()` exposes canonical values supported by the runtime for standardized keys. The toolkit provides a typed wrapper for:

- `calendar`;
- `collation`;
- `currency`;
- `numberingSystem`;
- `timeZone`;
- `unit`.

These lists describe **runtime capability**, not a permanently frozen registry. A newer ICU/CLDR/Unicode/runtime can add, remove, rename, or canonicalize values without a toolkit code change.

If `Intl.supportedValuesOf` is unavailable, the helper fails explicitly instead of returning a stale built-in list.

## Week information

Week metadata is represented numerically according to the host API:

- `firstDay`: first day of the locale's week;
- `weekend`: locale-specific weekend day numbers;
- `minimalDays`: minimum days required in the first week.

Applications should consume these values for calendars/schedulers rather than assuming Monday/Sunday or a Saturday/Sunday weekend globally.

Week information is locale data. It should not be used to infer religion, employment policy, legal holidays, or an individual's personal schedule.

## Security and privacy

Locale capabilities are deterministic platform metadata. They do not require network requests and should not be confused with user location.

A locale tag such as `ar-JO` is an application/user locale preference or identifier; it is not proof that a person is physically located in Jordan. The toolkit intentionally does not geolocate users or derive personal attributes from locale metadata.

## Testing contract

Repository tests verify stable structural invariants rather than snapshotting entire CLDR-derived lists. Examples include:

- canonical locale/script/region/direction;
- array shape;
- week-day numeric bounds when week information exists;
- existence of broadly standardized runtime values such as `USD` and `latn`;
- non-empty supported value collections where the runtime exposes the API.

This keeps tests sensitive to API breakage while avoiding false failures caused by legitimate locale-data updates.

See `docs/API-CONTRACT.md`, `docs/STANDARDS.md`, and `docs/COMPATIBILITY.md` for the broader platform-data contract.
