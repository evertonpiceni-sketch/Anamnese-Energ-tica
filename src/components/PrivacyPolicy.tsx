import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-[#f6f1e6] px-5 py-10 text-[#173c2c]">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0] p-7 shadow-xl shadow-[#173f2d]/8 sm:p-10">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6f6039]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
        )}

        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-[#947b3d]" />
          <div>
            <div className="text-xs font-semibold tracking-[0.16em] text-[#a18443]">
              PRIVACIDADE E PROTEÇÃO DE DADOS
            </div>
            <h1 className="mt-1 font-serif text-3xl">Política de Privacidade — LGPD</h1>
          </div>
        </div>

        <p className="mt-6 leading-7 text-[#5f6e64]">
          Esta Política explica como os dados pessoais são tratados na Anamnese Integrativa e
          nas experiências vinculadas ao Protocolo da Transformação. O objetivo é usar apenas
          as informações necessárias para oferecer a experiência contratada, preservar a
          privacidade e permitir que cada pessoa compreenda e exerça seus direitos.
        </p>

        <PolicySection title="1. Quem controla os dados">
          <p>
            O controlador é o responsável pelo Protocolo da Transformação e pela Anamnese
            Integrativa, que define as finalidades e os meios essenciais do tratamento.
          </p>
          <p className="mt-2 font-semibold">
            Canal oficial para assuntos de privacidade: a definir antes da publicação comercial.
          </p>
        </PolicySection>

        <PolicySection title="2. Quais dados podem ser tratados">
          <p>Podemos tratar, conforme o uso do serviço:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>nome, e-mail e dados da conta;</li>
            <li>respostas fornecidas na anamnese e relatos livres;</li>
            <li>percepções emocionais, corporais, relacionais e espirituais informadas pela própria pessoa;</li>
            <li>dados necessários para pagamento e confirmação da modalidade contratada;</li>
            <li>histórico de práticas, reavaliações e materiais disponibilizados;</li>
            <li>registros técnicos de acesso, segurança e funcionamento do aplicativo.</li>
          </ul>
          <p className="mt-3">
            Algumas respostas podem revelar dados pessoais sensíveis. Por isso, o aplicativo
            adota consentimento destacado e controles de acesso específicos para a anamnese.
          </p>
        </PolicySection>

        <PolicySection title="3. Para que os dados são usados">
          <ul className="list-disc space-y-1 pl-6">
            <li>criar e manter a conta do usuário;</li>
            <li>receber e armazenar a anamnese;</li>
            <li>organizar a leitura e a composição individual do cuidado;</li>
            <li>preparar, revisar e disponibilizar áudios, meditações e demais recursos contratados;</li>
            <li>registrar práticas, acompanhamento e reavaliações;</li>
            <li>processar pagamento e cumprir obrigações administrativas e legais;</li>
            <li>proteger contas, arquivos e infraestrutura contra uso indevido;</li>
            <li>atender solicitações relacionadas aos direitos de privacidade.</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. Dados sensíveis e consentimento">
          <p>
            Quando a experiência exigir tratamento de informações sensíveis fornecidas na
            anamnese, o consentimento será solicitado de forma específica e destacada para as
            finalidades informadas. A pessoa poderá deixar de fornecer informações opcionais.
          </p>
          <p className="mt-2">
            A revogação do consentimento não invalida tratamentos realizados licitamente antes
            da revogação e poderá impactar funcionalidades que dependam daqueles dados.
          </p>
        </PolicySection>

        <PolicySection title="5. Compartilhamento e operadores">
          <p>
            Os dados podem ser processados por fornecedores necessários ao funcionamento do
            serviço, como infraestrutura em nuvem, autenticação, armazenamento, pagamentos,
            envio de e-mail e, quando ativados, provedores utilizados na produção dos áudios.
          </p>
          <p className="mt-2">
            Esses fornecedores devem receber somente os dados necessários à respectiva função.
            Não vendemos dados pessoais.
          </p>
        </PolicySection>

        <PolicySection title="6. Decisões e análises automatizadas">
          <p>
            O sistema pode organizar respostas e sugerir caminhos internos para apoiar a
            composição do cuidado. A aprovação final da composição individual permanece sujeita
            à revisão administrativa prevista no protocolo. O usuário pode solicitar informações
            sobre o tratamento automatizado de seus dados nos limites da legislação aplicável.
          </p>
        </PolicySection>

        <PolicySection title="7. Armazenamento e segurança">
          <p>
            Os dados de conta, anamnese, resultados e práticas são mantidos em infraestrutura
            protegida por autenticação e regras de acesso. Arquivos personalizados são mantidos
            em armazenamento privado e acessados conforme as permissões da conta.
          </p>
          <p className="mt-2">
            Nenhum sistema é totalmente imune a incidentes. Medidas técnicas e administrativas
            devem ser continuamente revisadas para reduzir riscos de acesso, alteração,
            divulgação ou perda indevida.
          </p>
        </PolicySection>

        <PolicySection title="8. Por quanto tempo os dados são mantidos">
          <p>
            Os dados devem ser mantidos apenas pelo período necessário às finalidades descritas,
            ao acompanhamento contratado e ao cumprimento de obrigações legais ou exercício
            regular de direitos. Quando não houver mais fundamento para conservação, deverão
            ser eliminados ou anonimizados, conforme aplicável.
          </p>
        </PolicySection>

        <PolicySection title="9. Direitos do titular">
          <p>Nos termos da LGPD, a pessoa pode solicitar, conforme aplicável:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>confirmação da existência de tratamento;</li>
            <li>acesso aos dados;</li>
            <li>correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>informações sobre compartilhamentos;</li>
            <li>anonimização, bloqueio ou eliminação quando cabível;</li>
            <li>portabilidade, quando aplicável e regulamentada;</li>
            <li>revogação do consentimento;</li>
            <li>eliminação de dados tratados com base no consentimento, ressalvadas hipóteses legais de conservação;</li>
            <li>informações sobre a possibilidade de não consentir e suas consequências;</li>
            <li>revisão e informações sobre decisões baseadas exclusivamente em tratamento automatizado, quando aplicável.</li>
          </ul>
        </PolicySection>

        <PolicySection title="10. Solicitações de privacidade">
          <p>
            Antes da publicação comercial, o aplicativo deverá exibir neste documento e na área
            da conta o canal oficial para solicitações de acesso, correção, revogação,
            eliminação e demais direitos previstos na LGPD.
          </p>
        </PolicySection>

        <PolicySection title="11. Crianças e adolescentes">
          <p>
            A versão atual do serviço não deve ser ofertada a crianças sem uma definição
            específica de fluxo, base legal e mecanismos adequados de autorização e proteção.
          </p>
        </PolicySection>

        <PolicySection title="12. Atualizações">
          <p>
            Esta política poderá ser atualizada quando houver mudança relevante na experiência,
            nos fornecedores, nas finalidades ou nas exigências legais. Alterações materiais
            devem ser comunicadas de forma clara.
          </p>
        </PolicySection>

        <div className="mt-8 rounded-2xl border border-[#ddcfaa] bg-[#f7f0df] p-5 text-sm leading-6 text-[#647168]">
          Versão inicial da Política de Privacidade. A publicação comercial depende da definição
          do canal oficial de privacidade e da revisão final dos fornecedores efetivamente usados.
        </div>
      </article>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-2xl text-[#244b38]">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-[#5f6e64]">{children}</div>
    </section>
  );
}
