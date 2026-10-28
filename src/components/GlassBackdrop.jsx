/**
 * Soft, pale colour fields behind the glass (DESIGN.md §2.6) — iOS-style
 * wallpaper. Decorative only. The colours are pale so that text on the glass
 * keeps WCAG AA contrast wherever it sits.
 */
export default function GlassBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Worst case on the thinnest glass (60 % white): text-muted 4.93:1. */}
      <div className="absolute -left-32 -top-40 h-[38rem] w-[38rem] rounded-full bg-blob-1 opacity-85 blur-3xl" />
      <div className="absolute -right-24 top-10 h-[34rem] w-[34rem] rounded-full bg-blob-2 opacity-85 blur-3xl" />
      <div className="absolute -bottom-56 left-[30%] h-[36rem] w-[36rem] rounded-full bg-blob-3 opacity-80 blur-3xl" />
    </div>
  );
}
