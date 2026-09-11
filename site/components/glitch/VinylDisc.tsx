/**
 * Disco de vinil preto ilustrado em SVG (parte visual do player, RF10).
 * Puramente decorativo (aria-hidden — o estado real de reprodução é
 * anunciado em texto por quem usa o MusicPlayer). Gira via CSS
 * (.vinyl-disc / .is-spinning, ver app/globals.css); aqui só monta a
 * marcação e recebe o estado de "tocando" para alternar a classe e o
 * ângulo do braço/agulha.
 */
import { cn } from "@/lib/cn";

export function VinylDisc({ isPlaying, size = 48 }: { isPlaying: boolean; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={cn("vinyl-disc", isPlaying && "is-spinning")}
        focusable="false"
      >
        <circle cx="50" cy="50" r="48" fill="#0b0b0c" stroke="#1f1f22" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="#232326" strokeWidth="1" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="#232326" strokeWidth="1" />
        <circle cx="50" cy="50" r="26" fill="none" stroke="#232326" strokeWidth="1" />
        <circle cx="50" cy="50" r="16" fill="var(--glitch-wine)" />
        <circle cx="50" cy="50" r="16" fill="none" stroke="var(--glitch-wine-bright)" strokeWidth="1" />
        <circle cx="50" cy="50" r="2.6" fill="#0b0b0c" />
        {/* brilho sutil, reforça a sensação de superfície de vinil */}
        <path d="M20 20 A 42 42 0 0 1 62 12" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      {/* braço/agulha: repousa afastado quando pausado, "toca" o disco quando tocando */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="pointer-events-none absolute inset-0"
        focusable="false"
      >
        <g className={cn("vinyl-tonearm", isPlaying && "is-spinning")}>
          <circle cx="88" cy="12" r="4" fill="#3a3a3d" />
          <rect x="60" y="10.5" width="30" height="3" rx="1.5" fill="#3a3a3d" />
          <circle cx="61" cy="30" r="2" fill="#8f0102" />
        </g>
      </svg>
    </span>
  );
}
