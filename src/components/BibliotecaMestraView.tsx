import React, { useState } from 'react';
import { SistemaBiblioteca, StatusSistema } from '../types';
import {
  BookOpen,
  Search,
  Plus,
  ShieldCheck,
  FileCheck,
  Clock,
  Ban,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Link,
  Edit2,
  X,
} from 'lucide-react';

interface BibliotecaMestraViewProps {
  sistemas: SistemaBiblioteca[];
  onAtualizarSistemas: (sistemas: SistemaBiblioteca[]) => void;
}

const STATUS_CONFIG: Record<
  StatusSistema,
  { label: string; corBadge: string; icon: React.ComponentType<{ className?: string }>; desc: string }
> = {
  FORMAÇÃO_CONFIRMADA: {
    label: 'Formação Confirmada',
    corBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: ShieldCheck,
    desc: 'Documentação suficiente de que Everton recebeu formação, sintonização ou treinamento.',
  },
  MATERIAL_CONFIRMADO: {
    label: 'Material Confirmado',
    corBadge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: FileCheck,
    desc: 'Existe manual, apostila ou curso na biblioteca; validação final em arquivo.',
  },
  AGUARDANDO_VALIDACAO: {
    label: 'Aguardando Validação',
    corBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: Clock,
    desc: 'Encontrado, mas precisa de revisão documental antes do uso automático.',
  },
  NAO_UTILIZAR: {
    label: 'Não Utilizar',
    corBadge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: Ban,
    desc: 'Sistema ou versão expressamente descartada. NUNCA recomendado pelo motor.',
  },
};

export function BibliotecaMestraView({ sistemas, onAtualizarSistemas }: BibliotecaMestraViewProps) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [sistemaExpandidoId, setSistemaExpandidoId] = useState<string | null>(null);
  const [modalNovoSistemaAberto, setModalNovoSistemaAberto] = useState(false);

  // Formulário para novo sistema
  const [novoNome, setNovoNome] = useState('');
  const [novoCurso, setNovoCurso] = useState('');
  const [novaLinhagem, setNovaLinhagem] = useState('');
  const [novoStatus, setNovoStatus] = useState<StatusSistema>('MATERIAL_CONFIRMADO');
  const [novoObjetivo, setNovoObjetivo] = useState('');
  const [novosSimbolos, setNovosSimbolos] = useState('');
  const [novoDocId, setNovoDocId] = useState('');

  const sistemasFiltrados = sistemas.filter((sis) => {
    const matchStatus = filtroStatus === 'TODOS' || sis.status === filtroStatus;
    const termo = busca.toLowerCase();
    const matchBusca =
      !termo ||
      sis.nome.toLowerCase().includes(termo) ||
      sis.curso.toLowerCase().includes(termo) ||
      sis.simbolos.some((s) => s.toLowerCase().includes(termo)) ||
      sis.recursosInternos.some((r) => r.nome.toLowerCase().includes(termo)) ||
      sis.chakras.some((c) => c.toLowerCase().includes(termo));

    return matchStatus && matchBusca;
  });

  const toggleExpandir = (id: string) => {
    setSistemaExpandidoId((prev) => (prev === id ? null : id));
  };

  const handleMudarStatus = (sistemaId: string, novoStatus: StatusSistema) => {
    const atualizados = sistemas.map((s) => (s.id === sistemaId ? { ...s, status: novoStatus } : s));
    onAtualizarSistemas(atualizados);
  };

  const handleSalvarNovoSistema = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    const novo: SistemaBiblioteca = {
      id: `sis_${Date.now()}`,
      nome: novoNome,
      curso: novoCurso || 'Curso Registrado na Biblioteca',
      linhagem: novaLinhagem || 'Tradição Energética Registrada',
      nivel: 'Praticante / Mestre',
      modulos: ['Módulo 1: Fundamentos e Recursos'],
      simbolos: novosSimbolos ? novosSimbolos.split(',').map((s) => s.trim()) : [],
      energias: ['Frequência Vibracional do Sistema'],
      frequencias: ['Ressonância Sutil'],
      comandos: [],
      cristais: [],
      chakras: ['Alinhamento Geral dos Centros'],
      centrosEnergeticos: [],
      objetivos: novoObjetivo || 'Harmonização e ancoragem energética.',
      areasAtuacao: ['Equilíbrio global'],
      recursosInternos: [
        {
          nome: `${novoNome} (Recurso Padrão)`,
          tipo: 'energia',
          descricao: 'Ativação direta do fluxo vibracional do curso.',
          eixosCompatíveis: ['integracao', 'emocional'],
          fonteDocumental: novoDocId || 'DOC-REGISTRO-NOVO',
        },
      ],
      metodosAtivacao: ['Intenção consciente e conexão'],
      formasAplicacao: ['Presencial ou à distância'],
      sistemasCompativeis: ['Original Reiki Platinum'],
      sistemasComplementares: [],
      restricoes: [],
      cuidados: ['Respeitar a receptividade do interagente.'],
      origemDocumental: {
        idDocumento: novoDocId || `DOC-${Date.now().toString().slice(-6)}`,
        curso: novoCurso || 'Curso Registrado',
        statusConfirmacao: novoStatus === 'FORMAÇÃO_CONFIRMADA' ? 'Certificado auditado' : 'Aguardando revisão',
      },
      status: novoStatus,
      compatibilidadeEixos: {
        integracao: 3,
        emocional: 3,
        seguranca: 2,
      },
      prioridadePadrao: 6,
    };

    onAtualizarSistemas([...sistemas, novo]);
    setModalNovoSistemaAberto(false);
    setNovoNome('');
    setNovoCurso('');
    setNovaLinhagem('');
    setNovoObjetivo('');
    setNovosSimbolos('');
    setNovoDocId('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>Biblioteca-Mestra de Cursos & Sistemas (Regra 3 & 4)</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-100 mt-1">
            Repositório de Sistemas & Formações
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Cada recurso possui linhagem, símbolos, comandos, rastreabilidade documental e status interno. O motor nunca ignora nenhum sistema válido.
          </p>
        </div>

        <button
          onClick={() => setModalNovoSistemaAberto(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Sistema</span>
        </button>
      </div>

      {/* Controles de Busca e Filtro */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, curso, símbolo (ex: Shanti, Halu, Dai Koo Myo), chakra..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Abas de Status */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFiltroStatus('TODOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filtroStatus === 'TODOS'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
            }`}
          >
            Todos ({sistemas.length})
          </button>

          {(['FORMAÇÃO_CONFIRMADA', 'MATERIAL_CONFIRMADO', 'AGUARDANDO_VALIDACAO', 'NAO_UTILIZAR'] as StatusSistema[]).map(
            (st) => {
              const count = sistemas.filter((s) => s.status === st).length;
              const config = STATUS_CONFIG[st];

              return (
                <button
                  key={st}
                  onClick={() => setFiltroStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                    filtroStatus === st
                      ? 'bg-stone-800 border-amber-500 text-stone-100'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <config.icon className="w-3.5 h-3.5" />
                  <span>{config.label}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Lista de Sistemas */}
      <div className="space-y-4">
        {sistemasFiltrados.map((sistema) => {
          const statusConf = STATUS_CONFIG[sistema.status];
          const isExpandido = sistemaExpandidoId === sistema.id;

          return (
            <div
              key={sistema.id}
              className={`bg-stone-900 border rounded-2xl transition-all overflow-hidden ${
                sistema.status === 'NAO_UTILIZAR'
                  ? 'border-rose-950/40 opacity-70'
                  : isExpandido
                  ? 'border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                  : 'border-stone-800 hover:border-stone-700'
              }`}
            >
              {/* Header do Card */}
              <div
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                onClick={() => toggleExpandir(sistema.id)}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-stone-100">{sistema.nome}</h3>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusConf.corBadge}`}
                    >
                      <statusConf.icon className="w-3 h-3" />
                      <span>{statusConf.label}</span>
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        sistema.catalogacaoTecnica === 'COMPLETA'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : sistema.catalogacaoTecnica === 'PARCIAL'
                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                      title="Status da catalogação técnica documental"
                    >
                      Catálogo {sistema.catalogacaoTecnica || 'PENDENTE'}
                    </span>
                    {sistema.ehBaseSustentacao && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                        Sistema-Base Neutro
                      </span>
                    )}
                    {sistema.ehEstimulanteAtivo && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Estimulante Ativo
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-400">
                    <span className="text-stone-300 font-medium">{sistema.curso}</span> • Linhagem:{' '}
                    {sistema.linhagem}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right text-xs text-stone-400 hidden md:block">
                    <div>{sistema.recursosInternos.length} recursos internos</div>
                    <div className="text-[10px] font-mono text-stone-500">
                      {sistema.origemDocumental.idDocumento}
                    </div>
                  </div>

                  <div className="p-1 rounded-lg bg-stone-800 text-stone-400">
                    {isExpandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Conteúdo Expandido */}
              {isExpandido && (
                <div className="px-5 pb-6 pt-2 border-t border-stone-800/80 space-y-6 text-xs text-stone-300 bg-stone-900/50">
                  {/* Objetivos */}
                  <div>
                    <span className="font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Objetivos Descritos no Material
                    </span>
                    <p className="text-stone-200 leading-relaxed">{sistema.objetivos}</p>
                  </div>

                  {/* Recursos Internos (Regra 12) */}
                  <div className="space-y-2">
                    <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Recursos Internos Específicos (Regra 12)</span>
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {sistema.recursosInternos.map((rec, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/80 space-y-1"
                        >
                          <div className="flex items-center justify-between font-semibold text-stone-100">
                            <span>{rec.nome}</span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-stone-700 text-amber-300">
                              {rec.tipo}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-300">{rec.descricao}</p>
                          {rec.fonteDocumental && (
                            <div className="text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-700/50">
                              Fonte: {rec.fonteDocumental} {rec.pagina ? `• ${rec.pagina}` : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Símbolos, Frequências e Centros */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="font-bold text-stone-400 block mb-1">Símbolos</span>
                      <div className="flex flex-wrap gap-1">
                        {sistema.simbolos.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-stone-400 block mb-1">Chakras / Centros</span>
                      <div className="flex flex-wrap gap-1">
                        {sistema.chakras.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-stone-400 block mb-1">Cristais Compatíveis</span>
                      <div className="flex flex-wrap gap-1">
                        {sistema.cristais.map((cr) => (
                          <span
                            key={cr}
                            className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-300/80"
                          >
                            {cr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rastreabilidade Documental (Regra 23) */}
                  <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5" />
                      <span>Origem Documental & Auditoria (Regra 23)</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-stone-400">ID Documento: </span>
                        <span className="font-mono text-stone-200">
                          {sistema.origemDocumental.idDocumento}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400">Curso: </span>
                        <span className="text-stone-200">{sistema.origemDocumental.curso}</span>
                      </div>
                      <div>
                        <span className="text-stone-400">Status Validação: </span>
                        <span className="text-emerald-400 font-medium">
                          {sistema.origemDocumental.statusConfirmacao}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gestão do Status Interno */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-800">
                    <span className="text-stone-400">Alterar Status Interno deste Sistema:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(['FORMAÇÃO_CONFIRMADA', 'MATERIAL_CONFIRMADO', 'AGUARDANDO_VALIDACAO', 'NAO_UTILIZAR'] as StatusSistema[]).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleMudarStatus(sistema.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                              sistema.status === st
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            {STATUS_CONFIG[st].label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal para cadastrar novo sistema */}
      {modalNovoSistemaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Cadastrar Novo Sistema na Biblioteca-Mestra</span>
              </h3>
              <button
                onClick={() => setModalNovoSistemaAberto(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoSistema} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-300 mb-1">Nome do Sistema *</label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Gendai Reiki Ho, Seichim, Celtic Reiki..."
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-300 mb-1">Curso de Origem</label>
                  <input
                    type="text"
                    value={novoCurso}
                    onChange={(e) => setNovoCurso(e.target.value)}
                    placeholder="Ex: Mestrado Tradicional 2024"
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-300 mb-1">Status de Validação *</label>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value as StatusSistema)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="FORMAÇÃO_CONFIRMADA">FORMAÇÃO_CONFIRMADA</option>
                    <option value="MATERIAL_CONFIRMADO">MATERIAL_CONFIRMADO</option>
                    <option value="AGUARDANDO_VALIDACAO">AGUARDANDO_VALIDACAO</option>
                    <option value="NAO_UTILIZAR">NAO_UTILIZAR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-300 mb-1">
                  Símbolos Registrados (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={novosSimbolos}
                  onChange={(e) => setNovosSimbolos(e.target.value)}
                  placeholder="Ex: Cho Ku Rei, Sei He Ki (nunca inventar nomes!)"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Regra 22: Se não confirmado no material, marcar como INFORMAÇÃO NÃO CONFIRMADA.
                </p>
              </div>

              <div>
                <label className="block font-medium text-stone-300 mb-1">ID Documental / Fonte</label>
                <input
                  type="text"
                  value={novoDocId}
                  onChange={(e) => setNovoDocId(e.target.value)}
                  placeholder="Ex: DOC-GENDAI-2024-MANUAL"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-300 mb-1">Objetivo Geral</label>
                <textarea
                  rows={2}
                  value={novoObjetivo}
                  onChange={(e) => setNovoObjetivo(e.target.value)}
                  placeholder="Descreva o propósito principal documentado no curso..."
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalNovoSistemaAberto(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                >
                  Salvar Sistema na Biblioteca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
