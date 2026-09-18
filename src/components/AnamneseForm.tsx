import React, { useState, useEffect } from 'react';
import { AnamneseInput } from '../types';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { REGIOES_CORPORAIS } from '../data/regioesCorporais';
import { CASOS_DE_TESTE, CasoTeste } from '../data/sampleCases';
import {
  Sparkles,
  User,
  Heart,
  Brain,
  Zap,
  Shield,
  HelpCircle,
  RotateCcw,
  Play,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AnamneseFormProps {
  initialData?: AnamneseInput;
  onSubmit: (data: AnamneseInput) => void;
  onCarregarCaso: (caso: CasoTeste) => void;
  onLimparFormulario?: () => void;
}

const VALORES_ESCALA = [
  { valor: 0, label: '0 — Ausência', desc: 'Não sinto ou não acontece' },
  { valor: 1, label: '1 — Leve', desc: 'Presença sutil esporádica' },
  { valor: 2, label: '2 — Moderada', desc: 'Presente com regularidade' },
  { valor: 3, label: '3 — Forte', desc: 'Intenso, chama atenção' },
  { valor: 4, label: '4 — Muito forte', desc: 'Crítico ou paralisante' },
];

export function AnamneseForm({
  initialData,
  onSubmit,
  onCarregarCaso,
  onLimparFormulario,
}: AnamneseFormProps) {
  const [formData, setFormData] = useState<AnamneseInput>(
    initialData || {
      id: `ANAM-${Date.now().toString().slice(-6)}`,
      data: new Date().toISOString().split('T')[0],
      nomePessoa: '',
      idade: '',
      contato: '',
      historicoEnergetico: '',
      intencaoDeclarada: '',
      respostasObjetivas: {},
      relatoLivreNecessidade: '',
      relatoLivreDesafios: '',
      relatoLivrePreservado: '',
      regioesCorporaisPercebidas: [],
      preferenciasAtendimento: '',
      sensibilidadeEnergetica: 'moderada',
    }
  );

  const [secaoAtiva, setSecaoAtiva] = useState<'dados' | 'perguntas' | 'relato' | 'corpo'>('perguntas');
  const [mostrarCasosExemplo, setMostrarCasosExemplo] = useState(false);

  // Sincroniza sempre que initialData mudar externamente
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Atualizar campo genérico
  const handleFieldChange = (field: keyof AnamneseInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Atualizar resposta da pergunta objetiva
  const handleRespostaChange = (perguntaId: string, valor: number) => {
    setFormData((prev) => ({
      ...prev,
      respostasObjetivas: {
        ...prev.respostasObjetivas,
        [perguntaId]: valor,
      },
    }));
  };

  // Atalho: Marcar todas as 20 perguntas como 0 (Ausência / Base Neutra)
  const handleZerarPerguntas = () => {
    const zeros: Record<string, number> = {};
    PERGUNTAS_ANAMNESE.forEach((p) => {
      zeros[p.id] = 0;
    });
    setFormData((prev) => ({
      ...prev,
      respostasObjetivas: zeros,
    }));
  };

  // Limpar formulário inteiro
  const handleLimparTudo = () => {
    if (onLimparFormulario) {
      onLimparFormulario();
    } else {
      setFormData({
        id: `ANAM-${Date.now().toString().slice(-6)}`,
        data: new Date().toISOString().split('T')[0],
        nomePessoa: '',
        idade: '',
        contato: '',
        historicoEnergetico: '',
        intencaoDeclarada: '',
        respostasObjetivas: {},
        relatoLivreNecessidade: '',
        relatoLivreDesafios: '',
        relatoLivrePreservado: '',
        regioesCorporaisPercebidas: [],
        preferenciasAtendimento: '',
        sensibilidadeEnergetica: 'moderada',
      });
    }
  };

  // Alternar região corporal selecionada
  const toggleRegiaoCorporal = (regiaoId: string) => {
    setFormData((prev) => {
      const existe = prev.regioesCorporaisPercebidas.includes(regiaoId);
      return {
        ...prev,
        regioesCorporaisPercebidas: existe
          ? prev.regioesCorporaisPercebidas.filter((id) => id !== regiaoId)
          : [...prev.regioesCorporaisPercebidas, regiaoId],
      };
    });
  };

  // Quantidade de perguntas respondidas
  const totalPerguntas = PERGUNTAS_ANAMNESE.length;
  const respondidasCount = Object.keys(formData.respostasObjetivas).length;
  const progressoPercentual = Math.round((respondidasCount / totalPerguntas) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dadosFinais = {
      ...formData,
      nomePessoa: formData.nomePessoa.trim() || 'Interagente em Atendimento',
    };
    onSubmit(dadosFinais);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Cabeçalho do Questionário Limpo */}
      <div className="mb-6 bg-stone-900/90 border border-stone-800/90 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {respondidasCount === 0 ? 'Questionário Limpo' : `${respondidasCount}/${totalPerguntas} Respondidas`}
              </span>
              <span className="text-xs text-stone-400">
                Data: {formData.data || new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100 mt-1">
              Questionário de Anamnese Integrativa
            </h1>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              Mapeamento dos 20 eixos funcionais, percepção somática e escuta profunda para cruzamento direto com a Biblioteca-Mestra, preparada para incorporar todos os cursos e sistemas validados.
            </p>
          </div>

          {/* Ações Rápidas do Topo */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-form-limpar"
              onClick={handleLimparTudo}
              className="px-3 py-2 rounded-xl text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700/80 border border-stone-700 transition-colors flex items-center gap-1.5"
              title="Limpar todos os campos e recomeçar do zero"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Limpar Questionário</span>
            </button>

            <button
              type="button"
              id="btn-toggle-casos-exemplo"
              onClick={() => setMostrarCasosExemplo(!mostrarCasosExemplo)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-amber-400/90 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{mostrarCasosExemplo ? 'Ocultar Casos Exemplo' : 'Carregar Caso Exemplo'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${mostrarCasosExemplo ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Gaveta Recolhível de Casos Exemplo (Não invade o questionário limpo) */}
        {mostrarCasosExemplo && (
          <div className="mt-4 pt-4 border-t border-stone-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400 mb-2.5">
              <span>Se desejar testar a análise automaticamente com dados pré-configurados:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {CASOS_DE_TESTE.map((caso) => (
                <button
                  key={caso.id}
                  type="button"
                  id={`btn-load-${caso.id}`}
                  onClick={() => {
                    setFormData(caso.dados);
                    onCarregarCaso(caso);
                  }}
                  className="p-3 rounded-xl text-left bg-stone-950/70 hover:bg-stone-950 border border-stone-800 hover:border-amber-500/40 transition-all text-xs group"
                >
                  <div className="font-semibold text-stone-200 group-hover:text-amber-300 flex items-center justify-between gap-1">
                    <span>{caso.titulo.split(':')[0]}</span>
                    <Play className="w-3 h-3 text-amber-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">
                    {caso.titulo.split(':')[1]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Abas de Navegação do Questionário */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-stone-800 pb-3">
          <button
            type="button"
            onClick={() => setSecaoAtiva('dados')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center sm:justify-start gap-2 ${
              secaoAtiva === 'dados'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Dados</span>
          </button>

          <button
            type="button"
            onClick={() => setSecaoAtiva('perguntas')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center sm:justify-start gap-2 ${
              secaoAtiva === 'perguntas'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Brain className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Os 20 Eixos</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                secaoAtiva === 'perguntas' ? 'bg-stone-950 text-amber-400' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {respondidasCount}/{totalPerguntas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSecaoAtiva('relato')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center sm:justify-start gap-2 ${
              secaoAtiva === 'relato'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Relato Livre</span>
          </button>

          <button
            type="button"
            onClick={() => setSecaoAtiva('corpo')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center sm:justify-start gap-2 ${
              secaoAtiva === 'corpo'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span className="truncate">4. Corpo</span>
            {formData.regioesCorporaisPercebidas.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  secaoAtiva === 'corpo' ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {formData.regioesCorporaisPercebidas.length}
              </span>
            )}
          </button>
        </div>

        {/* SEÇÃO 1: DADOS DA PESSOA */}
        {secaoAtiva === 'dados' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
            <div className="border-b border-stone-800 pb-4">
              <h3 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                <span>Identificação & Histórico Energético</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Informações para contextualização do atendimento integrativo e personalização do tom.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Nome Completo ou Preferencial *
                </label>
                <input
                  type="text"
                  id="input-nome-pessoa"
                  value={formData.nomePessoa}
                  onChange={(e) => handleFieldChange('nomePessoa', e.target.value)}
                  placeholder="Ex: Mariana Silveira"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Idade / Fase de Vida (opcional)
                </label>
                <input
                  type="text"
                  id="input-idade"
                  value={formData.idade || ''}
                  onChange={(e) => handleFieldChange('idade', e.target.value)}
                  placeholder="Ex: 34 anos"
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Intenção Declarada pela Própria Pessoa
              </label>
              <input
                type="text"
                id="input-intencao"
                value={formData.intencaoDeclarada}
                onChange={(e) => handleFieldChange('intencaoDeclarada', e.target.value)}
                placeholder="Ex: Quero diminuir a ansiedade e destravar meus projetos com clareza."
                className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Esta frase guiará a intenção personalizada no Resultado da Pessoa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Histórico Prévio com Práticas Energéticas
                </label>
                <textarea
                  id="input-historico"
                  rows={2}
                  value={formData.historicoEnergetico || ''}
                  onChange={(e) => handleFieldChange('historicoEnergetico', e.target.value)}
                  placeholder="Ex: Já fez Reiki há alguns anos; medita ocasionalmente..."
                  className="w-full px-3.5 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Sensibilidade Energética / Campo Sutil
                </label>
                <select
                  id="select-sensibilidade"
                  value={formData.sensibilidadeEnergetica || 'moderada'}
                  onChange={(e) => handleFieldChange('sensibilidadeEnergetica', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="baixa">Baixa (pouca percepção somática ou sutil)</option>
                  <option value="moderada">Moderada (percebe calor ou relaxamento gradual)</option>
                  <option value="alta">Alta (percepção nítida de correntes e calor)</option>
                  <option value="muito_alta">Muito Alta (hiper-reativo a estímulos e ambientes)</option>
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Pessoas com sensibilidade muito alta acionam prioridade para estabilização neutra.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setSecaoAtiva('perguntas')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                <span>Avançar para os 20 Eixos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SEÇÃO 2: QUESTIONÁRIO OBJETIVO DOS 20 EIXOS */}
        {secaoAtiva === 'perguntas' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-amber-400" />
                    <span>Questionário Objetivo com Ponderação Matricial</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Cada pergunta alimenta múltiplos eixos simultaneamente conforme matriz registrada. Escala de 0 a 4.
                  </p>
                </div>
                <div className="flex flex-wrap items-center sm:items-end gap-3">
                  <button
                    type="button"
                    id="btn-zerar-todas-perguntas"
                    onClick={handleZerarPerguntas}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 border border-stone-700 transition-colors flex items-center gap-1.5"
                    title="Definir todas as 20 perguntas como 0 (Ausência / Neutro)"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Marcar todas como 0 (Neutro)</span>
                  </button>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-amber-400">
                      {progressoPercentual}% preenchido
                    </div>
                    <div className="w-28 h-2 bg-stone-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${progressoPercentual}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-stone-800 mt-4">
                {PERGUNTAS_ANAMNESE.map((pergunta, idx) => {
                  const valorAtual = formData.respostasObjetivas[pergunta.id] ?? -1;

                  return (
                    <div key={pergunta.id} className="py-5 first:pt-2 last:pb-2">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                              #{idx + 1}
                            </span>
                            <span className="text-xs uppercase tracking-wider text-amber-400/80 font-medium">
                              {pergunta.categoria}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-stone-100">{pergunta.texto}</p>
                          {pergunta.dicaAcolhedora && (
                            <p className="text-xs text-stone-400 italic">
                              {pergunta.dicaAcolhedora}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Escala de 0 a 4 */}
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2">
                        {VALORES_ESCALA.map((escala) => {
                          const selecionado = valorAtual === escala.valor;
                          return (
                            <button
                              key={escala.valor}
                              type="button"
                              id={`btn-q-${pergunta.id}-${escala.valor}`}
                              onClick={() => handleRespostaChange(pergunta.id, escala.valor)}
                              className={`p-2.5 rounded-xl text-center border transition-all ${
                                selecionado
                                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm scale-[1.02]'
                                  : 'bg-stone-800/70 text-stone-300 border-stone-700 hover:bg-stone-800 hover:border-stone-600'
                              }`}
                            >
                              <div className="text-sm sm:text-base font-bold">{escala.valor}</div>
                              <div
                                className={`text-[10px] hidden sm:block truncate ${
                                  selecionado ? 'text-stone-900 font-semibold' : 'text-stone-400'
                                }`}
                              >
                                {escala.label.split('—')[1]}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navegação ao final da Seção 2 */}
              <div className="flex items-center justify-between pt-6 mt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setSecaoAtiva('dados')}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-medium transition-colors"
                >
                  ← Voltar para Dados
                </button>
                <button
                  type="button"
                  onClick={() => setSecaoAtiva('relato')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
                >
                  <span>Avançar para Relato Livre</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 3: RELATO LIVRE & RESPOSTAS ABERTAS */}
        {secaoAtiva === 'relato' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
            <div className="border-b border-stone-800 pb-4">
              <h3 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-400" />
                <span>Análise Qualitativa do Relato Livre (Regra 9)</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                As respostas abertas possuem peso qualitativo alto: analisam palavras recorrentes, emoções espontâneas, conflitos e fatores de preservação.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                1. O que você sente que mais precisa e gostaria de transformar neste momento?
              </label>
              <textarea
                id="textarea-necessidade"
                rows={3}
                value={formData.relatoLivreNecessidade}
                onChange={(e) => handleFieldChange('relatoLivreNecessidade', e.target.value)}
                placeholder="Descreva com suas próprias palavras o que seu coração ou seu corpo pedem..."
                className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                2. Quais conflitos, repetições, medos ou travas têm chamado sua atenção recentemente?
              </label>
              <textarea
                id="textarea-desafios"
                rows={3}
                value={formData.relatoLivreDesafios}
                onChange={(e) => handleFieldChange('relatoLivreDesafios', e.target.value)}
                placeholder="Ex: aperto no peito ao decidir, medo de julgamento, dificuldade de descansar sem culpa..."
                className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                3. O que você sente que ainda está vivo, preservado, forte ou saudável em você?
              </label>
              <textarea
                id="textarea-preservado"
                rows={3}
                value={formData.relatoLivrePreservado}
                onChange={(e) => handleFieldChange('relatoLivrePreservado', e.target.value)}
                placeholder="Ex: Minha criatividade continua viva; tenho vontade sincera de aprender e cuidar de mim..."
                className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Fator de proteção crucial para ancoragem de recursos de expansão e esperança.
              </p>
            </div>

            {/* Navegação ao final da Seção 3 */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setSecaoAtiva('perguntas')}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-medium transition-colors"
              >
                ← Voltar para os 20 Eixos
              </button>
              <button
                type="button"
                onClick={() => setSecaoAtiva('corpo')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                <span>Avançar para Percepção Corporal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SEÇÃO 4: PERCEPÇÃO CORPORAL */}
        {secaoAtiva === 'corpo' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
            <div className="border-b border-stone-800 pb-4">
              <h3 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Percepção Corporal & Centros Sutis (Regra 10)</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                A localização corporal é dado complementar para orientar chakras, cristais e sequência de imposição. Não é diagnóstico médico de doença.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REGIOES_CORPORAIS.map((regiao) => {
                const selecionada = formData.regioesCorporaisPercebidas.includes(regiao.id);

                return (
                  <button
                    key={regiao.id}
                    type="button"
                    id={`btn-regiao-${regiao.id}`}
                    onClick={() => toggleRegiaoCorporal(regiao.id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      selecionada
                        ? 'bg-amber-500/15 border-amber-500/60 text-stone-100 shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-stone-100 flex items-center gap-2">
                        {regiao.nome}
                      </span>
                      {selecionada ? (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-stone-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mb-2">{regiao.descricao}</p>
                    <div className="flex flex-wrap gap-1">
                      {regiao.chakrasCorrespondentes.map((chakra) => (
                        <span
                          key={chakra}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900/80 text-amber-300/80 border border-stone-700"
                        >
                          {chakra}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navegação ao final da Seção 4 */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setSecaoAtiva('relato')}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-medium transition-colors"
              >
                ← Voltar para Relato Livre
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Cruzar com a Biblioteca-Mestra</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-800">
          <div className="text-xs text-stone-400">
            {formData.nomePessoa
              ? `Interagente: ${formData.nomePessoa}`
              : 'Preencha os dados e responda o questionário'}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              id="btn-reset-form"
              onClick={handleLimparTudo}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpar Formulário</span>
            </button>

            <button
              type="submit"
              id="btn-executar-analise"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cruzar com a Biblioteca-Mestra</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
