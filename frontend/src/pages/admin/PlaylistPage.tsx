/**
 * Gestão da playlist do player do site público (RF10, parte admin):
 * lista ordenada de faixas, upload de áudio, criar/editar/remover faixa
 * com confirmação antes de excluir.
 */
import { useState } from "react";
import type { ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import FileInput from "../../components/form/input/FileInput";
import Switch from "../../components/form/switch/Switch";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { playlistService } from "../../services/playlistService";
import { uploadService } from "../../services/uploadService";
import { getErrorMessage, resolveFileUrl } from "../../services/api";
import type { PlaylistTrack } from "../../types/playlist.types";

interface TrackFormState {
  title: string;
  artist: string;
  position: number;
  active: boolean;
  url: string;
}

const emptyForm: TrackFormState = { title: "", artist: "", position: 0, active: true, url: "" };

export default function PlaylistPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<PlaylistTrack | null>(null);
  const [form, setForm] = useState<TrackFormState>(emptyForm);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [trackToDelete, setTrackToDelete] = useState<PlaylistTrack | null>(null);

  const { data: tracks, isLoading, isError, error } = useQuery({
    queryKey: ["admin-playlist"],
    queryFn: () => playlistService.list(),
  });

  const sortedTracks = [...(tracks ?? [])].sort((a, b) => a.position - b.position);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title,
        artist: form.artist || undefined,
        url: form.url,
        position: form.position,
        active: form.active,
      };
      return editingTrack
        ? playlistService.update(editingTrack.id, payload)
        : playlistService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-playlist"] });
      closeForm();
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => playlistService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-playlist"] });
      setTrackToDelete(null);
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  });

  function openCreateForm() {
    setEditingTrack(null);
    setForm({ ...emptyForm, position: (tracks?.length ?? 0) });
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(track: PlaylistTrack) {
    setEditingTrack(track);
    setForm({
      title: track.title,
      artist: track.artist ?? "",
      position: track.position,
      active: track.active,
      url: track.url,
    });
    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingTrack(null);
    setForm(emptyForm);
    setFormError("");
  }

  async function handleAudioChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setFormError("");
    try {
      const { url } = await uploadService.uploadAudio(file);
      setForm((prev) => ({ ...prev, url }));
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      setFormError("Informe o título da música.");
      return;
    }
    if (!form.url) {
      setFormError("Envie um arquivo de áudio (.mp3) para esta faixa.");
      return;
    }
    saveMutation.mutate();
  }

  return (
    <>
      <PageMeta title="Playlist | Glitch Admin" description="Playlist do player do site Glitch" />
      <PageBreadcrumb pageTitle="Playlist" />

      <div className="mb-4 flex justify-end">
        <Button onClick={openCreateForm}>+ Nova faixa</Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-error-500">{getErrorMessage(error)}</div>
        ) : sortedTracks.length === 0 ? (
          <EmptyState
            title="Nenhuma música na playlist ainda"
            description="Clique em 'Nova faixa' para adicionar a primeira música do player do site."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500">
                    Ordem
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500">
                    Faixa
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500">
                    Ouvir
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500">
                    Situação
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-right text-theme-xs font-medium text-gray-500">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sortedTracks.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {track.position}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                      {track.title}
                      {track.artist && (
                        <span className="block text-theme-xs text-gray-400">{track.artist}</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <audio controls src={resolveFileUrl(track.url)} className="h-8 max-w-[220px]" />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge color={track.active ? "success" : "light"} size="sm">
                        {track.active ? "Disponível" : "Oculta"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(track)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setTrackToDelete(track)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-error-500 hover:bg-error-50 dark:border-gray-700 dark:hover:bg-error-500/10"
                        >
                          Excluir
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} className="max-w-lg m-4">
        <div className="p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            {editingTrack ? "Editar faixa" : "Nova faixa"}
          </h3>

          {formError && (
            <div className="mb-4">
              <Alert variant="error" title="Verifique os dados" message={formError} />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="artist">Artista (opcional)</Label>
              <Input
                id="artist"
                value={form.artist}
                onChange={(e) => setForm((prev) => ({ ...prev, artist: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="position">Ordem na playlist</Label>
              <Input
                id="position"
                type="number"
                min="0"
                value={form.position}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, position: Number(e.target.value) }))
                }
              />
            </div>
            <div>
              <Label htmlFor="audio">Arquivo de áudio (.mp3)</Label>
              <FileInput accept="audio/mpeg" onChange={handleAudioChange} />
              {isUploading && <Spinner size="sm" className="mt-2" />}
              {form.url && !isUploading && (
                <audio controls src={resolveFileUrl(form.url)} className="mt-2 h-8 w-full" />
              )}
            </div>
            <Switch
              label="Disponível no player do site"
              defaultChecked={form.active}
              onChange={(checked) => setForm((prev) => ({ ...prev, active: checked }))}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar faixa"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!trackToDelete}
        title="Excluir faixa"
        message={`Tem certeza que deseja excluir "${trackToDelete?.title}" da playlist?`}
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => trackToDelete && deleteMutation.mutate(trackToDelete.id)}
        onCancel={() => setTrackToDelete(null)}
      />
    </>
  );
}
