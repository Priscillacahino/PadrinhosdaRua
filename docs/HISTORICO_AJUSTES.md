# Histórico de ajustes - Padrinhos de Rua

## Consolidação acadêmica - 21/09/2026

Esta revisão alinha aplicativo, documentação e protótipos ao estado real do projeto extensionista.

### Correções de coerência
- situação física registrada como **0 casinhas instaladas**;
- meta piloto mantida em **até 10 casinhas**, sem compromisso de execução integral;
- todas as casinhas do conjunto inicial passam a iniciar como **planejadas**;
- locais, estoque e movimentações usados no MVP são identificados como **demonstrativos** até validação;
- remoção de nomes de apoiadores/doadores fictícios do fluxo atual;
- indicadores reais iniciam em zero;
- ações do MVP utilizam linguagem de simulação quando não representam atividade física.

### Aplicação e arquitetura
- interface mobile first simplificada em Início, Mapa, Oficina, Estoque e Perfil;
- persistência local do cenário demonstrativo no navegador, sem caracterizar banco compartilhado de produção;
- metadados sem permissões de câmera/geolocalização enquanto essas funções não estiverem ativas;
- código legado não importado pelo fluxo principal removido;
- validação automatizada de coerência adicionada;
- workflow de CI criado para `npm ci`, validação, TypeScript e build.

### Documentação
- relatório acadêmico consolidado em PDF e DOCX;
- requisitos e regras de negócio;
- privacidade e segurança;
- impacto, prós, limitações e mitigação;
- viabilidade financeira;
- indicadores e critérios de validação;
- modelo de dados;
- operação e manutenção;
- contexto municipal e declaração de independência;
- roteiro de vídeo e plano de prototipação;
- planilha de viabilidade financeira do piloto.

### Contexto municipal
As iniciativas legislativas relacionadas ao tema são registradas apenas como contexto documental. O Padrinhos de Rua permanece um projeto acadêmico e independente, sem vínculo institucional, político, administrativo ou operacional com seus autores ou com órgãos públicos.
