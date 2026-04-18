# Ambient audio

The site dock ships with a speaker toggle that plays a theme-matched
ambient loop. All three tracks must be **commercially usable** (CC0,
Pixabay Content License, or Mixkit Free License — anything that allows
commercial use with no attribution). The dock component
(`src/components/ambient-audio.tsx`) fails silently if a file is
missing, so the site works fine even without these files.

## Expected files

```
public/ambient/
├── rain.mp3     — Dark theme (storm rain on glass, ~2–4 min loop)
├── wind.mp3     — Gray theme (soft wind, overcast day, ~2–4 min loop)
└── nature.mp3   — Light theme (birdsong / grass, ~2–4 min loop)
```

Target loudness: around `-20 LUFS` so the loop sits under any content
without demanding attention. Keep each file under ~4 MB — these ship to
the Vercel edge and load on toggle-enable.

## Sourcing (recommended starting points)

- **Pixabay** — https://pixabay.com/sound-effects/search/rain/
  - License: https://pixabay.com/service/license-summary/ (commercial
    use OK, no attribution required).
- **Mixkit** — https://mixkit.co/free-sound-effects/rain/
  - License: https://mixkit.co/license (free for commercial use).
- **Freesound.org** — filter by CC0 only
  (https://freesound.org/search/?f=license:%22Creative+Commons+0%22).

Drop the downloaded files at the expected paths above and commit. The
toggle will pick them up on the next build.

## License audit trail

If you commit the audio files, please also commit a `SOURCES.md` in
this directory listing each file's source URL, author (if any), and
license. That record protects us if a license dispute ever comes up.
