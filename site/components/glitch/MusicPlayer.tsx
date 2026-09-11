"use client";

/**
 * Interface do player de música ambiente (RF10). Consome
 * MusicPlayerContext (o <audio> único vive lá, no layout raiz) — este
 * componente é só aparência/interação, nenhuma regra de reprodução mora
 * aqui. Visual segue o mockup de referência: um painel compacto fixo no
 * canto inferior direito, sempre visível (não precisa de clique pra
 * aparecer), com "TOCANDO AGORA" + faixa + artista, barra de progresso e
 * os três controles de transporte (anterior/play/próxima). O disco de
 * vinil (VinylDisc) só gira enquanto `isPlaying` é verdadeiro.
 * Playlist/volume completos continuam disponíveis, escondidos atrás do
 * botão de lista — não cabem no painel compacto do mockup.
 * Nunca inicia sozinho (RN04) — o painel aparece com a primeira faixa já
 * selecionada (mostra nome/artista), mas sempre pausada; todo play aqui é
 * resultado direto de clique do usuário.
 */
import { useState } from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { VinylDisc } from "@/components/glitch/VinylDisc";
import { cn } from "@/lib/cn";

function PlayIcon({ playing }: { playing: boolean }) {
  if (playing) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M7 5.5v13a1 1 0 0 0 1.53.85l10.5-6.5a1 1 0 0 0 0-1.7L8.53 4.65A1 1 0 0 0 7 5.5Z" />
    </svg>
  );
}

function SkipBackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M7 5a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm3.7 6.15 8.3-5.7a1 1 0 0 1 1.57.82v11.46a1 1 0 0 1-1.57.82l-8.3-5.7a1 1 0 0 1 0-1.7Z" />
    </svg>
  );
}

function SkipForwardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M17 5a1 1 0 0 0-1 1v12a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Zm-3.7 6.15-8.3-5.7A1 1 0 0 0 3.43 6.27v11.46a1 1 0 0 0 1.57.82l8.3-5.7a1 1 0 0 0 0-1.7Z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

export function MusicPlayer() {
  const {
    tracks,
    isLoading,
    currentTrack,
    isPlaying,
    volume,
    progress,
    togglePlay,
    selectTrack,
    nextTrack,
    previousTrack,
    setVolume,
  } = useMusicPlayer();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || tracks.length === 0) return null;

  const nowPlayingLabel = currentTrack ? `Tocando agora: ${currentTrack.title}` : "Escolha uma música";

  return (
    <div
      className="fixed bottom-4 right-4 z-40 w-72 max-w-[calc(100vw-2rem)]"
      role="region"
      aria-label="Player de música ambiente"
    >
      <div className="rounded-2xl border border-wine/40 bg-ink/95 p-4 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <VinylDisc isPlaying={isPlaying} size={44} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-wine-bright">Tocando agora</p>
            <p className="truncate text-sm font-semibold text-bone">
              {currentTrack?.title ?? "Escolha uma música"}
            </p>
            {currentTrack?.artist && <p className="truncate text-xs text-slate-400">{currentTrack.artist}</p>}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Fechar playlist" : "Abrir playlist"}
            className="glitch-hover flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ListIcon />
          </button>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div className="h-full rounded-full bg-wine-bright transition-[width]" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={previousTrack}
            aria-label="Faixa anterior"
            className="glitch-hover flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white"
          >
            <SkipBackIcon />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pausar música" : "Tocar música"}
            title={nowPlayingLabel}
            className="glitch-hover flex h-12 w-12 items-center justify-center rounded-full bg-wine text-bone shadow-lg shadow-wine/40 hover:bg-wine-bright"
          >
            <PlayIcon playing={isPlaying} />
          </button>

          <button
            type="button"
            onClick={nextTrack}
            aria-label="Próxima faixa"
            className="glitch-hover flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white"
          >
            <SkipForwardIcon />
          </button>
        </div>

        {isOpen && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <span className="sr-only">Volume</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M4 9v6h4l5 5V4L8 9H4Z" />
              </svg>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="h-1 w-full cursor-pointer accent-wine-bright"
                aria-label="Volume"
              />
            </label>

            <ul className="mt-4 max-h-40 space-y-1 overflow-y-auto" aria-label="Faixas da playlist">
              {tracks.map((track) => (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => selectTrack(track.id)}
                    aria-pressed={track.id === currentTrack?.id}
                    className={cn(
                      "w-full truncate rounded-lg px-3 py-1.5 text-left text-xs transition",
                      track.id === currentTrack?.id
                        ? "bg-wine text-bone"
                        : "bg-white/5 text-slate-300 hover:bg-white/10",
                    )}
                  >
                    {track.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {nowPlayingLabel}
      </p>
    </div>
  );
}
