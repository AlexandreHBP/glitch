"use client";

/**
 * Player de música ambiente (RF10). UM ÚNICO <audio>, criado aqui e
 * montado no layout raiz — por isso a música não reinicia ao navegar
 * entre páginas. Regras de ouro (RN04, não negociáveis):
 *   - NUNCA `autoPlay`.
 *   - `preload="none"` — nada é baixado antes do clique em play.
 *   - Reprodução só começa por ação explícita do usuário (play/selectTrack).
 *   - Estado de faixa/volume persiste em localStorage, mas `isPlaying`
 *     NUNCA é restaurado do storage — o player sempre nasce pausado.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { playlistApi } from "@/lib/api";
import type { PlaylistTrack } from "@/types/playlist";

const STORAGE_KEY = "glitch.player";

type MusicPlayerContextValue = {
  tracks: PlaylistTrack[];
  isLoading: boolean;
  currentTrack: PlaylistTrack | null;
  isPlaying: boolean;
  volume: number;
  /** Progresso da faixa atual, de 0 a 1. 0 quando não há metadata ainda. */
  progress: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  play: (trackId?: string) => void;
  pause: () => void;
  togglePlay: () => void;
  selectTrack: (trackId: string) => void;
  /** Troca para a próxima/anterior faixa da playlist e já toca — mesmo
   * comportamento de selectTrack, é uma ação explícita do usuário (RN04
   * continua respeitada: nada toca sozinho, só em resposta a clique). */
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (value: number) => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hydratedRef = useRef(false);

  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    playlistApi
      .list()
      .then(setTracks)
      .catch(() => setTracks([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Seleciona a primeira faixa só para exibição (nome/artista aparecem no
  // widget "tocando agora" mesmo antes de qualquer clique) assim que a
  // playlist carrega — nunca chama play()/isPlaying aqui, então RN04
  // continua intacta: o áudio nasce sempre pausado.
  useEffect(() => {
    if (!currentTrackId && tracks.length > 0) {
      setCurrentTrackId(tracks[0].id);
    }
  }, [tracks, currentTrackId]);

  // Zera o progresso exibido ao trocar de faixa, para a barra não mostrar
  // por um instante o percentual da faixa anterior.
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrackId]);

  // Hidrata SÓ faixa escolhida e volume — nunca "estava tocando".
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { trackId?: string; volume?: number };
        if (parsed.trackId) setCurrentTrackId(parsed.trackId);
        if (typeof parsed.volume === "number") setVolumeState(parsed.volume);
      }
    } catch {
      // estado corrompido — ignora
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ trackId: currentTrackId, volume }));
  }, [currentTrackId, volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const currentTrack = useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [tracks, currentTrackId],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackId]);

  function play(trackId?: string) {
    if (trackId) {
      setCurrentTrackId(trackId);
    } else if (!currentTrackId && tracks.length > 0) {
      setCurrentTrackId(tracks[0].id);
    }
    setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
  }

  function togglePlay() {
    if (!currentTrackId && tracks.length > 0) {
      play(tracks[0].id);
      return;
    }
    setIsPlaying((prev) => !prev);
  }

  function selectTrack(trackId: string) {
    setCurrentTrackId(trackId);
    setIsPlaying(true);
  }

  function nextTrack() {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex((track) => track.id === currentTrackId);
    const next = tracks[(currentIndex + 1) % tracks.length];
    selectTrack(next.id);
  }

  function previousTrack() {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex((track) => track.id === currentTrackId);
    const previousIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
    selectTrack(tracks[previousIndex].id);
  }

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  const value: MusicPlayerContextValue = {
    tracks,
    isLoading,
    currentTrack,
    isPlaying,
    volume,
    progress,
    audioRef,
    play,
    pause,
    togglePlay,
    selectTrack,
    nextTrack,
    previousTrack,
    setVolume: setVolumeState,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- música ambiente instrumental, sem faixa de legenda aplicável */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer(): MusicPlayerContextValue {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error("useMusicPlayer precisa estar dentro de <MusicPlayerProvider>");
  return ctx;
}
