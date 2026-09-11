# Glitch - Loja Online

**Status:** Nova
**Prioridade:** Média (sem prazo urgente, mas importante para o negócio)
**Data de Criação:** 2026-09-11

---

## Resumo Executivo
Site de vendas para a marca **Glitch**, uma loja de roupas com estética alternativa, substituindo o processo manual atual (formulário/papel + anotação em planilha/caderno). Além das funcionalidades de loja (catálogo, pedidos, estoque, contas de cliente e painel administrativo), o site terá uma identidade visual marcante: cor principal vinho escuro (#670001), efeitos visuais de "glitch" (falha/distorção), uma ovelha negra animada no rodapé, player de música ambiente, efeito parallax ao rolar a página, e responsividade total em qualquer tamanho de tela. O lançamento será feito em etapas, começando pelo catálogo online.

---

## Contexto de Negócio

### Problema / Necessidade
Hoje, quando um cliente quer comprar, ele preenche um formulário ou papel, e o dono do negócio anota manualmente em uma planilha ou caderno. Isso toma tempo e está sujeito a erros de anotação.

### Objetivo de Negócio
Automatizar o processo de pedidos, eliminando anotações manuais, e criar uma experiência de compra com identidade visual forte e marcante, alinhada ao estilo alternativo da marca Glitch, para se diferenciar de lojas online comuns.

### Métricas de Sucesso / KPIs
- Redução do tempo gasto anotando pedidos manualmente
- Pedidos passam a ser recebidos e organizados automaticamente pelo site, sem intervenção manual
- Experiência visual reconhecida como diferencial da marca (identidade alternativa/glitch)

### Stakeholders
- **Patrocinador / Product Owner:** Alexandre Henrique Braga Pereira (dono do negócio)
- **Usuários Finais:** Clientes que compram produtos (perfil detalhado ainda não definido; público estimado entre dezenas e centenas de pessoas)

---

## Usuários e Personas

### Persona 1: Cliente comprador
- **Perfil:** Pessoa que compra produtos da loja, com identificação com o estilo alternativo da marca; acessa tanto pelo celular quanto pelo computador
- **Necessidades:** Ver o catálogo de produtos, escolher variações (tamanho/cor), fazer o pedido, acompanhar o status, curtir a experiência visual e sonora do site
- **Dores:** Hoje precisa preencher formulário/papel e esperar retorno manual do vendedor
- **Objetivos:** Comprar de forma rápida, se identificar com a marca e acompanhar o pedido sem precisar entrar em contato direto

### Persona 2: Administrador (Alexandre)
- **Perfil:** Dono do negócio, gerencia sozinho o catálogo, os pedidos e a playlist de música, sem conhecimento técnico
- **Necessidades:** Cadastrar/editar produtos (nome, preço, foto, estoque), visualizar os pedidos recebidos e gerenciar as músicas do player
- **Dores:** Hoje anota tudo manualmente em planilha ou caderno
- **Objetivos:** Ter uma área simples para gerenciar tudo sem depender de anotações manuais

---

## Requisitos Funcionais

### RF01 - Catálogo de produtos
**Descrição:** O site exibe o catálogo com os produtos (entre 20 e 100 itens), incluindo variações como tamanho e cor.
**Prioridade:** Must Have (primeira etapa de entrega)

**Critérios de Aceitação:**
- [ ] **Dado** um cliente acessando o site, **quando** ele navega pelo catálogo, **então** vê os produtos disponíveis com fotos, preços e variações.
- [ ] **Dado** um produto com variações, **quando** o cliente seleciona uma variação, **então** o site mostra a disponibilidade em estoque daquela variação específica.

### RF02 - Conta de cliente
**Descrição:** O cliente precisa criar uma conta (com senha) para poder comprar.
**Prioridade:** Must Have

**Critérios de Aceitação:**
- [ ] **Dado** um novo cliente, **quando** ele tenta finalizar uma compra, **então** o site exige a criação de uma conta antes de concluir o pedido.
- [ ] **Dado** um cliente com conta, **quando** ele faz login, **então** consegue ver o histórico dos seus pedidos.

### RF03 - Pedido de produtos
**Descrição:** O cliente escolhe produtos e variações, monta um pedido e o envia pelo site.
**Prioridade:** Must Have

**Critérios de Aceitação:**
- [ ] **Dado** um cliente logado com itens escolhidos, **quando** ele finaliza o pedido, **então** o pedido é registrado automaticamente no sistema, sem necessidade de anotação manual pelo administrador.

### RF04 - Controle de estoque
**Descrição:** O sistema controla a quantidade disponível de cada produto/variação e impede vendas quando o estoque acabar.
**Prioridade:** Must Have

**Critérios de Aceitação:**
- [ ] **Dado** um produto sem estoque, **quando** o cliente tenta comprá-lo, **então** o site indica que está indisponível e impede a compra.
- [ ] **Dado** um pedido concluído, **quando** o pedido é registrado, **então** o estoque do produto correspondente é reduzido automaticamente.

### RF05 - Pagamento combinado fora do site
**Descrição:** O pagamento não é feito diretamente no site; é combinado posteriormente entre cliente e administrador (ex: na entrega).
**Prioridade:** Must Have

**Critérios de Aceitação:**
- [ ] **Dado** um pedido finalizado, **quando** o cliente conclui a compra, **então** o site apenas registra o pedido, sem solicitar pagamento online.

### RF06 - Acompanhamento de status do pedido
**Descrição:** O cliente pode ver o status do seu pedido (ex: em preparo, enviado).
**Prioridade:** Should Have

**Critérios de Aceitação:**
- [ ] **Dado** um pedido em andamento, **quando** o cliente acessa sua conta, **então** vê o status atual do pedido.

### RF07 - Painel administrativo de produtos
**Descrição:** Área reservada para o administrador cadastrar, editar e remover produtos (nome, preço, foto, estoque).
**Prioridade:** Must Have (primeira etapa de entrega)

**Critérios de Aceitação:**
- [ ] **Dado** o administrador logado, **quando** ele cadastra um novo produto, **então** o produto passa a aparecer no catálogo do site.
- [ ] **Dado** o administrador logado, **quando** ele atualiza o estoque de um produto, **então** a nova quantidade é refletida imediatamente no site.

### RF08 - Painel de pedidos
**Descrição:** Área reservada para o administrador visualizar todos os pedidos recebidos.
**Prioridade:** Must Have

**Critérios de Aceitação:**
- [ ] **Dado** o administrador logado, **quando** ele acessa o painel de pedidos, **então** vê a lista de todos os pedidos com seus detalhes e status.

### RF09 - Efeito visual "glitch"
**Descrição:** Aplicar um efeito visual de falha/distorção (estilo "glitch"), característico da identidade da marca, no logo/nome da marca, nos títulos das seções do site, e como reação ao passar o mouse ou tocar em botões e imagens.
**Prioridade:** Should Have

**Critérios de Aceitação:**
- [ ] **Dado** um cliente visualizando o site, **quando** a página carrega, **então** o nome/logo "Glitch" exibe o efeito de distorção visual.
- [ ] **Dado** um cliente navegando pelas seções, **quando** ele visualiza um título de seção, **então** o título também exibe o efeito glitch.
- [ ] **Dado** um cliente passando o mouse (ou tocando, no celular) sobre um botão ou imagem, **quando** a interação acontece, **então** o elemento reage com o efeito glitch.

### RF10 - Player de música ambiente
**Descrição:** Player de música no site, com uma playlist definida pelo administrador; o cliente pode escolher entre as músicas disponíveis, mas a música não inicia automaticamente.
**Prioridade:** Should Have

**Critérios de Aceitação:**
- [ ] **Dado** o administrador logado no painel, **quando** ele adiciona uma música à playlist, **então** ela passa a estar disponível no player do site para os visitantes.
- [ ] **Dado** um cliente no site, **quando** ele acessa a página, **então** nenhuma música toca automaticamente.
- [ ] **Dado** um cliente no site, **quando** ele clica em "play" e escolhe uma música da playlist, **então** a música selecionada começa a tocar.

### RF11 - Ovelha negra animada no rodapé
**Descrição:** Uma ovelha negra se move de um lado para o outro, em loop contínuo, no rodapé de todas as páginas do site.
**Prioridade:** Could Have

**Critérios de Aceitação:**
- [ ] **Dado** um cliente em qualquer página do site, **quando** ele visualiza o rodapé, **então** vê a ovelha negra se movendo de um lado para o outro continuamente.

### RF12 - Efeito parallax
**Descrição:** Ao rolar a página, diferentes elementos visuais se movem em velocidades diferentes, criando sensação de profundidade.
**Prioridade:** Could Have

**Critérios de Aceitação:**
- [ ] **Dado** um cliente rolando a página, **quando** ele passa por seções com imagens de fundo, **então** percebe o efeito de profundidade (elementos de fundo se movem em ritmo diferente do conteúdo).

### RF13 - Responsividade total
**Descrição:** O site, incluindo os efeitos visuais (glitch, ovelha, parallax) e o player de música, precisa funcionar corretamente em qualquer tamanho de tela (celular, tablet, computador).
**Prioridade:** Must Have

**Critérios de Aceitação:**
- [ ] **Dado** um cliente acessando pelo celular, **quando** ele navega pelo site, **então** todos os elementos (catálogo, botões, player, animações) se ajustam corretamente à tela pequena.
- [ ] **Dado** um cliente acessando por computador, **quando** ele navega pelo site, **então** o layout aproveita bem o espaço da tela maior, mantendo os mesmos efeitos visuais.

---

## Identidade Visual e Experiência da Marca

- **Nome da marca:** Glitch
- **Estilo:** Loja de roupas com estética alternativa/underground
- **Cor principal:** `#670001` (vinho escuro)
- **Elementos visuais de destaque:** efeito glitch (logo, títulos, interações), ovelha negra animada no rodapé, efeito parallax ao rolar a página
- **Elementos de interface:** uso de bibliotecas prontas de ícones e de componentes visuais disponíveis na internet, para agilizar a criação de uma interface consistente e profissional
- **Áudio:** player de música com playlist definida pelo administrador, sem reprodução automática

---

## Jornada do Usuário

### Fluxo Principal (Happy Path) - Cliente
1. **Acesso ao site** - Cliente acessa pelo celular ou computador → Sistema exibe a página inicial com a identidade visual da marca (cor, efeitos glitch, ovelha animada no rodapé)
2. **Escolha do produto** - Cliente escolhe um produto e sua variação (tamanho/cor) → Sistema mostra a disponibilidade em estoque
3. **Login/Cadastro** - Cliente cria conta ou faz login → Sistema autentica o cliente
4. **Finalização do pedido** - Cliente finaliza o pedido → Sistema registra o pedido automaticamente e reduz o estoque
5. **Combinação de pagamento e entrega** - Cliente combina pagamento e entrega/retirada fora do site → Administrador providencia a entrega (correio/transportadora)
6. **Acompanhamento** - Cliente acompanha o status do pedido pela sua conta → Sistema exibe o status atualizado
7. **(Opcional) Música** - Cliente clica em play e escolhe uma música da playlist → Sistema reproduz a música escolhida enquanto ele navega

### Fluxo Principal (Happy Path) - Administrador
1. **Acesso ao painel** - Administrador acessa a área administrativa → Sistema exibe a área de gestão
2. **Gestão de produtos** - Administrador cadastra ou edita produtos (nome, preço, foto, estoque) → Sistema atualiza o catálogo
3. **Consulta de pedidos** - Administrador acessa o painel de pedidos → Sistema exibe a lista de pedidos recebidos
4. **Gestão da playlist** - Administrador adiciona ou remove músicas da playlist → Sistema atualiza as opções disponíveis no player do site

### Fluxos de Exceção
- **Produto sem estoque:** o sistema impede a compra e sinaliza indisponibilidade ao cliente
- **Cliente sem conta tentando comprar:** o sistema solicita a criação de conta antes de prosseguir com o pedido

---

## Regras de Negócio

### RN01 - Controle de estoque por variação
**Descrição:** Cada variação de produto (tamanho/cor) tem seu próprio controle de estoque, independente das demais variações do mesmo produto.
**Exemplo:** Uma camisa "P" pode estar disponível enquanto a "G" está esgotada.

### RN02 - Conta obrigatória para compra
**Descrição:** Não é permitido finalizar um pedido sem estar logado em uma conta de cliente.

### RN03 - Pagamento fora do site
**Descrição:** O site não processa pagamentos; o valor é combinado posteriormente entre o cliente e o administrador.

### RN04 - Música não inicia sozinha
**Descrição:** Por respeito à experiência do visitante, nenhuma música pode tocar automaticamente; a reprodução só começa por ação do cliente.

---

## Critérios de Aceitação (Geral)

### Funcionalidade
- [ ] Cliente consegue navegar pelo catálogo e visualizar produtos com variações e preços
- [ ] Cliente consegue criar conta, fazer login e finalizar um pedido
- [ ] Pedido enviado pelo cliente aparece automaticamente no painel do administrador, sem necessidade de anotação manual
- [ ] Estoque é atualizado automaticamente a cada pedido concluído
- [ ] Cliente consegue ver o status atual do seu pedido
- [ ] Administrador consegue cadastrar, editar e remover produtos pelo painel administrativo
- [ ] Administrador consegue gerenciar a playlist de músicas do player

### Usabilidade e Identidade Visual
- [ ] Site funciona bem e mantém os efeitos visuais tanto em celular quanto em computador (100% responsivo)
- [ ] Interface simples e intuitiva, já que o próprio administrador vai operar o painel sozinho, sem conhecimento técnico
- [ ] Cor principal (#670001) aplicada de forma consistente em toda a identidade visual do site
- [ ] Efeito glitch presente no logo, títulos e interações, sem prejudicar a leitura do conteúdo
- [ ] Ovelha negra animada visível no rodapé em todas as páginas

---

## Dependências e Integrações

### Dependências Internas
- O painel administrativo de produtos precisa estar funcionando antes de o catálogo poder ser exibido corretamente aos clientes
- O painel administrativo de músicas precisa estar funcionando antes do player poder ser disponibilizado aos clientes

### Integrações Externas
- Nenhuma integração de pagamento online identificada nesta fase (pagamento é combinado fora do site)
- Nenhuma integração de rastreio de entrega identificada nesta fase
- Uso de bibliotecas externas de ícones e componentes visuais prontos, disponíveis na internet, para compor a interface

---

## Restrições e Limitações
- Não haverá pagamento online integrado nesta primeira versão (o pagamento é combinado fora do site)
- A entrega/logística é feita pelo próprio administrador (correio ou transportadora), sem rastreio automático nesta fase
- A música não pode iniciar automaticamente ao carregar o site (respeitando a preferência do cliente)

---

## Riscos e Premissas

### Riscos
- Efeitos visuais muito intensos (glitch, parallax) podem impactar a velocidade de carregamento do site ou a leitura do conteúdo se não forem bem equilibrados
- Nenhum outro risco específico foi levantado pelo usuário até o momento

### Premissas
- Assume-se que o público de clientes ficará na faixa de dezenas a centenas de usuários
- Assume-se que o administrador será o único responsável por cadastrar produtos, visualizar pedidos e gerenciar a playlist, ao menos nesta primeira fase
- Assume-se que o administrador fornecerá os arquivos de música que deseja disponibilizar na playlist

---

## Plano de Entrega em Fases (MVP)

O usuário optou por lançar uma versão simples primeiro e evoluir aos poucos, priorizando o catálogo online como o item mais importante.

**Fase 1 (essencial, entregar primeiro):**
- RF01 - Catálogo de produtos
- RF07 - Painel administrativo de produtos
- RF13 - Responsividade total

**Fase 2:**
- RF02 - Conta de cliente
- RF03 - Pedido de produtos
- RF04 - Controle de estoque
- RF05 - Pagamento combinado fora do site
- RF08 - Painel de pedidos

**Fase 3:**
- RF06 - Acompanhamento de status do pedido

**Fase 4 (identidade visual e experiência):**
- RF09 - Efeito visual glitch
- RF10 - Player de música ambiente
- RF11 - Ovelha negra animada
- RF12 - Efeito parallax

---

## Notas e Observações

### Decisões Pendentes
- Perfil detalhado do público-alvo (tipo de cliente) ainda não foi definido pelo usuário
- Formato e quantidade de músicas que farão parte da playlist inicial ainda não foram definidos
