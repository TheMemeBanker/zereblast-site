"use client";

export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-[#2a1848]/50">
      <div className="max-w-[1100px] mx-auto flex items-center justify-between">
        <span
          className="text-[7px] tracking-[0.2em] text-[#2a1848]"
          style={{ fontFamily: "var(--font-press-start)" }}
        >
          &copy; {new Date().getFullYear()} ZEREBLAST
        </span>
        <div className="flex items-center gap-4">
          <a href="#" className="text-[#2a1848] text-[7px] hover:text-[#8b2572] transition-colors" style={{ fontFamily: "var(--font-press-start)" }}>
            Terms
          </a>
          <a href="#" className="text-[#2a1848] text-[7px] hover:text-[#8b2572] transition-colors" style={{ fontFamily: "var(--font-press-start)" }}>
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
