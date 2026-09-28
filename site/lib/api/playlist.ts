/**
 * Serviço da playlist pública — GET /playlist. Consumido só pelo
 * MusicPlayerProvider (RF10); nunca inicia reprodução sozinho.
 */
import { apiFetch } from "./client";
import type { PlaylistTrack } from "@/types/playlist";

export const playlistApi = {
  list() {
    return apiFetch<PlaylistTrack[]>("/playlist", { cache: "no-store", token: null });
  },
};
