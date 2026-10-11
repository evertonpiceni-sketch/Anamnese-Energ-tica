import type { DailyEnergyPlan } from '../care/dailyEnergySchedule';
import { applyConfirmedJourney } from './confirmedJourney';
import { CareComposition } from '../care/careComposer';
import { selectBathSupport } from '../care/bathCatalog';
import { selectComplementaryCare } from '../care/complementaryCatalogs';
import { selectSolfeggioFrequency } from '../care/solfeggioCatalog';
import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { AnamneseInput } from '../types';

export interface FullReportNarrative {
  nome: string;
  journeyDays?: 7 | 21;
  dailyEnergySchedule?: DailyEnergyPlan[];
  page1: { title: string; subtitle: string; intro: string };
  page2: { title: string; paragraphs: string[]; cycle?: string };
  page3: { title: string; paragraphs: string[]; preserved: string[]; chakras: Array<{ name: string; text: string }> };
  page4: { title: string; paragraphs: string[] };
  page5: { title: string; paragraphs: string[]; closingTitle: string; closing: string[] };
}

type Answer = { id:string; text:string; level:number };
const firstName=(v:string)=>v.trim().split(/\s+/)[0]||'você';
const uniq=(v:string[])=>v.filter((x,i,a)=>Boolean(x)&&a.indexOf(x)===i);
const join=(v:string[])=>v.length<2?(v[0]||''):v.length===2?`${v[0]} e ${v[1]}`:`${v.slice(0,-1).join(', ')} e ${v[v.length-1]}`;
const clean=(v:string)=>v.replace(/\s+—\s+.*/, '').trim();

function answers(input:AnamneseInput):Answer[]{
  return PERGUNTAS_ANAMNESE.map(q=>({id:q.id,text:q.texto,level:input.respostasObjetivas[q.id]??0})).sort((a,b)=>b.level-a.level);
}

function relationships(a:Answer[]){
  const has=(id:string)=>a.some(x=>x.id===id&&x.level>=3); const out:string[]=[];
  if(has('q2_mente_acelerada')&&has('q1_procrastinacao_inicio')) out.push('Sua mente parece estar tentando dar conta de muita coisa ao mesmo tempo. Quando isso acontece, começar pode ficar mais difícil — não porque falte vontade, mas porque o primeiro passo chega carregado de pensamentos, antecipações e pressão.');
  if(has('q5_autocobranca_insuficiencia')&&has('q1_procrastinacao_inicio')) out.push('Também aparece uma cobrança forte sobre você mesmo. Quanto mais você sente que precisa fazer direito, resolver logo ou corresponder, mais pesada a ação pode ficar. O adiamento alivia por um instante, mas depois devolve cobrança e cansaço.');
  if(has('q4_cansaco_esgotamento')) out.push('O cansaço que aparece nas suas respostas muda a direção do cuidado. Antes de pedir produtividade, decisão ou coragem, é preciso devolver sustentação. Você não precisa ser empurrado; precisa encontrar chão para conseguir se mover sem se violentar.');
  if(has('q7_dificuldade_dizer_nao')||has('q8_dificuldade_receber')) out.push('Existe ainda um ponto delicado na forma como você se coloca nas relações: oferecer, sustentar e compreender pode estar mais disponível do que receber, limitar ou dizer do que você precisa. Isso também consome energia e merece cuidado.');
  if(has('q6_engolir_emocoes')) out.push('Há sentimentos que parecem permanecer mais tempo dentro de você do que deveriam. O cuidado não vai exigir que você os resolva imediatamente; primeiro vai criar espaço para que possam ser reconhecidos, acolhidos e expressos com mais segurança.');
  return out.slice(0,4);
}

function chakraText(name:string,a:Answer[]){
  const has=(id:string)=>a.some(x=>x.id===id&&x.level>=3); const n=name.toLowerCase();
  if(n.includes('raiz')||n.includes('bás')) return 'Este centro pede chão, segurança e sensação de amparo. Por isso ele entra no início do cuidado: antes de qualquer expansão, o seu sistema precisa sentir que pode repousar e se sustentar.';
  if(n.includes('frontal')) return has('q2_mente_acelerada')?'Aqui aparece a sobrecarga mental. O cuidado busca diminuir o ruído interno para que clareza não seja mais uma obrigação, mas algo que possa surgir quando a mente encontra espaço.':'Este centro pede mais silêncio interno, percepção e clareza.';
  if(n.includes('plexo')) return 'Aqui tocamos confiança, autonomia e movimento. A intenção não é cobrar força, mas ajudar você a recuperar firmeza para escolher e agir sem transformar cada passo em prova de valor.';
  if(n.includes('card')) return 'Este centro fala de acolhimento e reciprocidade. O trabalho é permitir que você também receba, se inclua e se trate com a mesma presença que costuma oferecer para fora.';
  if(n.includes('lar')) return 'Este centro pede voz e limite. O cuidado favorece a expressão do que você sente e precisa, sem culpa por ocupar o próprio espaço.';
  if(n.includes('coron')) return 'Este centro aparece ligado a sentido, conexão e integração. O foco é aproximar aquilo que você sente por dentro da vida que consegue viver concretamente.';
  return 'Este centro aparece como parte importante do seu momento e será acompanhado com delicadeza ao longo do percurso.';
}

export function buildFullReportNarrative({intake,analysis,composition,journeyDays,dailyEnergySchedule}:{intake:AnamneseInput;analysis:AnaliseCompletaResultado;composition:CareComposition|null;journeyDays?:7|21;dailyEnergySchedule?:DailyEnergyPlan[]}):FullReportNarrative{
  const nome=firstName(intake.nomePessoa); const report=analysis.relatorioEverton; const all=answers(intake); const active=all.filter(x=>x.level>=2); const rel=relationships(active);
  const ranked=report.eixosOrdenados; const priorities=ranked.filter(x=>x.percentual>0).slice(0,4).map(x=>x.nome.toLowerCase());
  const preserved=report.analiseContextualAvancada?.fatoresPreservados.recursosInternosPreservados||[];
  const chakras=uniq([...report.regioesCorporais.chakrasCorrespondentes,...report.recursosInternos.chakras]).slice(0,5);
  const automatic=selectComplementaryCare(ranked); const solfeggio=composition ? composition.solfeggio : selectSolfeggioFrequency(ranked);
  const crystals=composition ? composition.ethericCrystals : automatic.ethericCrystals;
  const florals=composition ? composition.floral : automatic.florals;
  const aromas=composition ? composition.aromatherapy : automatic.aromatherapy;
  const bath=selectBathSupport(ranked);
  const page4:string[]=[];

  page4.push(`Direção do cuidado: ${nome}, o seu percurso começa por sustentação e segurança. Depois, vamos aliviar o que hoje está em excesso, acolher o campo emocional e fortalecer confiança, clareza e movimento. A ordem importa: você não precisa se forçar a avançar antes de se sentir mais amparado por dentro.`);
  if(solfeggio) page4.push(`Frequência de apoio — ${solfeggio.hz} Hz: ela acompanha ${solfeggio.intencaoProjeto.toLowerCase()}. Dentro da sua composição, será usada como apoio ao ambiente energético do áudio, em coerência com aquilo que apareceu na anamnese.`);
  if(crystals.length) page4.push(`Cristais etéricos — ${join(crystals.map(x=>x.nome))}: entram para sustentar os centros e prioridades identificados na sua leitura. São referências energéticas da composição; você não precisa adquirir nem usar pedras físicas.`);
  if(florals.length) page4.push(`Florais — ${join(florals.map(x=>x.nome))}: foram aproximados do seu momento emocional para apoiar, com suavidade, os temas que apareceram com mais força nas respostas. Eles complementam o percurso sem substituir outros cuidados que façam parte da sua vida.`);
  if(aromas.length) page4.push(`Aromaterapia — ${join(aromas.map(x=>clean(x.nome)))}: entra como apoio sensorial para ajudar o corpo a reconhecer momentos de pausa, presença e acolhimento durante o percurso.`);
  if(bath) page4.push(`Banho de apoio — ${bath.nome}: este é um recurso complementar para marcar um momento de cuidado consigo. Ele acompanha a mesma intenção da composição e deve ser usado conforme a orientação prevista para esse recurso.`);

  const free:string[]=[];
  if(intake.relatoLivreNecessidade?.trim()) free.push(`Quando você escreve “${intake.relatoLivreNecessidade.trim()}”, isso não fica à margem da análise. Essa frase ajuda a mostrar onde você sente que mais precisa ser encontrado agora.`);
  if(intake.relatoLivreDesafios?.trim()) free.push(`Você também nomeou “${intake.relatoLivreDesafios.trim()}” como algo difícil de atravessar. Esse ponto será observado ao longo do percurso, não para medir desempenho, mas para perceber se ele começa a pesar de outra forma.`);
  const cycle=all.some(x=>x.id==='q1_procrastinacao_inicio'&&x.level>=3)&&all.some(x=>x.id==='q5_autocobranca_insuficiencia'&&x.level>=3)?'muitas demandas → sobrecarga → dificuldade de começar ou decidir → adiamento → alívio curto → cobrança → cansaço → nova tentativa':undefined;

  const narrative: FullReportNarrative = {nome, dailyEnergySchedule,
    page1:{title:'Relatório Completo — Leitura do Seu Momento',subtitle:'Uma leitura feita para que você consiga se reconhecer nela e, principalmente, saiba por onde o cuidado vai começar.',intro:`${nome}, eu quero que você leia estas páginas sem a sensação de estar recebendo um diagnóstico frio. Aqui estão os fios que apareceram nas suas respostas, aquilo que ainda permanece forte em você e o caminho de cuidado pensado para este momento.`},
    page2:{title:'Diagnóstico da Anamnese',paragraphs:[`${nome}, quando suas respostas são colocadas lado a lado, os pontos que mais pedem cuidado aparecem em ${join(priorities)||'um acompanhamento gentil do seu momento, sem sinais intensos nas respostas objetivas'}. Vamos olhar com cuidado para como esses movimentos se encontram na sua vida.`,...rel,...free,'O direcionamento, portanto, não começa exigindo mudança. Começa diminuindo a pressão. A proposta é criar sustentação suficiente para que clareza, confiança e movimento possam voltar a aparecer sem serem arrancados à força.'],cycle},
    page3:{title:'O que suas respostas contam sobre você',paragraphs:['Nem tudo em você está cansado ou fragilizado. Há recursos que continuam presentes e que serão usados a favor do seu processo. Cuidar não é olhar apenas para o que dói; é também lembrar a você aquilo que ainda está vivo.',intake.relatoLivrePreservado?.trim()?`Você mesmo reconheceu algo importante: “${intake.relatoLivrePreservado.trim()}”. Isso será tratado como força do percurso, não como detalhe.`:'O simples fato de você conseguir olhar para o próprio momento já mostra percepção, desejo de mudança e abertura para um cuidado diferente da cobrança.'],preserved:preserved.length?preserved:['capacidade de se observar','desejo verdadeiro de mudança','sensibilidade para perceber o próprio momento','abertura para receber cuidado','possibilidade de recomeçar sem precisar fazer tudo de uma vez'],chakras:chakras.map(name=>({name,text:chakraText(name,active)}))},
    page4:{title:'O que vamos trabalhar com você',paragraphs:page4},
    page5:{title:'Seu percurso de cuidado',paragraphs:['A duração e a programação diária serão apresentadas conforme o plano confirmado e a composição aprovada.','Nos primeiros movimentos, o foco é você se sentir mais sustentado. Isso significa diminuir excesso de pressão, criar momentos reais de pausa e permitir que corpo, emoção e mente voltem a ser percebidos juntos.','Com essa base, o trabalho avança para os centros e temas que apareceram na sua leitura. O áudio personalizado reúne as energias escolhidas para você; os demais recursos entram como apoio ao mesmo direcionamento, e não como uma lista de coisas para cumprir.','Ao longo do percurso, observe menos se você está “fazendo certo” e mais o que muda dentro de você: onde existe um pouco mais de espaço, o que deixa de apertar tanto, o que começa a ficar mais claro e onde ainda existe resistência ou cansaço.','Na reavaliação, essas percepções serão comparadas com o seu ponto de partida. O cuidado poderá então ser ajustado ao que realmente mudou — porque o percurso deve acompanhar você, e não obrigar você a acompanhar um roteiro rígido.'],closingTitle:`Uma última coisa, ${nome}`,closing:['Você não precisa chegar aqui forte.','Não precisa ter todas as respostas.','Não precisa transformar este processo em mais uma cobrança.','Por agora, basta permitir que o cuidado também chegue até você.']}
  };
  return journeyDays ? applyConfirmedJourney(narrative, journeyDays) : narrative;
}
