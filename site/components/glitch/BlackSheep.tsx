/**
 * Ovelha negra animada no rodapé (RF11). SVG inline (escala em qualquer
 * tela, pesa poucos KB), decorativa (aria-hidden). Anima só `transform`
 * via CSS em app/globals.css — congela com prefers-reduced-motion (regra
 * global), nunca desaparece do layout. Server component: sem estado.
 */
export function BlackSheep() {
  return (
    <div className="black-sheep-track" aria-hidden="true">
      <div className="black-sheep-walker">
        <svg
          viewBox="0 0 64 40"
          width="56"
          height="35"
          className="black-sheep-bob"
          focusable="false"
        >
          <ellipse cx="26" cy="20" rx="16" ry="11" fill="#0b0b0c" />
          <circle cx="46" cy="16" r="7" fill="#0b0b0c" />
          <circle cx="49" cy="13.5" r="1.1" fill="var(--glitch-bone)" />
          <rect x="14" y="28" width="3.2" height="9" rx="1.4" fill="#0b0b0c" />
          <rect x="24" y="29" width="3.2" height="8" rx="1.4" fill="#0b0b0c" />
          <rect x="32" y="29" width="3.2" height="8" rx="1.4" fill="#0b0b0c" />
          <rect x="40" y="28" width="3.2" height="9" rx="1.4" fill="#0b0b0c" />
          <path d="M18 10c2-3 6-4 9-2" stroke="#1a1a1c" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
