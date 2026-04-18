import Image from "next/image";

interface WorkCoverProps {
  /** Cover image path under /public. If absent, a typographic placeholder renders. */
  src?: string;
  /** Alt text. Required if src is present; ignored otherwise. */
  alt?: string;
  /** Short label shown inside the placeholder — usually project title. */
  label: string;
  /** Secondary line inside the placeholder — subject or year. */
  sublabel?: string;
  /** Aspect ratio utility class — defaults to `frame-4x5` (editorial portrait). */
  aspect?: "frame-4x5" | "frame-16x9" | "frame-21x9" | "frame-3x1" | "frame-3x4" | "frame-square";
  /** next/image `sizes` attribute. */
  sizes?: string;
  /** next/image `priority` for above-the-fold. */
  priority?: boolean;
  /** Extra classes on the outer frame. */
  className?: string;
}

/**
 * Frame wrapper around the cover image. When the project does not yet have
 * an image delivered by the Vertex AI pipeline, renders a typographic
 * placeholder so the layout is always visually complete — never a broken
 * image icon, never a hollow box.
 */
export function WorkCover({
  src,
  alt,
  label,
  sublabel,
  aspect = "frame-4x5",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority,
  className = "",
}: WorkCoverProps) {
  return (
    <div
      className={`relative ${aspect} overflow-hidden rounded-sm bg-[var(--surface-2)] grain ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <Placeholder label={label} sublabel={sublabel} />
      )}
    </div>
  );
}

/**
 * Typographic placeholder — deep gradient + large serif label. Designed to
 * look intentional, not like a missing-asset state.
 */
function Placeholder({
  label,
  sublabel,
}: {
  label: string;
  sublabel?: string;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-8"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklch, var(--primary) 18%, var(--surface-2)) 0%, var(--surface-1) 55%, var(--background) 100%)",
      }}
    >
      {/* Teal keyline — brand signature */}
      <div
        aria-hidden
        className="absolute left-6 top-0 h-16 w-[3px] bg-primary"
      />

      <div className="font-technical text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        minhanr.dev
      </div>

      <div className="font-display leading-[0.95] tracking-tight text-foreground">
        <div className="text-[clamp(2rem,4.5vw,3.5rem)]">{label}</div>
        {sublabel && (
          <div className="mt-2 font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
