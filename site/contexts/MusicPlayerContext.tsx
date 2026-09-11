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
  audioRef: React.RefObject<HTMLAudioElement | null>;
  play: (trackId?: string) => void;
  pause: () => void;
  togglePlay: () => void;
  selectTrack: (trackId: string) => void;
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

  useEffect(() => {
    playlistApi
      .list()
      .then(setTracks)
      .catch(() => setTracks([]))
      .finally(() => setIsLoading(false));
  }, []);

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

  const value: MusicPlayerContextValue = {
    tracks,
    isLoading,
    currentTrack,
    isPlaying,
    volume,
    audioRef,
    play,
    pause,
    togglePlay,
    selectTrack,
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
      />
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer(): MusicPlayerContextValue {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error("useMusicPlayer precisa estar dentro de <MusicPlayerProvider>");
  return ctx;
}
