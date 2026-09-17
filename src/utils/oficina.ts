import { MaterialEstoque, PrevisaoCasinhaBairro } from '../types';

export interface DiagnosticoProducao {
  capacidadeAtualCasinhas: number;
  itemGargalo: MaterialEstoque | null;
  resumoDeficit: {
    material: MaterialEstoque;
    necessarioTotal: number;
    disponivelEstoque: number;
    faltaQuantidade: number;
    percentualAtendido: number;
  }[];
}

/**
 * Calcula a capacidade imediata de fabricação de casinhas com base no estoque disponível
 * e gera o diagnóstico detalhado do déficit de insumos para atingir a meta em João Pessoa.
 */
export function calcularDiagnosticoProducao(
  materiais: MaterialEstoque[],
  metaCasinhas: number
): DiagnosticoProducao {
  if (materiais.length === 0) {
    return {
      capacidadeAtualCasinhas: 0,
      itemGargalo: null,
      resumoDeficit: [],
    };
  }

  let minCasinhasPossiveis = Infinity;
  let itemGargalo: MaterialEstoque | null = null;

  const resumoDeficit = materiais.map((material) => {
    const possivelComEsteItem = Math.floor(
      material.quantidade_atual / material.consumo_por_casinha
    );

    if (possivelComEsteItem < minCasinhasPossiveis) {
      minCasinhasPossiveis = possivelComEsteItem;
      itemGargalo = material;
    }

    const necessarioTotal = metaCasinhas * material.consumo_por_casinha;
    const disponivelEstoque = material.quantidade_atual;
    const faltaQuantidade = Math.max(0, Number((necessarioTotal - disponivelEstoque).toFixed(1)));
    const percentualAtendido = Math.min(
      100,
      Math.round((disponivelEstoque / (necessarioTotal || 1)) * 100)
    );

    return {
      material,
      necessarioTotal,
      disponivelEstoque,
      faltaQuantidade,
      percentualAtendido,
    };
  });

  return {
    capacidadeAtualCasinhas: minCasinhasPossiveis === Infinity ? 0 : minCasinhasPossiveis,
    itemGargalo,
    resumoDeficit,
  };
}

/**
 * Gera mensagem formatada para compartilhar no WhatsApp dos voluntários de João Pessoa
 */
export function gerarTextoCampanhaDoacaoWhatsApp(
  materiais: MaterialEstoque[],
  metaCasinhas: number,
  capacidadeAtual: number,
  casinhasProntas: number
): string {
  const diagnostico = calcularDiagnosticoProducao(materiais, metaCasinhas);
  const itensFaltando = diagnostico.resumoDeficit.filter((d) => d.faltaQuantidade > 0);

  const linhasFaltantes = itensFaltando
    .map(
      (item) =>
        `• *${item.faltaQuantidade} ${item.material.unidade}* de ${item.material.nome}`
    )
    .join('\n');

  return (
    `🐾 *PADRINHOS DE RUA - JOÃO PESSOA (PB)*\n` +
    `🔨 *MUTIRÃO DE FABRICAÇÃO DAS CASINHAS COMUNITÁRIAS*\n\n` +
    `Hoje já temos os pontos de água e comida funcionando em João Pessoa! O próximo passo essencial do nosso plano é *fabricar e instalar as casinhas de proteção* contra sol forte e chuvas para os cães e gatos de rua.\n\n` +
    `🎯 *Meta do Plano Inicial:* ${metaCasinhas} casinhas para bairros de JP\n` +
    `🏠 *Casinhas Prontas/Em Montagem:* ${casinhasProntas}\n` +
    `⚡ *Estoque Atual Permite Montar:* ${capacidadeAtual} casinhas hoje\n\n` +
    `🚨 *O QUE ESTÁ FALTANDO NO ESTOQUE (DOAÇÕES NECESSÁRIAS):*\n` +
    `${linhasFaltantes}\n\n` +
    `📦 *Como doar:* Aceitamos doações de insumos novos ou usados em bom estado em depósitos parceiros ou via mutirão dos voluntários em João Pessoa.\n` +
    `📲 Acesse nosso portal de voluntários para registrar sua doação!`
  );
}
