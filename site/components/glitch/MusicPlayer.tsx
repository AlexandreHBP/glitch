"use client";

/**
 * Interface do player de música ambiente (RF10). Consome
 * MusicPlayerContext (o <audio> único vive lá, no layout raiz). Responsivo:
 * barra fixa no desktop, botão flutuante + drawer no mobile. Nunca inicia
 * sozinho — todo play aqui é resultado direto de clique do usuário.
 */
import { useState } from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { cn } from "@/lib/cn";

function PlayIcon({ playing }: { playing: boolean }) {
  if (playing) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M7 5.5v13a1 1 0 0 0 1.53.85l10.5-6.5a1 1 0 0 0 0-1.7L8.53 4.65A1 1 0 0 0 7 5.5Z" />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M9 18V6.5l10-2v11.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <circle cx="16.5" cy="16.5" r="2.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export function MusicPlayer() {
  const { tracks, isLoading, currentTrack, isPlaying, volume, togglePlay, selectTrack, setVolume } =
    useMusicPlayer();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (isLoading || tracks.length === 0) return null;

  return (
    <>
      {/* Desktop: barra fixa no rodapé */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 hidden border-t border-white/10 bg-ink/95 backdrop-blur md:block"
        role="region"
        aria-label="Player de música ambiente"
      >
        <div className="container-section flex items-center gap-4 py-2.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pausar música" : "Tocar música"}
            className="glitch-hover flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wine text-bone transition hover:bg-wine-bright"
          >
            <PlayIcon playing={isPlaying} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-bone">
              {currentTrack ? currentTrack.title : "Escolha uma música"}
            </p>
            {currentTrack?.artist && (
              <p className="truncate text-xs text-slate-400">{currentTrack.artist}</p>
            )}
          </div>

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
              className="h-1 w-24 cursor-pointer accent-brand-500"
              aria-label="Volume"
            />
          </label>

          <ul className="flex max-w-xs items-center gap-1 overflow-x-auto" aria-label="Faixas da playlist">
            {tracks.map((track) => (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => selectTrack(track.id)}
                  aria-pressed={track.id === currentTrack?.id}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1 text-xs transition",
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
      </div>

      {/* Mobile: botão flutuante + drawer */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        {isMobileOpen && (
          <div
            role="region"
            aria-label="Player de música ambiente"
            className="mb-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-ink/95 p-4 shadow-2xl backdrop-blur"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-bone">
                  {currentTrack ? currentTrack.title : "Escolha uma música"}
                </p>
                {currentTrack?.artist && (
                  <p className="truncate text-xs text-slate-400">{currentTrack.artist}</p>
                )}
              </div>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pausar música" : "Tocar música"}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wine text-bone"
              >
                <PlayIcon playing={isPlaying} />
              </button>
            </div>

            <label className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <span className="sr-only">Volume</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="h-1 w-full cursor-pointer accent-brand-500"
                aria-label="Volume"
              />
            </label>

            <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto" aria-label="Faixas da playlist">
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

        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-expanded={isMobileOpen}
          aria-label={isMobileOpen ? "Fechar player de música" : "Abrir player de música"}
          className="glitch-hover flex h-12 w-12 items-center justify-center rounded-full bg-wine text-bone shadow-lg shadow-black/40"
        >
          <MusicIcon />
        </button>
      </div>
    </>
  );
}
