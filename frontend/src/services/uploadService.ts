/**
 * Upload de arquivos (imagem de produto, áudio de playlist, modelo 3D de
 * produto) para o backend. Os endpoints exigem o campo multipart "file" e
 * devolvem `{ url }` com um caminho relativo (resolva com resolveFileUrl
 * de ./api antes de exibir).
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

  uploadModel3d: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<UploadResult>("/admin/uploads/model3d", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
