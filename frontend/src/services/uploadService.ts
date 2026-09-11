/**
 * Upload de arquivos (imagem de produto, áudio de playlist) para o
 * backend. Os dois endpoints exigem o campo multipart "file" e devolvem
 * `{ url }` com um caminho relativo (resolva com resolveFileUrl de ./api
 * antes de exibir).
 */
import { api } from "./api";

interface UploadResult {
  url: string;
}

export const uploadService = {
  uploadImage: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<UploadResult>("/admin/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  uploadAudio: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<UploadResult>("/admin/uploads/audio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
