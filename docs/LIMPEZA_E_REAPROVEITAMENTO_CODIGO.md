# Limpeza e reaproveitamento do código existente

## Diagnóstico

O repositório atual mistura a interface mobile simplificada com componentes de uma arquitetura anterior, incluindo console de API, GPS de proximidade, captura de foto, TTL e modais de urgência. Esses componentes não são importados pela tela principal atual e podem passar a impressão de funcionalidades ativas quando não estão integrados ao fluxo vigente.

## Decisão aplicada ao fluxo principal

Não descartar a lógica útil; separar em duas categorias:

### Reaproveitar futuramente
- cálculo de distância geográfica;
- ideia de registro de atendimento;
- histórico de ações;
- indicador offline/PWA;
- captura de evidência, se houver justificativa de privacidade;
- lógica de validade temporal do status do ponto.

### Retirar do fluxo atual ou arquivar
- “console de API” que simula backend como se estivesse online;
- linguagem de “anti-fraude” para voluntariado comunitário;
- parceiros/doadores fictícios;
- registros de casinhas como instaladas sem implantação real;
- exemplos de urgência com dados que parecem ocorrência real;
- integrações de IA/Express/dotenv/motion não são utilizadas pelo MVP principal e não aparecem como funcionalidades ativas.

## Correções aplicadas à revisão

- componentes legados sem importação pelo fluxo principal foram retirados do código ativo;
- dependências históricas ainda presentes no `package-lock.json` serão tratadas em uma manutenção específica para preservar a reprodutibilidade da instalação atual;
- `.env.example` não sugere chave Gemini inexistente;
- permissões de câmera/geolocalização removidas dos metadados até implementação real;
- todas as 10 casinhas iniciam como planejadas;
- indicadores reais começam em zero;
- locais e estoque de teste são explicitamente demonstrativos;
- interface usa “simular” para ações que não representam operação física.

## Controle de qualidade

A revisão inclui uma checagem automática de coerência (`npm run validate:project`) e um workflow de CI para executar instalação, validação, TypeScript e build. A exclusão dos componentes legados foi limitada aos arquivos que não participavam do fluxo principal atual.
