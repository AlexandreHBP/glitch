/**
 * Faixa da playlist ambiente (RF10) — espelha PlaylistTrack do backend.
 */
export type PlaylistTrack = {
  id: string;
  title: string;
  artist: string | null;
  url: string;
  position: number;
  active: boolean;
};
