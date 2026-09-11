---
allowed-tools: Bash(git:*), Read, Edit
description: Commita os arquivos alterados seguindo Conventional Commits e empurra para o remoto
tags: [git, commit, push]
---

<role>Especialista em versionamento Git e Conventional Commits</role>

<goal>Analisar as alteracoes no working tree, criar um commit claro, atomico e padronizado seguindo Conventional Commits em portugues e SEMPRE empurrar (push) para o repositorio remoto — nunca deixar trabalho apenas local</goal>

<workflow>

### Step 1: Inspecionar as alteracoes
```bash
git status
git diff
git diff --staged
```
Entender o que mudou e agrupar logicamente as alteracoes.

### Step 2: Higienizar o que vai entrar (.gitignore)
Antes de commitar, identificar arquivos IRRELEVANTES que nao devem poluir o repositorio e adiciona-los ao `.gitignore` em vez de commita-los. Exemplos de coisas que normalmente NAO devem ser versionadas:
- Dependencias e build: `node_modules/`, `dist/`, `build/`, `.next/`, `coverage/`
- Ambiente e segredos: `.env`, `.env.local`, `*.local`
- Logs e temporarios: `*.log`, `tmp/`, `.cache/`
- Artefatos de IDE/SO: `.DS_Store`, `.idea/`, `.vscode/` (quando nao compartilhado), `*.swp`

Se algum desses ja estiver rastreado, alem de adicionar ao `.gitignore`, remover do indice sem apagar do disco:
```bash
# adicionar o padrao ao .gitignore e depois:
git rm -r --cached node_modules
```
Objetivo: o commit deve conter apenas os arquivos relevantes da mudanca.

### Step 3: Definir tipo e escopo
Escolher o tipo adequado ao conjunto de mudancas:
- `feat` nova funcionalidade
- `fix` correcao de bug
- `refactor` refatoracao sem mudanca de comportamento
- `docs` documentacao
- `test` testes
- `chore` tarefas de manutencao/build
- `style` formatacao sem efeito funcional
- `perf` melhoria de performance

Definir um escopo curto entre parenteses quando fizer sentido (ex.: `feat(auth):`).

### Step 4: Escrever a mensagem (Conventional Commits)
Formato: `tipo(escopo): descricao no imperativo em portugues`
- Assunto conciso (ate ~72 caracteres), sem ponto final, no imperativo ("adiciona", "corrige", "remove").
- Corpo opcional explicando o "porque" quando a mudanca nao for trivial (separado do assunto por uma linha em branco).
- Breaking change: usar `!` apos o tipo/escopo (ex.: `feat(api)!:`) e/ou um rodape `BREAKING CHANGE: ...`.

Exemplos:
```
feat(slash-commands): adiciona comando customizado por projeto
fix(comments): corrige envio de comando sem argumento
refactor(projects): deriva membership de organization_member
docs(readme): documenta variaveis de ambiente do backend
chore(deps): atualiza dependencias do frontend
feat(auth)!: remove suporte a login por token legado
```
Exemplo com corpo:
```
fix(environment): evita recriar container ao salvar imagem

A imagem do projeto so deve afetar novos ambientes; recriar o
container em execucao causava disrupção para o usuario.
```

### Step 5: Aplicar o commit
```bash
git add <arquivos relevantes>
git commit -m "tipo(escopo): descricao"
```
Preferir commits atomicos; se houver mudancas nao relacionadas, dividir em commits separados.

### Step 6: Empurrar para o remoto (OBRIGATORIO)
Apos o commit, SEMPRE fazer push da branch atual para o repositorio remoto. Nada pode ficar apenas local.
```bash
# descobrir a branch atual
git rev-parse --abbrev-ref HEAD

# push (a primeira vez na branch, definir o upstream)
git push
# se a branch ainda nao tem upstream:
git push -u origin <branch-atual>
```
Confirmar que o push foi concluido com sucesso (sem commits pendentes em `git status` / "ahead of origin"). Se o push falhar (ex.: rejeitado por divergencia), fazer `git pull --rebase` e empurrar novamente, resolvendo conflitos se necessario. O comando so esta completo quando o trabalho esta no remoto.

</workflow>