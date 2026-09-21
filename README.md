# ðŸ¾ Padrinhos de Rua

> **Projeto de extensÃ£o de AnÃ¡lise e Desenvolvimento de Sistemas (ADS) do UNIPÃŠ, em fase de MVP acadÃªmico, que propÃµe tecnologia social para organizar o cuidado comunitÃ¡rio de animais em JoÃ£o Pessoa - PB.**

## Estado real do projeto

**Nenhuma casinha estÃ¡ instalada no momento.** A fase atual Ã© de planejamento, prototipaÃ§Ã£o e validaÃ§Ã£o do fluxo tecnolÃ³gico. A meta piloto Ã© de **atÃ© 10 casinhas**, condicionada a necessidade comprovada, materiais adequados, responsÃ¡veis de referÃªncia e autorizaÃ§Ã£o do local.

Os pontos, quantidades de estoque e movimentaÃ§Ãµes exibidos no MVP podem ser **dados demonstrativos**. Eles existem para testar a interface e nÃ£o devem ser interpretados como execuÃ§Ã£o fÃ­sica, parceria, doaÃ§Ã£o ou atendimento real.

## Problema que o projeto procura enfrentar

AÃ§Ãµes comunitÃ¡rias de apoio a animais podem perder continuidade quando nÃ£o hÃ¡ uma forma simples de acompanhar necessidades, responsÃ¡veis, reposiÃ§Ã£o, manutenÃ§Ã£o, materiais e histÃ³rico. O Padrinhos de Rua propÃµe usar tecnologia para apoiar esse ciclo, sem substituir voluntÃ¡rios, protetores, instituiÃ§Ãµes competentes ou atendimento veterinÃ¡rio.

**Pergunta orientadora:** como a tecnologia pode ajudar uma rede voluntÃ¡ria a manter pontos comunitÃ¡rios de apoio animal organizados e acompanhados ao longo do tempo?

## Proposta

O aplicativo Ã© pensado como PWA/mobile first e organiza cinco frentes:

- **InÃ­cio:** situaÃ§Ã£o do piloto, indicadores e formas de participaÃ§Ã£o;
- **Mapa:** visualizaÃ§Ã£o futura dos pontos e suas necessidades;
- **Oficina:** planejamento das casinhas e etapas anteriores Ã  instalaÃ§Ã£o;
- **Estoque:** materiais disponÃ­veis, necessÃ¡rios e dÃ©ficit;
- **Perfil:** participaÃ§Ã£o do voluntÃ¡rio e resultados comprovados.

### Jornada operacional

`PONTO â†’ NECESSIDADE â†’ VOLUNTÃRIO â†’ ATENDIMENTO â†’ MANUTENÃ‡ÃƒO â†’ REGISTRO â†’ HISTÃ“RICO â†’ INDICADORES`

O diferencial pretendido nÃ£o Ã© apenas criar casinhas ou um aplicativo, mas organizar a **continuidade do cuidado**.

## SeparaÃ§Ã£o entre planejamento e realidade

| Categoria | Significado |
|---|---|
| **Real/validado** | atividade de campo comprovada e autorizada |
| **Planejado** | intenÃ§Ã£o do piloto ainda nÃ£o executada |
| **Demonstrativo** | dado fictÃ­cio usado exclusivamente para testar o MVP |

Uma casinha sÃ³ poderÃ¡ constar como **instalada** depois de validaÃ§Ã£o fÃ­sica e registro de evidÃªncia. Um local sÃ³ poderÃ¡ constar como ponto oficial depois de validaÃ§Ã£o e autorizaÃ§Ã£o pertinentes.

## Impacto social esperado

O projeto pretende contribuir para:

- melhorar a organizaÃ§Ã£o das necessidades dos pontos;
- facilitar a participaÃ§Ã£o de voluntÃ¡rios;
- direcionar doaÃ§Ãµes de materiais para necessidades objetivas;
- registrar manutenÃ§Ã£o e reposiÃ§Ãµes;
- reduzir a dependÃªncia de informaÃ§Ã£o dispersa em mensagens e planilhas;
- permitir avaliaÃ§Ã£o do piloto por indicadores;
- aproximar formaÃ§Ã£o acadÃªmica em ADS de um problema social real.

Impacto esperado nÃ£o Ã© apresentado como resultado jÃ¡ alcanÃ§ado. Resultados reais serÃ£o documentados somente apÃ³s validaÃ§Ã£o de campo.

## Viabilidade financeira

A fase inicial prioriza **doaÃ§Ãµes de materiais e serviÃ§os**, sem arrecadaÃ§Ã£o financeira direta pelo aplicativo. O orÃ§amento do piloto deve separar:

1. materiais de construÃ§Ã£o e acabamento;
2. ferramentas e equipamentos de proteÃ§Ã£o;
3. identificaÃ§Ã£o do ponto;
4. transporte/logÃ­stica;
5. manutenÃ§Ã£o e substituiÃ§Ãµes;
6. contingÃªncia.

A fÃ³rmula bÃ¡sica proposta Ã©:

`Necessidade financeira = custo total validado - materiais/serviÃ§os doados e comprovados`

Qualquer futura arrecadaÃ§Ã£o em dinheiro deve usar canal institucional ou parceiro formal autorizado, com prestaÃ§Ã£o de contas.

## Contexto municipal e independÃªncia

O levantamento documental identificou iniciativas legislativas municipais relacionadas a comedouros/bebedouros, abrigos sustentÃ¡veis e aplicativo de adoÃ§Ã£o. Elas sÃ£o registradas **apenas como contexto local**.

> **O Padrinhos de Rua Ã© um projeto extensionista, acadÃªmico e voluntÃ¡rio desenvolvido de forma independente, sem vÃ­nculo institucional, polÃ­tico, administrativo ou operacional com proposiÃ§Ãµes legislativas, seus autores, a CÃ¢mara Municipal ou a Prefeitura de JoÃ£o Pessoa.**

A convergÃªncia estÃ¡ no problema social. O escopo do Padrinhos de Rua estÃ¡ na organizaÃ§Ã£o tecnolÃ³gica e voluntÃ¡ria da continuidade operacional dos pontos.

Veja: [`docs/CONTEXTO_E_DIFERENCIACAO.md`](./docs/CONTEXTO_E_DIFERENCIACAO.md).

## Tecnologias do MVP

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Vite PWA
- Lucide React
- Git/GitHub

O cÃ³digo principal nÃ£o utiliza IA, Express, chaves externas, cÃ¢mera ou geolocalizaÃ§Ã£o nesta fase. Algumas dependÃªncias histÃ³ricas permanecem no lockfile para preservar a instalaÃ§Ã£o reproduzÃ­vel e serÃ£o removidas em uma manutenÃ§Ã£o especÃ­fica do conjunto de dependÃªncias.

## Documento acadÃªmico principal

- [RelatÃ³rio AcadÃªmico Consolidado - PDF](./docs/Padrinhos_de_Rua_Relatorio_Academico_Consolidado.pdf)
- [RelatÃ³rio AcadÃªmico Consolidado - DOCX](./docs/Padrinhos_de_Rua_Relatorio_Academico_Consolidado.docx)
- [Planilha de Viabilidade Financeira do Piloto](./docs/Planilha_Viabilidade_Financeira_Piloto.xlsx)

## ProtÃ³tipos

O repositÃ³rio possui 11 telas mobile produzidas ao longo da evoluÃ§Ã£o do projeto. Elas sÃ£o tratadas como protÃ³tipos acadÃªmicos/demonstrativos quando exibirem nÃºmeros ainda nÃ£o validados. A organizaÃ§Ã£o e as regras de leitura estÃ£o descritas em [`prototipos/README.md`](./prototipos/README.md), incluindo a separaÃ§Ã£o entre protÃ³tipo visual e funcionalidade efetivamente implementada.

## DocumentaÃ§Ã£o de apoio

- [`docs/PROJETO_EXTENSIONISTA_COMPLETO.md`](./docs/PROJETO_EXTENSIONISTA_COMPLETO.md)
- [`docs/CONTEXTO_E_DIFERENCIACAO.md`](./docs/CONTEXTO_E_DIFERENCIACAO.md)
- [`docs/IMPACTO_PROS_CONTRAS.md`](./docs/IMPACTO_PROS_CONTRAS.md)
- [`docs/VIABILIDADE_FINANCEIRA.md`](./docs/VIABILIDADE_FINANCEIRA.md)
- [`docs/REQUISITOS.md`](./docs/REQUISITOS.md)
- [`docs/REGRAS_DE_NEGOCIO.md`](./docs/REGRAS_DE_NEGOCIO.md)
- [`docs/MODELO_DE_DADOS.md`](./docs/MODELO_DE_DADOS.md)
- [`docs/PRIVACIDADE_E_SEGURANCA.md`](./docs/PRIVACIDADE_E_SEGURANCA.md)
- [`docs/OPERACAO_E_MANUTENCAO.md`](./docs/OPERACAO_E_MANUTENCAO.md)
- [`docs/INDICADORES_E_VALIDACAO.md`](./docs/INDICADORES_E_VALIDACAO.md)
- [`docs/ROTEIRO_VIDEO_DEMONSTRACAO.md`](./docs/ROTEIRO_VIDEO_DEMONSTRACAO.md)
- [`docs/LIMPEZA_E_REAPROVEITAMENTO_CODIGO.md`](./docs/LIMPEZA_E_REAPROVEITAMENTO_CODIGO.md)

## Executando localmente

```bash
npm ci
npm run validate:project
npm run lint
npm run dev
```

ValidaÃ§Ã£o completa (coerÃªncia + TypeScript + build):

```bash
npm run check
```

O GitHub Actions executa automaticamente validaÃ§Ã£o de coerÃªncia, TypeScript e build em pushes e pull requests para `main`.

## Limites do MVP

Nesta etapa, nÃ£o sÃ£o tratados como concluÃ­dos: banco compartilhado de produÃ§Ã£o, autenticaÃ§Ã£o, mapa cartogrÃ¡fico real, notificaÃ§Ãµes oficiais, parceria institucional, implantaÃ§Ã£o fÃ­sica das casinhas ou validaÃ§Ã£o comunitÃ¡ria formal.

## Origem acadÃªmica

Projeto de extensÃ£o do curso de **AnÃ¡lise e Desenvolvimento de Sistemas - UNIPÃŠ**.

ResponsÃ¡vel geral pelo material consolidado: **Priscilla Santos Cahino**.

