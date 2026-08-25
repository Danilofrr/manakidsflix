# Correção definitiva do player Maná Kids+

## Objetivo
Separar claramente a reprodução em dois modos: YouTube pela API oficial, respeitando o branding que a própria plataforma exigir, e Maná Kids/streaming externo por HTML5 + HLS, sem iframe ou identidade visual externa.

## Implementação

### 1. Modelo de vídeo e banco
- Padronizar as fontes como `youtube`, `mana_kids` e `external`, mantendo leitura compatível com registros antigos `upload`.
- Adicionar aos títulos e episódios os campos `video_provider` e `provider_video_id`, além dos campos de URL/HLS já existentes.
- Adicionar os campos equivalentes ao trailer para que ele use a mesma arquitetura.
- Fazer a migração sem alterar IDs de títulos ou episódios; metadados, fileiras, categorias e progresso continuarão vinculados aos mesmos registros.
- Manter as políticas e permissões atuais das tabelas; a migração apenas amplia colunas existentes.

### 2. Player Maná Kids
- Remover o título repetido e todo o cabeçalho sobre o vídeo.
- Antes do play, renderizar somente a thumbnail cadastrada e o botão central da Maná Kids; nenhum iframe será criado antecipadamente.
- Para `mana_kids` e `external`, usar exclusivamente `<video>` com HLS.js quando houver `.m3u8`, preferindo HLS em vez de MP4.
- Manter controles próprios: play/pause, ±10 segundos, progresso, tempo/duração, volume/mudo, CC e tela cheia.
- Adaptar a barra para toque em telas pequenas e ocultar os controles após inatividade, reaparecendo por mouse, toque ou teclado.
- Exibir erros de fonte de forma própria, sem interface do provedor.

### 3. Modo YouTube honesto
- Criar o iframe somente depois do play, usando a YouTube IFrame Player API com `controls=0`, `playsinline=1`, `enablejsapi=1`, `rel=0` e `origin` da aplicação.
- Usar os controles Maná Kids ao redor da reprodução e não mostrar URL, canal, descrição, visualizações ou metadados externos na página.
- Não aplicar máscara, crop, sobreposição para esconder branding, manipulação do iframe ou qualquer outro hack; elementos que o YouTube exigir dentro do iframe poderão aparecer.

### 4. Admin de filmes, trailers e episódios
- Manter as três opções visíveis: YouTube, Biblioteca Maná Kids e Streaming externo.
- Biblioteca: selecionar arquivo armazenado e salvar como `mana_kids`.
- Externo: aceitar MP4 ou HLS e incluir provedor (Bunny Stream, Cloudflare Stream, Mux ou outro) e ID do vídeo.
- Atualizar episódios para usar o mesmo seletor de fonte e o mesmo editor de legendas dos filmes.
- Ao trocar apenas a fonte, preservar todos os demais campos do conteúdo e conservar os dados das outras fontes para permitir retorno posterior sem redigitação.

### 5. Legendas, progresso e encerramento
- Manter `.vtt` e conversão de `.srt` para WebVTT nos vídeos HTML5; esconder CC quando não houver faixas.
- Continuar salvando posição, duração, percentual/conclusão e atualização por título/episódio, retomando do último ponto.
- Manter a tela final própria com assistir novamente, próximo, voltar e recomendações exclusivas do catálogo Maná Kids.
- Corrigir a retomada individual de episódios e garantir que HLS/YouTube de episódios sejam resolvidos pela fonte cadastrada.

## Validação
- Conferir build e erros de runtime.
- Testar no navegador os estados de thumbnail, início, controles, retomada e encerramento.
- Testar responsividade em desktop e mobile.
- Verificar que o modo próprio não cria iframe e que o modo YouTube não usa nenhum artifício visual para ocultar o conteúdo interno.
