"use client";

import { useId } from "react";

/**
 * ColorPicker — hybrid palette + native color input + hex text.
 *
 * Three entry paths feeding a single controlled value:
 *   1. Preset swatches — curated 16-colour palette grouped by hue,
 *      each tuned for legibility on the Prussian-night dark surface.
 *   2. Native <input type="color"> — system picker for any hue.
 *   3. Hex text input — direct typing for colour-code precision.
 *
 * Value is always a 7-char `#rrggbb` string. Invalid hex reverts.
 */

const PRESET_COLORS: Array<{ label: string; hex: string }> = [
  // 노랑 계열
  { label: "Amber", hex: "#D9B84A" },
  { label: "Gold", hex: "#E5C979" },
  { label: "Mustard", hex: "#C9A62D" },
  // 회색 계열
  { label: "Slate", hex: "#6D7684" },
  { label: "Steel", hex: "#8A92A0" },
  { label: "Mist", hex: "#B1B6C0" },
  // 초록 계열
  { label: "Sage", hex: "#5CB089" },
  { label: "Mint", hex: "#7DCB9F" },
  { label: "Pine", hex: "#47946F" },
  // 하늘 계열
  { label: "Sky", hex: "#86B8CF" },
  { label: "Cyan", hex: "#5DBAB7" },
  { label: "Harbor", hex: "#6BA3BD" },
  // 보라 계열
  { label: "Lavender", hex: "#A378C9" },
  { label: "Mauve", hex: "#BA98D8" },
  // 주황·핑크
  { label: "Terracotta", hex: "#D88D5A" },
  { label: "Blush", hex: "#CB7A9F" },
];

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const inputId = useId();
  const safe = HEX_RE.test(value) ? value : "#6D7684";

  function handleHexInput(raw: string) {
    const next = raw.startsWith("#") ? raw : `#${raw}`;
    if (HEX_RE.test(next)) onChange(next);
  }

  return (
    <div className="space-y-2">
      {/* Palette */}
      <div className="grid grid-cols-8 gap-1.5">
        {PRESET_COLORS.map((c) => {
          const selected = c.hex.toLowerCase() === safe.toLowerCase();
          return (
            <button
              key={c.hex}
              type="button"
              disabled={disabled}
              onClick={() => onChange(c.hex)}
              title={`${c.label} · ${c.hex}`}
              aria-label={c.label}
              className={`h-7 w-7 rounded-sm border transition-transform hover:scale-110 disabled:opacity-50 ${
                selected
                  ? "border-foreground ring-2 ring-foreground/40 ring-offset-2 ring-offset-background"
                  : "border-black/10"
              }`}
              style={{ background: c.hex }}
            />
          );
        })}
      </div>

      {/* Native picker + hex input */}
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className="relative inline-flex h-8 w-8 cursor-pointer overflow-hidden rounded-sm border border-border"
          title="고급 색 선택"
        >
          <input
            id={inputId}
            type="color"
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="absolute inset-[-2px] h-[calc(100%+4px)] w-[calc(100%+4px)] cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <input
          type="text"
          value={safe}
          onChange={(e) => handleHexInput(e.target.value)}
          disabled={disabled}
          maxLength={7}
          spellCheck={false}
          className="font-technical w-28 rounded-sm border border-border bg-background px-2 py-1 text-[12px] uppercase tabular-nums text-foreground outline-none focus:border-primary disabled:opacity-50"
          aria-label="Hex code"
          placeholder="#RRGGBB"
        />
        <span
          className="font-technical text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground"
          aria-hidden
        >
          Preview
        </span>
        <span
          className="h-6 w-12 rounded-sm border border-black/10"
          style={{ background: safe }}
          aria-hidden
        />
      </div>
    </div>
  );
}
