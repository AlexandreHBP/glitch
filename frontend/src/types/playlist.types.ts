/**
 * Tipos da playlist do player do site público, gerenciada pelo admin.
 * Espelha backend/src/modules/playlist/.
 */

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string | null;
  url: string;
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackPayload {
  title: string;
  artist?: string;
  url: string;
  position?: number;
  active?: boolean;
}

export type UpdateTrackPayload = Partial<CreateTrackPayload>;
