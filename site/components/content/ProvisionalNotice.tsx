/**
 * Aviso fixo no topo das páginas institucionais do rodapé (Manifesto, Guia
 * de Medidas, Acessibilidade, Sustentabilidade, Envio & Trocas) cujo
 * conteúdo ainda é um rascunho de estrutura, não o texto final aprovado
 * pelo Alexandre. Sinaliza isso a quem visitar a página antes da revisão.
 *
 * TODO(Alexandre): remover este aviso (e este componente da página) assim
 * que o conteúdo definitivo de cada página for escrito e aprovado.
 */
export function ProvisionalNotice() {
  return (
    <div
      role="note"
      className="mb-10 rounded-md border border-wine-bright/40 bg-wine/10 px-4 py-3 text-sm sm:px-5 sm:py-4"
    >
      <p className="font-semibold uppercase tracking-wide text-wine-bright">
        Conteúdo provisório — revisar com o Alexandre antes de publicar
      </p>
      <p className="mt-1 text-slate-300">
        O texto abaixo é um rascunho de estrutura para o Alexandre preencher com o conteúdo real da
        loja. Prazos, medidas e compromissos específicos ainda não foram confirmados — não devem ser
        considerados definitivos.
      </p>
    </div>
  );
}
