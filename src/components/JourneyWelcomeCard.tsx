import { Heart, Headphones, PauseCircle, Sparkles } from 'lucide-react';

interface JourneyWelcomeCardProps {
  firstName?: string;
}

export function JourneyWelcomeCard({ firstName }: JourneyWelcomeCardProps) {
  const greeting = firstName ? `${firstName}, seu áudio personalizado está pronto.` : 'Seu áudio personalizado está pronto.';

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#d5b45e] bg-[linear-gradient(145deg,#fffaf0_0%,#f8efd7_58%,#f1e3bd_100%)] shadow-xl shadow-[#173c2c]/10">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
        <div className="p-7 sm:p-9">
          <div className="flex items-center gap-2 text-[#9a7627]">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[.18em]">Sua jornada pode começar</span>
          </div>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#173c2c]">{greeting}</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#586a5f]">
            Parabéns por chegar até aqui. Este cuidado foi organizado a partir do que você compartilhou na sua anamnese. Não há nada que você precise forçar, provar ou sentir de um jeito específico.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Guidance icon={<Headphones className="h-5 w-5" />} title="Antes de ouvir">
              Escolha um lugar tranquilo, sente-se ou deite-se confortavelmente e evite ouvir dirigindo ou realizando atividades que exijam atenção.
            </Guidance>
            <Guidance icon={<Heart className="h-5 w-5" />} title="Durante a prática">
              Respire naturalmente e permita que a experiência aconteça no seu ritmo. Se precisar, pause. Você não precisa chegar ao fim de uma vez.
            </Guidance>
          </div>
        </div>

        <div className="border-t border-[#dcc68d] bg-[#173c2c] p-7 text-[#fff8e7] sm:p-9 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 text-[#f0cc72]"><PauseCircle className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[.16em]">Sobre catarses e reações</span></div>
          <p className="mt-4 leading-7 text-[#f6efd9]">
            Algumas pessoas podem perceber emoções mais intensas, vontade de chorar, bocejos, sonolência, lembranças, sonhos mais vívidos ou necessidade de silêncio. Você pode chamar isso de catarse dentro da sua experiência, mas não é necessário que aconteça para a prática ter valor.
          </p>
          <p className="mt-4 leading-7 text-[#dce5dd]">
            Se algo ficar desconfortável, abra os olhos, respire, movimente mãos e pés, beba água e faça uma pausa. Retome somente quando se sentir bem para continuar.
          </p>
          <p className="mt-4 border-t border-[#ffffff26] pt-4 text-sm leading-6 text-[#cbd7ce]">
            Reações muito intensas, persistentes ou que tragam risco à sua segurança não devem ser tratadas apenas como “catarse”. Interrompa a prática e procure apoio profissional adequado.
          </p>
          <p className="mt-5 font-serif text-xl italic text-[#f2d586]">Depois, fique alguns minutos em silêncio. O próximo passo pode vir devagar.</p>
        </div>
      </div>
    </section>
  );
}

function Guidance({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#dfcfaa] bg-white/55 p-4">
      <div className="flex items-center gap-2 text-[#8f6d28]">{icon}<h3 className="font-semibold text-[#365441]">{title}</h3></div>
      <p className="mt-2 text-sm leading-6 text-[#667369]">{children}</p>
    </div>
  );
}
