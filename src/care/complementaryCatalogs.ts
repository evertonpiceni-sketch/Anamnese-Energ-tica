import { EixoId } from '../types';

export type CatalogStatus = 'ATIVO' | 'PARCIAL' | 'PENDENTE' | 'INATIVO';

export interface FloralResource {
  id: string;
  nome: string;
  sistemaOrigem: string;
  descricao: string;
  eixos: EixoId[];
  formaUso?: string;
  restricoes: string[];
  fonteDocumental?: string;
  status: CatalogStatus;
}

export interface AromatherapyResource {
  id: string;
  nome: string;
  descricao: string;
  eixos: EixoId[];
  formaUsoPermitida?: string;
  restricoes: string[];
  fonteDocumental?: string;
  status: CatalogStatus;
}

export interface EthericCrystalResource {
  id: string;
  nome: string;
  sistemaOrigem: string;
  descricao: string;
  eixos: EixoId[];
  chakras: string[];
  formaAplicacao?: string;
  restricoes: string[];
  fonteDocumental?: string;
  status: CatalogStatus;
}

// As bibliotecas começam vazias por regra: nenhum recurso é inventado.
// O ADM poderá preencher somente a partir de material/documentação confirmada.
export const FLORAL_CATALOG: FloralResource[] = [
  {
    id: 'bach-mimulus',
    nome: 'Mimulus',
    sistemaOrigem: 'Florais de Bach',
    descricao: 'Material de formação relaciona Mimulus a medos conhecidos, timidez, nervosismo diante de desafios e retomada de coragem/confiança.',
    eixos: ['seguranca', 'poder_pessoal', 'movimento', 'autovalor'],
    formaUso: 'Posologia não automatizada. Utilizar somente conforme protocolo floral validado pelo terapeuta.',
    restricoes: ['Não apresentar como tratamento médico ou substituto de cuidado clínico.'],
    fonteDocumental: 'Apostila Florais — Portal Prosperidade, p.34, linhas 828-841.',
    status: 'ATIVO',
  },
  {
    id: 'bach-aspen',
    nome: 'Aspen',
    sistemaOrigem: 'Florais de Bach',
    descricao: 'Material de formação relaciona Aspen a medos vagos, receios sem causa clara, maus pressentimentos e insegurança diante do desconhecido.',
    eixos: ['seguranca', 'mente', 'protecao', 'emocional'],
    formaUso: 'Posologia não automatizada. Utilizar somente conforme protocolo floral validado pelo terapeuta.',
    restricoes: ['Não apresentar como tratamento médico ou substituto de cuidado clínico.'],
    fonteDocumental: 'Apostila Florais — Portal Prosperidade, p.38, linhas 894-907.',
    status: 'ATIVO',
  },
  {
    id: 'bach-larch',
    nome: 'Larch',
    sistemaOrigem: 'Florais de Bach',
    descricao: 'Material de formação relaciona Larch a falta de confiança no próprio valor, sensação de incapacidade e fortalecimento de determinação e autoconfiança.',
    eixos: ['autovalor', 'poder_pessoal', 'movimento', 'criatividade'],
    formaUso: 'Posologia não automatizada. Utilizar somente conforme protocolo floral validado pelo terapeuta.',
    restricoes: ['Não apresentar como tratamento médico ou substituto de cuidado clínico.'],
    fonteDocumental: 'Apostila Florais — Portal Prosperidade, p.79, linhas 1604-1617.',
    status: 'ATIVO',
  },
];

export const AROMATHERAPY_CATALOG: AromatherapyResource[] = [
  {
    id: 'oe-lavanda-olfativo',
    nome: 'Lavanda — uso olfativo/ambiental',
    descricao: 'Material de formação descreve lavanda em contexto de relaxamento, tranquilidade, paciência e conforto. O app limita a indicação automática à via olfativa/ambiental.',
    eixos: ['mente', 'emocional', 'seguranca', 'integracao'],
    formaUsoPermitida: 'Somente uso olfativo/ambiental conforme orientação cadastrada; não automatizar ingestão ou aplicação tópica.',
    restricoes: [
      'Não automatizar dose.',
      'Não sugerir ingestão.',
      'Uso complementar; não substituir cuidado médico.',
      'Respeitar sensibilidade individual e interromper em caso de desconforto.',
    ],
    fonteDocumental: 'AromaterapiaApostila.pdf, p.33, linhas 698-714; via olfativa descrita no material como opção de menor quantidade e menor risco.',
    status: 'ATIVO',
  },
  {
    id: 'oe-bergamota-olfativo',
    nome: 'Bergamota — uso olfativo/ambiental',
    descricao: 'Material de formação descreve bergamota em contexto de conforto, equilíbrio, ânimo e estresse. O app limita a indicação automática à via olfativa/ambiental.',
    eixos: ['emocional', 'mente', 'vitalidade', 'integracao'],
    formaUsoPermitida: 'Somente uso olfativo/ambiental conforme orientação cadastrada; não automatizar ingestão ou aplicação tópica.',
    restricoes: [
      'Não automatizar dose.',
      'Não sugerir ingestão.',
      'Evitar indicação tópica automática; o material alerta para fotossensibilidade após uso na pele.',
      'Uso complementar; não substituir cuidado médico.',
    ],
    fonteDocumental: 'AromaterapiaApostila.pdf, p.29, linhas 625-641 e p.46, linhas 929-944.',
    status: 'ATIVO',
  },
];

export const ETHERIC_CRYSTAL_CATALOG: EthericCrystalResource[] = [
  {
    id: 'cristal-jaspe-vermelho',
    nome: 'Jaspe Vermelho',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Usado no bloco inicial de presença e chão.',
    eixos: ['seguranca', 'corpo', 'vitalidade'],
    chakras: [],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 61-77.',
    status: 'ATIVO',
  },
  {
    id: 'cristal-turmalina-negra',
    nome: 'Turmalina Negra',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Usada no bloco inicial de presença e chão.',
    eixos: ['seguranca', 'protecao', 'corpo'],
    chakras: [],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 61-77.',
    status: 'ATIVO',
  },
  {
    id: 'cristal-cornalina',
    nome: 'Cornalina',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Aparece em blocos de presença, movimento, vitalidade e integração.',
    eixos: ['vitalidade', 'movimento', 'poder_pessoal', 'integracao'],
    chakras: [],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 61-77, 189-214 e 248-272.',
    status: 'ATIVO',
  },
  {
    id: 'cristal-quartzo-rosa',
    nome: 'Quartzo Rosa',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Usado em blocos de acolhimento, receptividade, amor-próprio e integração.',
    eixos: ['emocional', 'autovalor', 'receber', 'integracao'],
    chakras: ['Cardíaco'],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 93-117, 162-185 e 248-272.',
    status: 'ATIVO',
  },
  {
    id: 'cristal-pedra-da-lua',
    nome: 'Pedra da Lua',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Usada no bloco de retorno ao sentir, receptividade e prazer simples.',
    eixos: ['emocional', 'receber', 'prazer', 'corpo'],
    chakras: ['Sacral'],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 93-117.',
    status: 'ATIVO',
  },
  {
    id: 'cristal-amazonita',
    nome: 'Amazonita',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Usada em blocos de acolhimento, adaptação, tranquilidade e percepção mais gentil de si.',
    eixos: ['emocional', 'autovalor', 'integracao', 'receber'],
    chakras: [],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 93-117 e 162-185.',
    status: 'ATIVO',
  },
  {
    id: 'cristal-citrino',
    nome: 'Citrino',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Usado em blocos de escolha, motivação, movimento, direção e integração.',
    eixos: ['movimento', 'poder_pessoal', 'proposito', 'vitalidade'],
    chakras: ['Plexo Solar'],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 125-148, 189-214, 219-243 e 248-272.',
    status: 'ATIVO',
  },
  {
    id: 'cristal-olho-de-tigre',
    nome: 'Olho de Tigre',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Usado em blocos de confiança, motivação, iniciativa, foco e direção.',
    eixos: ['poder_pessoal', 'movimento', 'mente', 'proposito'],
    chakras: ['Plexo Solar'],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 125-148, 189-214 e 219-243.',
    status: 'ATIVO',
  },
  {
    id: 'cristal-ametista',
    nome: 'Ametista',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Usada em blocos de percepção de padrões, tranquilidade, clareza e integração.',
    eixos: ['mente', 'padroes', 'emocional', 'integracao'],
    chakras: ['Frontal'],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 125-148, 162-185 e 219-243.',
    status: 'ATIVO',
  },
  {
    id: 'cristal-sodalita',
    nome: 'Sodalita',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Usada no bloco de clareza, foco, discernimento e direção.',
    eixos: ['mente', 'proposito', 'espiritualidade'],
    chakras: ['Frontal'],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 219-243.',
    status: 'ATIVO',
  },
  {
    id: 'cristal-quartzo-transparente',
    nome: 'Quartzo Transparente',
    sistemaOrigem: 'Cristais etéricos de apoio — Reintegração da Vida',
    descricao: 'Usado no bloco final de integração da jornada.',
    eixos: ['integracao', 'espiritualidade', 'proposito'],
    chakras: [],
    formaAplicacao: 'Como cristal/frequência dentro do protocolo documentado, sem inventar comando próprio.',
    restricoes: ['Usar somente dentro das formas de aplicação documentadas no protocolo.'],
    fonteDocumental: 'Reintegracao_da_Vida_Roteiros_Completos.docx, linhas 248-272.',
    status: 'ATIVO',
  },
];

export interface ComplementaryCareSelection {
  florals: FloralResource[];
  aromatherapy: AromatherapyResource[];
  ethericCrystals: EthericCrystalResource[];
}

function scoreByAxes(resourceAxes: EixoId[], axes: Array<{ eixoId: EixoId; percentual: number }>) {
  return axes.slice(0, 5).reduce((score, axis, index) => {
    if (!resourceAxes.includes(axis.eixoId)) return score;
    const positionWeight = Math.max(1, 5 - index);
    return score + axis.percentual * positionWeight;
  }, 0);
}

export function selectComplementaryCare(
  axes: Array<{ eixoId: EixoId; percentual: number }>
): ComplementaryCareSelection {
  const florals = FLORAL_CATALOG
    .filter(item => item.status === 'ATIVO')
    .map(item => ({ item, score: scoreByAxes(item.eixos, axes) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(x => x.item);

  const aromatherapy = AROMATHERAPY_CATALOG
    .filter(item => item.status === 'ATIVO' && item.formaUsoPermitida)
    .map(item => ({ item, score: scoreByAxes(item.eixos, axes) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 1)
    .map(x => x.item);

  const ethericCrystals = ETHERIC_CRYSTAL_CATALOG
    .filter(item => item.status === 'ATIVO')
    .map(item => ({ item, score: scoreByAxes(item.eixos, axes) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.item);

  return { florals, aromatherapy, ethericCrystals };
}
