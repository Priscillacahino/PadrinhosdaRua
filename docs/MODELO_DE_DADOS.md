# Modelo de dados proposto

## Entidades principais

### Ponto
- id
- nome público
- bairro/referência
- latitude/longitude (com política de precisão)
- situação
- natureza do dado: demonstrativo, planejado ou validado
- data da última verificação

### EstruturaPonto
- ponto_id
- tipo: bebedouro, comedouro, casinha
- status
- data de implantação real (opcional)
- autorização/referência documental (opcional)

### Voluntario
- id
- nome mínimo necessário
- meio de contato restrito
- consentimentos
- situação ativa/inativa

### Atendimento
- ponto_id
- voluntario_id
- tipo de ação
- data/hora
- observação
- evidência (quando necessária)
- natureza do registro

### Ocorrencia
- ponto_id
- tipo
- prioridade
- abertura
- situação
- resolução

### Material
- id
- nome
- unidade
- quantidade real
- consumo estimado

### MovimentoEstoque
- material_id
- tipo: entrada/saída/ajuste
- quantidade
- origem/destino
- data
- responsável
- comprovante/referência quando aplicável

### CasinhaPlanejada
- número no piloto
- ponto pretendido
- situação
- autorização
- responsável
- custo previsto/real
- data de construção/instalação quando ocorrer

## Regra de separação

Dados demonstrativos devem usar base/coleção separada ou campo obrigatório que impeça sua inclusão em relatórios reais.
