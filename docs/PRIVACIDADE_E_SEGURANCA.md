# Privacidade, segurança e uso responsável de dados

## Princípios

- coletar somente dados necessários;
- não publicar dados pessoais de voluntários por padrão;
- separar localização operacional de localização pública quando houver risco;
- solicitar permissão de câmera/geolocalização apenas quando a funcionalidade realmente existir e estiver sendo usada;
- registrar finalidade e tempo de retenção de fotos e ocorrências;
- evitar fotografar pessoas identificáveis sem necessidade;
- permitir correção de registros equivocados;
- restringir funções administrativas quando houver banco compartilhado.

## Dados potenciais

| Dado | Risco | Tratamento recomendado |
|---|---|---|
| nome/contato do voluntário | exposição indevida | acesso restrito e mínimo necessário |
| localização do ponto | vandalismo ou uso inadequado | precisão proporcional ao perfil de acesso |
| fotos do ponto | pessoas/placas podem aparecer | orientação de captura e revisão |
| histórico de ações | atribuição incorreta | autoria, data/hora e trilha de alterações |
| doações | exposição do doador | consentimento e opção de anonimato público |

## MVP atual

A versão local revisada não precisa solicitar câmera nem geolocalização porque essas funções não estão ativas no fluxo principal. As permissões devem ser introduzidas somente quando houver implementação real e justificativa funcional.
