"use client";

/**
 * Interface do player de música ambiente (RF10). Consome
 * MusicPlayerContext (o <audio> único vive lá, no layout raiz) — este
 * componente é só aparência/interação, nenhuma regra de reprodução mora
 * aqui. Visual: widget flutuante fixo no canto inferior, com um disco de
 * vinil preto (VinylDisc) que gira enquanto `isPlaying` é verdadeiro e
 * para quando pausado — mostra sempre "Tocando agora: [faixa]". Igual em
 * qualquer tamanho de tela (RF13); o painel com playlist/volume só
 * expande sob clique, nunca sozinho. Nunca inicia sozinho (RN04) — todo
 * play aqui é resultado direto de clique do usuário.
 */
import { useState } from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { VinylDisc } from "@/components/glitch/VinylDisc";
import { cn } from "@/lib/cn";

function PlayIcon({ playing }: { playing: boolean }) {
  if (playing) {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M7 5.5v13a1 1 0 0 0 1.53.85l10.5-6.5a1 1 0 0 0 0-1.7L8.53 4.65A1 1 0 0 0 7 5.5Z" />
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
  const { tracks, isLoading, currentTrack, isPlaying, volume, togglePlay, selectTrack, setVolume } =
    useMusicPlayer();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || tracks.length === 0) return null;

  const nowPlayingLabel = currentTrack ? `Tocando agora: ${currentTrack.title}` : "Escolha uma música";

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3"
      role="region"
      aria-label="Player de música ambiente"
    >
      {isOpen && (
        <div className="w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-ink/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3">
            <VinylDisc isPlaying={isPlaying} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-bone">{nowPlayingLabel}</p>
              {currentTrack?.artist && (
                <p className="truncate text-xs text-slate-400">{currentTrack.artist}</p>
              )}
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-xs text-slate-400">
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
              className="h-1 w-full cursor-pointer accent-brand-500"
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar playlist" : "Abrir playlist"}
          className="glitch-hover flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-ink/90 text-slate-300 shadow-lg shadow-black/30 backdrop-blur hover:text-white"
        >
          <ListIcon />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar música" : "Tocar música"}
          title={nowPlayingLabel}
          className="glitch-hover group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-ink/90 shadow-xl shadow-black/40 backdrop-blur"
        >
          <VinylDisc isPlaying={isPlaying} size={48} />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bone text-ink">
              <PlayIcon playing={isPlaying} />
            </span>
          </span>
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {nowPlayingLabel}
      </p>
    </div>
  );
}
