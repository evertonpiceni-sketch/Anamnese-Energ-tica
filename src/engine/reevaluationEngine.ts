import { ClassificacaoReavaliacao, RegistroReavaliacao, VariavelReavaliacao } from '../types';

export const VARIAVEIS_REAVALIACAO_PADRAO: string[] = [
  'Segurança e aterramento',
  'Tranquilidade interna',
  'Energia e vitalidade',
  'Clareza mental',
  'Autoconfiança e autovalor',
  'Capacidade de agir / movimento',
  'Conexão consigo mesmo',
  'Esperança e entusiasmo',
  'Conforto e percepção corporal',
];

export function processarReavaliacao(
  nomePessoa: string,
  anamneseId: string,
  variaveis: { nome: string; antes: number; depois: number; observacao?: string }[]
): RegistroReavaliacao {
  const processadas: VariavelReavaliacao[] = variaveis.map((v) => ({
    nome: v.nome,
    antes: v.antes,
    depois: v.depois,
    variacao: v.depois - v.antes,
    observacao: v.observacao,
  }));

  const ganhoMedio =
    processadas.reduce((acc, curr) => acc + curr.variacao, 0) / (processadas.length || 1);

  const pioraDetectada = processadas.some((v) => v.variacao <= -2);
  const estagnado = ganhoMedio >= -0.5 && ganhoMedio <= 0.8;
  const ganhoModerado = ganhoMedio > 0.8 && ganhoMedio <= 2.5;
  const ganhoExpressivo = ganhoMedio > 2.5;

  let classificacao: ClassificacaoReavaliacao = 'MANTER';
  let justificativaClinica = '';
  let proximaAcaoSugerida = '';

  if (pioraDetectada) {
    classificacao = 'REAVALIAR ANTES DE NOVA APLICAÇÃO';
    justificativaClinica =
      'Houve redução em variáveis de conforto ou tranquilidade. Pode indicar liberação de material emocional sensível (crise de cura leve) ou necessidade de maior tempo de ancoragem e sustentação antes de nova intervenção.';
    proximaAcaoSugerida =
      'Pausa de 5 a 7 dias com foco exclusivo em hidratação, descanso e ancoragem de pés na terra. Reavaliar antes de nova aplicação.';
  } else if (ganhoExpressivo) {
    classificacao = 'AMPLIAR';
    justificativaClinica =
      'Excelente resposta biossutil com ganho médio expressivo em segurança e clareza. O campo demonstrou alta receptividade à composição energética aplicada.';
    proximaAcaoSugerida =
      'Avançar para a fase de ancoragem de projetos práticos e movimento sereno (Soul Shakti / Expansão), mantendo a base de sustentação.';
  } else if (ganhoModerado) {
    classificacao = 'MANTER';
    justificativaClinica =
      'Evolução gradual e estável conforme o princípio de sustentação progressiva. A pessoa relata melhora sensível na sensação de acolhimento e redução da tensão.';
    proximaAcaoSugerida =
      'Manter a mesma composição na próxima sessão para consolidação dos resultados no campo celular.';
  } else if (estagnado) {
    classificacao = 'AJUSTAR';
    justificativaClinica =
      'Variação tímida nos indicadores subjetivos. O sistema-base sustentou, mas o recurso principal pode precisar de ajuste de frequência ou acréscimo de apoio complementar de aterramento (Cristaloterapia).';
    proximaAcaoSugerida =
      'Verificar se há resistência inconsciente ou sobrecarga ambiental não relatada. Ajustar recursos internos na próxima sessão.';
  } else {
    classificacao = 'TROCAR PRIORIDADE';
    justificativaClinica =
      'A necessidade inicial de urgência parece ter se estabilizado, permitindo que o foco terapêutico se desloque para o eixo secundário.';
    proximaAcaoSugerida =
      'Iniciar trabalho com o sistema complementar como novo foco principal da próxima etapa.';
  }

  return {
    id: `REAV-${Date.now().toString().slice(-6)}`,
    data: new Date().toISOString().split('T')[0],
    anamneseId,
    nomePessoa,
    variaveis: processadas,
    classificacao,
    justificativaClinica,
    proximaAcaoSugerida,
  };
}
