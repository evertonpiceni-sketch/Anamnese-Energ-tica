import { FullReportApprovedView } from './FullReportApprovedView';
import { BasicReadingApprovedView } from './BasicReadingApprovedView';
import { useEffect, useMemo, useState } from 'react';
import { Flower2, Gem, Headphones, History, Leaf, RefreshCcw, Sparkles, Waves } from 'lucide-react';
import { ProgrammedAudioCard } from './ProgrammedAudioCard';
import { PreparatoryAudioCard } from './PreparatoryAudioCard';
import { JourneyWelcomeCard } from './JourneyWelcomeCard';
import { PracticeHistory } from './PracticeHistory';
import { EntitledFullReportCard } from './EntitledFullReportCard';
import { canAccessFullReport } from '../commercial/entitlements';
import { loadUserMoment, UserMomentData } from '../services/userMomentBackend';

interface UserMomentAreaProps { mode: 'momento' | 'jornada'; onStartNewIntake: () => void; }

export function UserMomentArea({ mode, onStartNewIntake }: UserMomentAreaProps) {
  const [data,setData]=useState<UserMomentData|null>(null); const[loading,setLoading]=useState(true); const[message,setMessage]=useState('');
  async function refresh(){setLoading(true);setMessage('');try{setData(await loadUserMoment())}catch(error){setMessage(error instanceof Error?error.message:'Não foi possível carregar seu cuidado agora.')}finally{setLoading(false)}}
  useEffect(()=>{void refresh()},[]);
  const firstName=useMemo(()=>data?.intake?.personName?.trim().split(/\s+/)[0]||'',[data?.intake?.personName]);
  if(loading)return <StateBox>Carregando seu espaço de cuidado...</StateBox>;
  if(message)return <StateBox><p>{message}</p><button onClick={()=>void refresh()} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#173f2d] px-5 py-3 font-semibold text-white"><RefreshCcw className="h-4 w-4"/>Tentar novamente</button></StateBox>;
  if(!data?.intake)return <StateBox><Sparkles className="mx-auto h-8 w-8 text-[#b89546]"/><h2 className="mt-4 font-serif text-3xl">Seu espaço começa pela anamnese.</h2><p className="mt-3 leading-7 text-[#627067]">Quando você concluir sua primeira anamnese, sua leitura e o acompanhamento liberado aparecerão aqui.</p><button onClick={onStartNewIntake} className="mt-6 rounded-full bg-[#173f2d] px-6 py-3 font-semibold text-white">Iniciar minha anamnese</button><div className="mt-7 text-left"><PreparatoryAudioCard/></div></StateBox>;

  const exclusiveAudioPublished=data.carePlan?.audioStatus==='published'&&Boolean(data.audio);
  if(mode==='momento')return <div className="mx-auto max-w-5xl space-y-7">
    {!canAccessFullReport(data.entitlement) && <section className="relative overflow-hidden border-y border-[#d7c69d] bg-[#fffaf0]/65 px-5 py-8 sm:px-9"><div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-[#c6a350]/20"/><div className="relative"><div className="text-xs font-semibold tracking-[.2em] text-[#a18443]">MEU MOMENTO</div><h1 className="mt-3 font-serif text-4xl text-[#173c2c]">{firstName?`${firstName}, sua leitura fica reunida aqui.`:'Sua leitura fica reunida aqui.'}</h1><p className="mt-4 max-w-3xl leading-7 text-[#5c6d62]">Aqui você encontra sua leitura e o cuidado preparado a partir do que compartilhou.</p>{data.entitlement&&<EntitlementBadge days={data.entitlement.days}/>}</div></section>}
    <>{!canAccessFullReport(data.entitlement) && <BasicReadingApprovedView data={data}/>}</>
    {data.entitlement?<EntitledFullReportCard intakeId={data.intake.id} entitlement={data.entitlement}/>:<section className="border-l border-[#c6a350] bg-[#fffaf0]/45 px-6 py-5 text-sm leading-7 text-[#715f36]">Sua anamnese está registrada. O relatório completo e os recursos do percurso permanecem protegidos até existir um acesso comercial confirmado.</section>}
    {!exclusiveAudioPublished && <PreparatoryAudioCard/>}
    {!data.entitlement && <button onClick={onStartNewIntake} className="rounded-full border border-[#cdbc91] bg-white/60 px-5 py-3 font-semibold text-[#53675b]">Nova anamnese</button>}
  </div>;

  if(!data.entitlement)return <StateBox><div className="text-xs font-semibold tracking-[.18em] text-[#a18443]">MINHA JORNADA</div><h1 className="mt-3 font-serif text-3xl">{firstName?`${firstName}, sua jornada ainda não foi liberada.`:'Sua jornada ainda não foi liberada.'}</h1><p className="mt-4 leading-7 text-[#5c6d62]">Sua anamnese está registrada, mas ainda não há um percurso confirmado para esta etapa.</p><div className="mt-7 text-left"><PreparatoryAudioCard/></div></StateBox>;

  return <div className="mx-auto max-w-5xl space-y-7">
    <section className="relative overflow-hidden border-y border-[#d7c69d] bg-[#fffaf0]/65 px-5 py-8 sm:px-9"><div className="text-xs font-semibold tracking-[.2em] text-[#a18443]">MINHA JORNADA</div><EntitlementBadge days={data.entitlement.days}/><h1 className="mt-3 font-serif text-4xl text-[#173c2c]">{firstName?`${firstName}, este é o seu cuidado atual.`:'Este é o seu cuidado atual.'}</h1><p className="mt-3 max-w-3xl leading-7 text-[#5c6d62]">Aqui aparecem somente recursos efetivamente liberados para o seu momento e o seu histórico de práticas.</p></section>
    {exclusiveAudioPublished&&data.audio?<><JourneyWelcomeCard firstName={firstName}/><ProgrammedAudioCard audio={data.audio}/></>:<><section className="border-l border-[#c6a350] bg-[#fffaf0]/45 px-6 py-5 text-sm leading-7 text-[#715f36]">Seu material personalizado ainda está em preparação. Sua programação energética já está disponível abaixo. O arquivo de áudio aparecerá quando estiver pronto.</section><PreparatoryAudioCard/></>}
    {data.carePlan && !data.automaticReport?<section className="border-y border-[#d8c99f] bg-white/35 py-7"><h2 className="mb-6 font-serif text-3xl text-[#173c2c]">Recursos publicados para este momento</h2><div className="grid gap-x-10 gap-y-6 md:grid-cols-2"><JourneyResource icon={<Waves className="h-5 w-5"/>} title="Frequência da sessão" value={data.carePlan.solfeggio?.hz?`${data.carePlan.solfeggio.hz} Hz${data.carePlan.solfeggio.chakraProjeto?` · ${data.carePlan.solfeggio.chakraProjeto}`:''}`:'Sem frequência publicada neste momento'}/><JourneyResource icon={<Flower2 className="h-5 w-5"/>} title="Floral" value={names(data.carePlan.floral,'Nenhum floral publicado neste momento')}/><JourneyResource icon={<Leaf className="h-5 w-5"/>} title="Aromaterapia" value={names(data.carePlan.aromatherapy,'Nenhum recurso publicado neste momento')}/><JourneyResource icon={<Gem className="h-5 w-5"/>} title="Cristais etéricos" value={names(data.carePlan.ethericCrystals,'Nenhum cristal publicado neste momento')}/></div></section>:null}
    {data.automaticReport && <FullReportApprovedView report={data.automaticReport}/>}
    <section><div className="mb-4 flex items-center gap-2 text-[#365441]"><History className="h-5 w-5 text-[#a18443]"/><h2 className="font-serif text-2xl">Histórico</h2></div><PracticeHistory/></section>
    <section className="border-t border-[#d8c99f] pt-6"><div className="flex items-start gap-3"><Headphones className="mt-1 h-5 w-5 text-[#a18443]"/><div><h2 className="font-serif text-2xl text-[#365441]">Reavaliação</h2><p className="mt-2 text-sm leading-6 text-[#677268]">A reavaliação registra o que mudou, o que permaneceu e o que precisa de um novo cuidado.</p></div></div></section>
  </div>;
}

function StateBox({children}:{children:React.ReactNode}){return <div className="mx-auto max-w-3xl border-y border-[#d8c99f] bg-[#fffaf0]/70 p-8 text-center text-[#52665b]">{children}</div>}
function EntitlementBadge({days}:{days:7|21}){return <div className="mt-4 inline-flex rounded-full border border-[#d4c28e] bg-[#f7efd9] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.12em] text-[#856e37]">Percurso de {days} dias confirmado</div>}
function names(items:any[],empty:string){const values=items.map(item=>typeof item==='string'?item:item?.nome).filter(Boolean);return values.length?values.join(', '):empty}
function JourneyResource({icon,title,value}:{icon:React.ReactNode;title:string;value:string}){return <div className="grid grid-cols-[28px_1fr] gap-3 border-b border-[#e0d5bb] pb-5"><div className="text-[#a18443]">{icon}</div><div><div className="text-xs font-semibold uppercase tracking-[.14em] text-[#8d7743]">{title}</div><div className="mt-2 leading-7 text-[#50665a]">{value}</div></div></div>}
