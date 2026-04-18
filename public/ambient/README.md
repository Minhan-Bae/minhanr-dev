# Ambient audio

The site dock ships with a speaker toggle that plays a theme-matched
ambient loop. Every track here is **commercially usable** (CC0 1.0
Universal — public domain). The dock component
(`src/components/ambient-audio.tsx`) fails silently if a file is
missing, so the site works fine even without these files.

## Files

```
public/ambient/
├── rain.mp3    — Dark theme (gentle storm rain)
└── waves.mp3   — Light theme (gentle ocean waves)
```

## Sources (all CC0 1.0 Universal)

| File       | Source                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------- |
| rain.mp3   | [Internet Archive — relaxingrainsounds](https://archive.org/details/relaxingrainsounds) → `Rain Sounds.mp3` |
| waves.mp3  | [Internet Archive — ocean-sea-sounds](https://archive.org/details/ocean-sea-sounds) → `Gentle Ocean.mp3`   |

The CC0 1.0 Universal public-domain dedication permits unrestricted
commercial use with no attribution requirement, so the site can ship
these files with the rest of the build.

## Regenerating

```bash
node scripts/fetch-ambient.mjs            # skip existing
node scripts/fetch-ambient.mjs --force    # re-download all
node scripts/fetch-ambient.mjs --track rain
```

Each entry in `scripts/fetch-ambient.mjs` carries at least three
candidate URLs from the same CC0 collection, so a single archive.org
hiccup won't break the fetch — the script falls through to the next
URL and reports which one it used.
