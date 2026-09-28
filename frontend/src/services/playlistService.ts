/**
 * CRUD das faixas da playlist do player público, consumindo
 * /admin/playlist (ver backend/src/modules/playlist/playlist-admin.controller.ts).
 */
import { api } from "./api";
import type {
  CreateTrackPayload,
  PlaylistTrack,
  UpdateTrackPayload,
} from "../types/playlist.types";

export const playlistService = {
  list: async (): Promise<PlaylistTrack[]> => {
    const response = await api.get<PlaylistTrack[]>("/admin/playlist");
    return response.data;
  },

  create: async (payload: CreateTrackPayload): Promise<PlaylistTrack> => {
    const response = await api.post<PlaylistTrack>("/admin/playlist", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateTrackPayload): Promise<PlaylistTrack> => {
    const response = await api.put<PlaylistTrack>(`/admin/playlist/${id}`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/admin/playlist/${id}`);
  },
};
