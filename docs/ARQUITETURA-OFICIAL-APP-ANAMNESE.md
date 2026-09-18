# Arquitetura Oficial — App de Anamnese Integrativa

## Status
**DIRETRIZ OFICIAL DE PRODUTO / BASE PARA IMPLEMENTAÇÃO**

Este documento define a arquitetura funcional do aplicativo de Anamnese Integrativa de Everton Piceni.

O app deve ser construído com separação rígida entre:

- **experiência do usuário**, acolhedora e simples;
- **painel ADM**, técnico e completo.

A experiência do usuário NÃO deve expor Biblioteca-Mestra, nomes de sistemas internos, pesos, scores, fórmulas, fontes documentais, lógica de decisão, símbolos ou qualquer outro dado técnico reservado ao ADM.

---

# 1. OBJETIVO DO APP

O aplicativo deve:

1. acolher o usuário;
2. conduzir a anamnese;
3. compreender o momento atual da pessoa;
4. identificar prioridades internas;
5. gerar um direcionamento adequado com base nos recursos disponíveis;
6. indicar um ou mais recursos, conforme necessário:
   - áudio exclusivo gerado para aquela anamnese;
   - tratamento/trilha;
   - floral;
   - aromaterapia;
   - cristais etéricos;
   - integração com o protocolo de 21 dias;
7. acompanhar a percepção do usuário;
8. reavaliar e adaptar o cuidado.

Regra central:

**“Do que esta pessoa precisa neste momento?”**

---

# 2. ESTRUTURA GERAL — ÁREA DO USUÁRIO

## Tela U01 — Abertura

### Objetivo
Receber o usuário com acolhimento e segurança.

### Conteúdo
- logo oficial aprovado;
- frase acolhedora;
- breve texto explicando que o processo foi criado para compreender o momento atual da pessoa;
- ambiente visual leve, profundo e elegante.

### Ações
- botão: **Começar meu cuidado**

### Regra visual
- verde profundo;
- dourado suave;
- natureza e luz;
- poucos elementos;
- nada técnico;
- logo oficial, discreto e integrado.

---

## Tela U02 — Como você está de verdade?

### Objetivo
Preparar emocionalmente o usuário para a anamnese.

### Conteúdo
Texto curto explicando:
- não existem respostas certas ou erradas;
- a pessoa pode responder no seu tempo;
- as respostas serão usadas para organizar uma experiência mais adequada ao momento atual.

### Ações
- botão: **Quero começar**
- botão secundário: **Voltar**

---

## Tela U03 — Identificação

### Objetivo
Coletar apenas os dados pessoais necessários à experiência.

### Campos possíveis
- nome;
- idade/faixa etária;
- contato, quando necessário;
- preferências básicas;
- consentimentos aplicáveis.

### Regra
Não coletar dados sem necessidade funcional.

---

## Tela U04 — Anamnese

### Objetivo
Conduzir as perguntas de forma leve e progressiva.

### Tipos de resposta
- escala;
- escolha única;
- múltipla escolha;
- texto curto;
- resposta aberta.

### Experiência
- uma pergunta ou pequeno bloco por vez;
- progresso visual discreto;
- salvar automaticamente;
- permitir continuar depois, se tecnicamente possível;
- linguagem humana;
- não exibir nome dos eixos internos.

### Dados internos possíveis
As respostas podem alimentar múltiplos eixos simultaneamente.

---

## Tela U05 — Relato livre

### Objetivo
Permitir que a pessoa conte algo que não apareceu nas perguntas.

### Texto sugerido
**“Existe algo que você gostaria que fosse acolhido e que ainda não conseguiu contar?”**

### Campo
Texto livre.

### Regra
O relato deve complementar a leitura interna e jamais ser convertido automaticamente em diagnóstico clínico.

---

## Tela U06 — Revisão

### Objetivo
Permitir ao usuário revisar suas respostas antes do envio.

### Conteúdo
- resumo simples por blocos;
- possibilidade de editar;
- confirmação final.

### Ações
- **Revisar**
- **Enviar minha anamnese**

---

## Tela U07 — Transição

### Objetivo
Fazer a passagem entre anamnese e direcionamento sem linguagem fria.

### Texto sugerido
**“Estamos organizando seu cuidado a partir do que você compartilhou.”**

### Visual
- movimento sutil de luz;
- natureza;
- sem números;
- sem “calculando score”.

---

## Tela U08 — Seu momento

### Objetivo
Apresentar a leitura humana do momento atual.

### Conteúdo
- mensagem acolhedora;
- 1 a 3 prioridades principais;
- texto sempre formulado como estado atual, nunca identidade fixa.

### Linguagem obrigatória
Usar:
- “Neste momento…”
- “Parece haver uma necessidade maior de…”
- “Seu cuidado pode começar por…”

Evitar:
- “Você é…”
- diagnósticos;
- rótulos;
- linguagem determinista.

---

## Tela U09 — Seu cuidado agora

### Objetivo
Mostrar a composição de cuidado recomendada.

### Blocos possíveis

#### Áudio exclusivo da sessão
- gerado individualmente para a pessoa;
- baseado nos sistemas e recursos selecionados naquela anamnese;
- nunca reutilizado automaticamente para outro usuário;
- título;
- intenção;
- duração;
- Solfeggio da sessão;
- botão **Ouvir agora**.

#### Floral
- nome da indicação ou composição;
- explicação simples;
- orientação de uso apenas quando previamente cadastrada.

#### Aromaterapia
- óleo ou combinação;
- objetivo do uso;
- forma de uso cadastrada;
- sem improvisar dose ou via de administração.

#### Cristais etéricos
- cristais indicados;
- explicação curta;
- integração com a prática.

#### Trilha ou tratamento
- nome;
- objetivo;
- próximo passo.

#### Integração com 21 Dias
Quando aplicável:
- **Iniciar jornada**
- **Preparar-me antes da jornada**
- **Continuar jornada com apoio complementar**

### Regra
Nem todos os blocos precisam aparecer.
Mostrar apenas o que foi selecionado para aquele momento.

---

## Tela U09.1 — Download do resultado em PDF

### Objetivo
Permitir que o usuário salve uma cópia do próprio resultado.

### Conteúdo do PDF
- identidade visual do projeto;
- nome e data;
- leitura acolhedora do momento;
- prioridades em linguagem humana;
- intenção do próximo passo;
- Solfeggio indicado;
- floral sugerido, quando houver;
- aromaterapia, quando houver;
- cristais etéricos, quando houver;
- informação de que a sessão de áudio é exclusiva;
- mensagem final e aviso de caráter complementar.

### Nunca incluir no PDF do usuário
- Biblioteca-Mestra;
- scores;
- pesos;
- nomes dos sistemas internos;
- símbolos;
- comandos;
- justificativa técnica;
- recursos rejeitados;
- relatório ADM.

### Ação
Botão: **Baixar meu resultado em PDF**

---

## Tela U09.2 — Envio do resultado por e-mail

### USER
O usuário pode escolher **Receber por e-mail** no próprio resultado.

Fluxo:
- gerar a mesma versão acolhedora do PDF;
- salvar o PDF em armazenamento privado;
- vincular ao usuário e à anamnese;
- criar solicitação de envio;
- enviar exclusivamente para o e-mail autenticado da própria conta.

O usuário comum não pode escolher outro destinatário.

### ADM
Dentro do Compositor de Cuidado, quando a anamnese possui vínculo backend válido, o ADM pode usar **Enviar resultado**.

O envio:
- utiliza o mesmo PDF acolhedor do usuário;
- não envia relatório técnico;
- não expõe Biblioteca-Mestra, scores, pesos, sistemas internos, símbolos ou comandos;
- fica registrado em histórico de solicitações com status de envio.

### Segurança
- PDFs ficam no bucket privado `result-pdfs`;
- cada usuário só lê os próprios PDFs;
- a Edge Function exige autenticação;
- o USER só pode solicitar envio da própria anamnese;
- o destinatário do USER é sempre o e-mail autenticado;
- a credencial do provedor de e-mail permanece somente no backend.

### Provedor
A função de envio deve usar provedor transacional configurado por segredo de ambiente. Enquanto o provedor não estiver configurado, a solicitação permanece registrada sem simular envio bem-sucedido.

### PENDÊNCIA DO EVERTON — CONFIGURAR QUANDO FOR ATIVAR O ENVIO REAL
Status: **PENDENTE / NÃO BLOQUEIA O RESTANTE DO DESENVOLVIMENTO**

Quando Everton decidir ativar o envio real dos resultados por e-mail:
- criar/usar uma conta em um provedor transacional compatível, como Resend;
- obter a chave de API do provedor;
- cadastrar a chave no Supabase Edge Function Secrets como `RESEND_API_KEY`;
- opcionalmente configurar `RESULT_EMAIL_FROM` com o remetente desejado;
- enquanto não houver domínio próprio, usar a configuração permitida pelo provedor para testes/uso inicial;
- quando houver domínio próprio, verificar o domínio no provedor e trocar o remetente para um endereço profissional;
- realizar um envio de teste USER;
- realizar um envio de teste ADM;
- confirmar recebimento do PDF correto;
- conferir que nenhuma informação técnica do ADM aparece no e-mail ou no PDF;
- somente depois considerar o recurso de envio por e-mail como **ATIVO EM PRODUÇÃO**.

Não remover esta pendência até a configuração do provedor ser concluída e testada.

---

## Tela U10 — Player de áudio

### Objetivo
Executar o áudio programado dentro do app.

### Elementos
- título;
- intenção;
- player;
- duração;
- progresso;
- pausar;
- retomar;
- reiniciar;
- marcar como concluído;
- instrução breve antes de começar.

### Pós-áudio
Pergunta simples:
**“Como você está agora?”**

Respostas possíveis:
- me sinto melhor;
- me sinto igual;
- algo mudou;
- quero contar mais.

---

## Tela U11 — Registro pós-prática

### Objetivo
Coletar percepção para reavaliação.

### Conteúdo
- escala simples;
- campo opcional de texto;
- sensação predominante;
- percepção corporal;
- vontade de continuar.

### Regra
Sem expor pontuação técnica.

---

## Tela U12 — Minha Jornada

### Objetivo
Dar continuidade ao cuidado.

### Conteúdo
- prática de hoje;
- áudio atual;
- floral;
- aromaterapia;
- cristais etéricos;
- trilha;
- etapa do protocolo;
- próximos passos.

### CTA principal
**Continuar meu cuidado**

---

## Tela U13 — Histórico

### Objetivo
Mostrar evolução de forma humana.

### Pode exibir
- práticas concluídas;
- áudios ouvidos;
- registros de percepção;
- etapas concluídas;
- mudanças relatadas.

### Linguagem
Exemplo:
**“Você relatou mais tranquilidade nas últimas práticas.”**

Não exibir:
- score;
- pesos;
- ranking interno.

---

## Tela U14 — Reavaliação

### Objetivo
Verificar se o cuidado continua adequado.

### Perguntas
- o que melhorou?
- o que permaneceu?
- algo novo apareceu?
- o que mais pede atenção agora?

### Possíveis resultados
- manter;
- ajustar;
- trocar;
- retirar;
- adicionar;
- encaminhar para nova trilha;
- integrar ao 21 Dias.

---

# 3. ÁREA ADM — EVERTON

## Tela A01 — Dashboard

### Objetivo
Visão geral operacional.

### Exibir
- usuários ativos;
- anamneses concluídas;
- anamneses pendentes;
- reavaliações;
- áudios atribuídos;
- trilhas em andamento;
- alertas internos;
- itens pendentes de revisão.

---

## Tela A02 — Usuários

### Exibir
- nome;
- status;
- última atividade;
- etapa atual;
- tratamento atual;
- data da última reavaliação.

### Ações
- abrir perfil;
- revisar anamnese;
- ajustar composição;
- reavaliar.

---

## Tela A03 — Perfil técnico do usuário

### Exibir
- respostas completas;
- relato livre;
- histórico;
- eixos;
- prioridades;
- pontuações internas;
- evolução;
- recursos atuais;
- recursos anteriores.

---

## Tela A04 — Leitura técnica

### Exibir
- eixos e intensidade;
- respostas-chave;
- influência do relato livre;
- prioridade principal;
- prioridades secundárias;
- hipóteses de composição;
- necessidades de estabilização ou preparação.

---

## Tela A05 — Biblioteca-Mestra

### Exibir
- todos os sistemas;
- status de formação;
- status da catalogação técnica;
- origem documental;
- recursos;
- eixos;
- restrições;
- compatibilidades.

### Regra
Esta tela nunca aparece para o usuário.

---

## Tela A06 — Gerador de áudios personalizados

### Regra
Não existe catálogo de áudios finais reutilizáveis.

### Exibir
- componentes de locução;
- estruturas de sessão;
- recursos sonoros disponíveis;
- Solfeggios;
- regras de composição;
- versões geradas por usuário;
- vínculo entre áudio, anamnese e composição técnica;
- status da geração;
- arquivo final exclusivo quando produzido.

Cada áudio final deve permanecer vinculado a uma única pessoa/anamnese e à assinatura técnica que o originou.

---

## Tela A06.1 — Upload do áudio exclusivo

### Objetivo
Permitir que o ADM anexe o arquivo final da sessão ao plano correto do usuário.

### Local
O upload deve aparecer dentro do **Compositor de Cuidado** da pessoa, junto da composição técnica daquela anamnese.

### Exibir antes do envio
- nome do usuário;
- ID da anamnese;
- ID do plano de áudio;
- assinatura da composição;
- sistemas e recursos relacionados;
- Solfeggio da sessão.

### Ações
- selecionar arquivo de áudio;
- substituir arquivo;
- remover arquivo;
- confirmar vínculo.

### Regra obrigatória
O arquivo enviado fica vinculado a **um único plano de áudio**, que pertence a **uma única anamnese** e a **um único usuário**.

O player da área do usuário deve buscar o áudio pelo ID do plano, não pelo nome do arquivo.

### Produção — IMPLEMENTADO
O áudio exclusivo não é mais persistido em IndexedDB/localmente.

A implementação oficial utiliza:
- bucket privado Supabase `personalized-audios`;
- caminho `<user_id>/<intake_id>/<audio_plan_id>/sessao.<ext>`;
- vínculo persistente em `care_plans`;
- `audio_plan_id` único;
- status de publicação;
- duração do arquivo quando detectável;
- caminho do Storage privado;
- data de publicação.

### Upload pelo ADM
Somente uma anamnese com `user_id` e `intake_id` reais do backend pode publicar áudio.

O ADM pode:
- anexar;
- substituir;
- remover.

Anamneses de teste/local não podem gravar no Storage de produção.

### Acesso pelo USER
O bucket permanece privado.

O usuário:
- não recebe URL pública permanente;
- consulta apenas o plano que pertence à própria conta;
- recebe URL assinada temporária para reprodução;
- não pode listar ou acessar a pasta de outro usuário.

A URL assinada expira e deve ser renovada pelo app quando necessário.

### Regra de vínculo
**um arquivo → um audio_plan_id → uma anamnese → um usuário**

Substituir um áudio preserva o vínculo do plano e remove o arquivo anterior quando a extensão/caminho mudar.

---

## Tela A07 — Biblioteca de florais

### Exibir
- nome;
- sistema/origem;
- indicação cadastrada;
- eixo relacionado;
- forma de uso cadastrada;
- restrições;
- status ativo/inativo.

---

## Tela A08 — Biblioteca de aromaterapia

### Exibir
- óleo ou composição;
- objetivo;
- forma de uso permitida;
- restrições;
- precauções;
- status;
- eixos relacionados.

---

## Tela A09 — Biblioteca de cristais etéricos

### Exibir
- cristal;
- sistema de origem;
- objetivo;
- eixo;
- chakra/centro relacionado;
- forma de aplicação;
- restrições;
- status.

---

## Tela A10 — Tratamentos e trilhas

### Objetivo
Permitir criar composições reutilizáveis.

### Cada trilha pode conter
- nome;
- objetivo;
- critérios de entrada;
- critérios de exclusão;
- áudio;
- floral;
- aromaterapia;
- cristais etéricos;
- sistemas energéticos internos;
- sequência;
- duração;
- checkpoints;
- caminho para 21 dias.

---

## Tela A11 — Compositor de cuidado

### Objetivo
Montar ou revisar a composição de um usuário específico.

### Exibir
- prioridade;
- recomendações do motor;
- recursos sugeridos;
- recursos considerados;
- recursos descartados;
- justificativa;
- possibilidade de ajuste manual.

### Regra
A decisão manual do Everton prevalece quando salva explicitamente.

---

## Tela A12 — Motor / regras

### Exibir
- regras de correlação;
- pesos;
- compatibilidades;
- prioridade;
- bloqueios;
- critérios de segurança;
- status de cada recurso;
- critérios de reavaliação.

---

## Tela A13 — Integração com 21 Dias

### Exibir
- critérios de entrada direta;
- preparação;
- apoio paralelo;
- checkpoints;
- dias da jornada relacionados;
- recursos complementares.

---

## Tela A14 — Reavaliações

### Exibir
- mudança por eixo;
- resposta do usuário;
- recursos mantidos;
- recursos retirados;
- recursos adicionados;
- próxima revisão.

---

# 4. FLUXO DO USUÁRIO

**Abertura → Como você está de verdade? → Identificação → Anamnese → Relato livre → Revisão → Transição → Seu momento → Seu cuidado agora → Áudio/Prática → Registro pós-prática → Minha Jornada → Reavaliação**

Quando indicado:

**Minha Jornada → 21 Dias para Voltar para Mim — Reintegração da Vida**

---

# 5. FLUXO ADM

**Dashboard → Usuário → Perfil técnico → Leitura técnica → Composição sugerida → Revisão/ajuste → Publicação do cuidado para o usuário → Acompanhamento → Reavaliação**

---

# 6. REGRAS DE PRIVACIDADE VISUAL

## Nunca mostrar ao usuário
- Biblioteca-Mestra;
- nome dos sistemas internos usados no cálculo;
- peso;
- score;
- fórmula;
- ranking;
- fonte documental;
- módulo;
- símbolo;
- comando energético;
- log técnico;
- justificativa técnica completa;
- recursos rejeitados;
- algoritmo.

## Pode mostrar ao usuário
- leitura acolhedora;
- prioridade em linguagem humana;
- prática indicada;
- áudio;
- floral;
- aromaterapia;
- cristais etéricos;
- trilha;
- próximos passos;
- evolução percebida.

---

# 7. REGRAS DE UX

- interface sem excesso de informação;
- uma decisão principal por tela;
- linguagem acolhedora;
- textos curtos;
- botões claros;
- progresso discreto;
- animações suaves;
- evitar aparência clínica;
- evitar aparência esotérica excessiva;
- manter sofisticação;
- preservar o layout aprovado;
- usar somente o logo oficial aprovado.

---

# 8. REGRAS DO MOTOR

O motor deve:

1. ler respostas;
2. cruzar múltiplos eixos;
3. considerar relato livre;
4. estabelecer prioridade;
5. filtrar recursos disponíveis;
6. excluir recursos indisponíveis ou bloqueados;
7. compor o cuidado;
8. gerar o plano de áudio exclusivo a partir da composição selecionada;
9. selecionar complementos quando apropriado;
10. decidir entre:
   - cuidado isolado;
   - trilha;
   - preparação;
   - integração com 21 Dias;
11. registrar a justificativa técnica no ADM;
12. entregar ao usuário apenas a versão acolhedora;
13. reavaliar depois da prática.

---

# 9. MODELO DE COMPOSIÇÃO

A composição pode conter zero, um ou vários recursos complementares.

Exemplos:

### Composição 1
- áudio programado;
- floral.

### Composição 2
- áudio;
- aromaterapia;
- cristais etéricos.

### Composição 3
- áudio;
- preparação;
- entrada no 21 Dias.

### Composição 4
- jornada 21 Dias;
- áudio complementar;
- floral;
- reavaliação intermediária.

A quantidade de recursos nunca deve ser usada como sinal de qualidade.

---

# 10. COMPONENTES PRINCIPAIS PARA IMPLEMENTAÇÃO

## USER
- AppShellUser
- WelcomeScreen
- IntakeIntro
- IntakeQuestionRenderer
- FreeTextReflection
- IntakeReview
- ProcessingScreen
- UserMomentCard
- CarePlanCard
- AudioPlayer
- FloralCard
- AromatherapyCard
- EthericCrystalCard
- JourneyCard
- ProgressHistory
- ReassessmentForm

## ADM
- AdminShell
- AdminDashboard
- UserList
- UserTechnicalProfile
- TechnicalAnalysis
- MasterLibraryView
- PersonalizedAudioGenerator
- FloralLibrary
- AromatherapyLibrary
- EthericCrystalLibrary
- TreatmentBuilder
- CareComposer
- RulesEngineView
- Journey21Integration
- ReassessmentAdmin

---

# 11. MODELOS DE DADOS PRINCIPAIS

## UserProfile
- id
- nome
- dados básicos
- consentimentos
- status

## IntakeSession
- id
- userId
- respostas
- relatoLivre
- iniciadoEm
- concluidoEm
- status

## TechnicalAssessment
- intakeId
- eixos
- prioridades
- fatores
- sistemasConsiderados
- recursosSelecionados
- recursosDescartados
- justificativaTecnica

## CarePlan
- id
- userId
- assessmentId
- audioIds
- floralIds
- aromatherapyIds
- ethericCrystalIds
- treatmentId
- journey21Mode
- status
- criadoEm
- revisaoPrevista

## PracticeLog
- userId
- carePlanId
- audioId
- antes
- depois
- observacao
- concluidoEm

## Reassessment
- userId
- carePlanId
- melhorias
- permanencias
- novasQuestoes
- novaPrioridade
- decisao

---

# 12. CRITÉRIO DE IMPLEMENTAÇÃO

A implementação deve respeitar esta ordem:

### Fase 1
- layout base;
- autenticação;
- perfil;
- abertura;
- anamnese;
- persistência;
- relato livre;
- revisão.

### Fase 2
- motor;
- leitura técnica;
- resultado acolhedor;
- painel ADM.

### Fase 3
- geração de áudio exclusivo por usuário;
- player;
- histórico de prática;
- reavaliação.

### Fase 4
- florais;
- aromaterapia;
- cristais etéricos;
- compositor de cuidado.

### Fase 5
- integração completa com 21 Dias;
- checkpoints;
- evolução longitudinal.

---

# 13. REGRA FINAL

O usuário deve sentir:

**“Estou sendo acolhido e conduzido.”**

O ADM deve permitir ao Everton compreender:

**“Por que o sistema chegou a este direcionamento e como posso ajustá-lo?”**

A arquitetura deve manter essas duas experiências separadas em todas as etapas.


## PASSO 2.1 — DOWNLOAD PRIVADO DO ÁUDIO PELO USUÁRIO

Status: **IMPLEMENTADO**

O usuário pode usar **Baixar meu áudio** no próprio player.

Regras:
- o bucket continua privado;
- o app faz o download autenticado do arquivo pertencente ao plano da própria conta;
- nenhum link público permanente é criado;
- o nome baixado deriva do título da sessão;
- o usuário não pode baixar áudio de outro usuário por RLS.

---

## PASSO 3 — COMPOSITOR ADM COMPLETO

Status: **IMPLEMENTADO — BASE FUNCIONAL**

### Princípio
**O motor sugere. O Everton revisa. A composição aprovada prevalece.**

A sugestão original do motor nunca é apagada.

### O ADM pode revisar
- sistema-base;
- sistema principal;
- sistemas complementares;
- Solfeggio;
- florais;
- aromaterapia;
- cristais etéricos;
- intenção do áudio;
- roteiro técnico da composição;
- observações do terapeuta.

Sistemas com catalogação técnica PENDENTE não são disponibilizados para seleção manual automática.

### Estados
- RASCUNHO;
- APROVADO.

Qualquer alteração manual após aprovação retorna a composição para RASCUNHO.

### Persistência
A revisão atual fica em `care_composition_reviews`.

Cada salvamento gera uma versão imutável em `care_composition_review_versions`.

Assim:
- a versão mais recente aprovada é a vigente;
- versões anteriores continuam auditáveis;
- sugestão do motor e decisão manual ficam separadas.

### Aprovação
Ao clicar **Aprovar composição**:
- salva a revisão;
- grava a camada USER em `care_plans`;
- grava a camada técnica em `care_plan_technical`;
- recalcula a assinatura técnica do plano;
- libera o upload do áudio exclusivo.

### Camada USER
Pode conter apenas recursos legíveis:
- Solfeggio;
- floral;
- aromaterapia;
- cristais;
- status do áudio;
- rota de jornada quando aplicável.

### Camada ADM
Pode conter:
- sistema-base;
- sistema principal;
- complementares;
- recursos internos;
- assinatura da composição;
- roteiro;
- observações do Everton.

### Exclusividade do áudio
A assinatura do áudio muda quando mudam:
- sistemas;
- recursos internos;
- Solfeggio;
- intenção;
- roteiro;
- floral;
- aromaterapia;
- cristais.

Uma composição diferente gera um plano técnico diferente e não deve reutilizar automaticamente o áudio anterior.

### Regra de publicação
O upload do áudio só fica disponível quando:
- existe usuário real no backend;
- existe anamnese real no backend;
- a composição está APROVADA.



## PASSO 4 — GERAÇÃO DO ÁUDIO EXCLUSIVO

Status: **IMPLEMENTADO — PIPELINE E REVISÃO ADM**

### Fluxo oficial
**composição aprovada → roteiro falado → revisão do Everton → aprovação do roteiro → geração de voz → mixagem/trilha/Solfeggio → revisão final → publicação**

### Separação obrigatória
A composição técnica e o roteiro falado são camadas diferentes.

A composição técnica pode conter:
- sistemas;
- recursos internos;
- símbolos;
- energias;
- frequências;
- cristais;
- sequência;
- Solfeggio;
- complementos.

O roteiro falado:
- deve ser acolhedor;
- não precisa narrar nomes técnicos dos sistemas;
- pode ser editado pelo Everton;
- é versionado;
- precisa de aprovação explícita antes da geração de voz.

### Estados da geração
- script_draft;
- awaiting_script_approval;
- script_approved;
- awaiting_voice_provider;
- generating_voice;
- narration_ready;
- awaiting_mix;
- mix_ready;
- awaiting_final_review;
- ready_to_publish;
- published;
- failed;
- cancelled.

### Persistência
Fila atual:
`audio_generation_jobs`

Histórico de versões:
`audio_generation_job_versions`

Arquivos intermediários:
bucket privado `audio-generation-work`

Arquivo final:
bucket privado `personalized-audios`

### Duração
A duração do áudio da anamnese **não está congelada**.

Não herdar automaticamente os 29:57 da jornada **21 Dias para Voltar para Mim**.

### Solfeggio
Selecionar uma frequência na composição não significa que existe automaticamente uma faixa sonora mixada.

O arquivo real de Solfeggio e a forma de mixagem precisam existir tecnicamente antes de marcar a etapa como concluída.

### Upload manual
Enquanto o provedor automático não estiver configurado:
- Everton pode produzir o áudio externamente;
- revisar;
- anexar o arquivo final pelo ADM;
- o upload finaliza a fila como PUBLICADO.

### PENDÊNCIA DO EVERTON — PROVEDOR DE VOZ
Status: **PENDENTE / NÃO BLOQUEIA O RESTANTE DO DESENVOLVIMENTO**

Antes de ativar geração automática:
- escolher o provedor de voz;
- definir a voz oficial ou regra de seleção de voz;
- cadastrar a chave do provedor somente no backend;
- definir se a narração será gerada em um único arquivo ou por blocos;
- testar pronúncia, pausas e ritmo;
- definir a estratégia técnica de mixagem com Solfeggio/trilha;
- validar um áudio completo antes de liberar geração automática para usuários.

Não inserir chave de voz no frontend.



## PASSO 5 — MEU MOMENTO / MINHA JORNADA

Status: **IMPLEMENTADO — ÁREA PERMANENTE DO USUÁRIO**

### Navegação USER
O usuário passa a ter acesso fixo a:
- **Nova Anamnese**
- **Meu Momento**
- **Minha Jornada**
- **Sair**

### Meu Momento
Carrega do backend:
- última anamnese;
- resultado acolhedor publicado;
- prioridades em linguagem humana;
- intenção do próximo passo;
- mensagem final;
- PDF permanente com recursos públicos do plano.

Se ainda não houver composição aprovada:
- mostrar que a anamnese foi recebida;
- informar que o resultado permanente aparecerá após revisão/publicação;
- nunca improvisar um plano.

### Minha Jornada
Reúne:
- áudio exclusivo atual;
- ouvir;
- baixar áudio;
- duração quando disponível;
- Solfeggio;
- floral;
- aromaterapia;
- cristais etéricos;
- histórico de práticas;
- espaço de reavaliação.

### Persistência
A área não depende mais do navegador usado na anamnese.

Fontes:
- `intake_sessions`
- `user_results`
- `care_plans`
- `practice_logs`

### Resultado aprovado
Quando o ADM aprova uma composição:
- o resultado acolhedor é persistido em `user_results`;
- o plano público é persistido em `care_plans`;
- o usuário passa a visualizá-los em Meu Momento / Minha Jornada.

### Histórico de práticas
O histórico deixou de depender do localStorage.

Cada prática registra no backend:
- usuário;
- plano;
- início;
- conclusão;
- percepção antes;
- percepção depois;
- observação opcional;
- status.

Assim o histórico acompanha a conta entre dispositivos.

### Privacidade
A área USER nunca consulta:
- `care_plan_technical`;
- `technical_assessments`;
- Biblioteca-Mestra;
- scores;
- sistemas internos;
- símbolos;
- comandos;
- justificativas técnicas.



## REGRA COMERCIAL — MODALIDADES E LIBERAÇÃO DO DIAGNÓSTICO COMPLETO

Status: **REGRA OFICIAL**

### Modalidades iniciais

- **R$ 50 — 7 dias / áudio personalizado sem meditação guiada**
  - inclui o áudio exclusivo;
  - uso por 7 dias;
  - prazo de entrega: **até 3 dias** após a confirmação da compra e conclusão da anamnese;
  - libera um **diagnóstico parcial**;
  - não libera o diagnóstico completo nem o detalhamento integral das respostas.

- **R$ 100 — 7 dias / áudio personalizado com meditação guiada**
  - inclui o áudio exclusivo;
  - inclui meditação guiada personalizada;
  - uso por 7 dias;
  - prazo de entrega: **até 3 dias** após a confirmação da compra e conclusão da anamnese;
  - libera o diagnóstico completo;
  - libera a leitura organizada a partir das respostas da própria pessoa.

- **R$ 180 — 21 Dias para Voltar para Mim — Reintegração da Vida**
  - inclui a jornada de 21 dias;
  - processo mais aprofundado;
  - prazo de entrega: **entre 3 e 5 dias** após a confirmação da compra e conclusão da anamnese;
  - libera o diagnóstico completo;
  - libera a leitura organizada a partir das respostas da própria pessoa.

### Regra de acesso
O plano de R$ 50 libera um **diagnóstico parcial**, com leitura simples e sem aprofundamento.

### O que o diagnóstico parcial deve mostrar
- acolhimento inicial;
- leitura básica do momento atual;
- o que será trabalhado nesta fase;
- intenção do cuidado;
- energias e recursos escolhidos para aquele momento;
- Solfeggio, quando houver;
- floral, quando houver;
- aromaterapia, quando houver;
- cristais etéricos, quando houver;
- áudio exclusivo;
- instruções simples de uso durante os 7 dias.

### O que o diagnóstico parcial não deve aprofundar
- causas;
- padrões;
- relações entre respostas;
- análise detalhada das respostas;
- cadeias internas;
- scores;
- pesos;
- justificativas técnicas;
- sistemas internos;
- símbolos;
- comandos;
- leitura ampliada.

Também não deve conter chamadas comerciais ou comparativas sugerindo que uma leitura “melhor”, “mais completa” ou “superior” está disponível mediante pagamento adicional.

### Cristais etéricos — regra de explicação ao usuário
Cristais etéricos não devem ser exibidos apenas como uma lista de nomes.

Sempre explicar, em linguagem simples, que dentro do protocolo:
- não se trata necessariamente de uma pedra física que a pessoa precisa possuir;
- o cristal é utilizado como um **recurso energético/frequencial dentro da composição da sessão**;
- ele é selecionado de acordo com a intenção daquele cuidado;
- a pessoa não precisa fazer nada técnico para “ativá-lo”;
- quando houver orientação prática adicional, ela deve estar previamente cadastrada e validada no protocolo.

### Exemplo de linguagem USER
**Cristais etéricos escolhidos para este momento**

Nesta sessão, foram incluídos cristais etéricos como parte da composição energética do seu cuidado. Eles não precisam estar fisicamente com você. Dentro do protocolo, utilizamos a referência energética desses cristais durante a prática, escolhida de acordo com a intenção trabalhada neste momento.

Depois, apresentar cada cristal com uma frase curta e simples sobre sua função **dentro do protocolo**, sem linguagem técnica excessiva e sem promessas de resultado.

### Regra de autenticidade
Esta estrutura comercial e de entrega pertence ao projeto da Anamnese Integrativa / Protocolo da Transformação e não deve copiar textos, lógica, nomes, layout ou estrutura do Mini Diagnóstico ou de terceiros.



## REGRA DE ACOLHIMENTO DURANTE A ANAMNESE

Status: **REGRA OFICIAL**

A anamnese deve acolher enquanto pergunta.

### Objetivo emocional da experiência
O usuário deve sentir:
- que pode responder sem medo de errar;
- que não está sendo julgado;
- que não precisa compreender tudo imediatamente;
- que sua percepção atual já é válida;
- que consegue seguir para a próxima etapa no próprio ritmo.

### Regra das perguntas
As perguntas podem investigar temas profundos, mas devem:
- usar linguagem humana;
- evitar tom clínico, acusatório ou fatalista;
- evitar frases que definam quem a pessoa é;
- evitar afirmar causas sem evidência;
- evitar transformar percepção em diagnóstico;
- convidar à observação, e não impor interpretação.

### Regra das dicas acolhedoras
As dicas devem funcionar como convites de percepção.

Preferir:
- “Perceba como isso aparece para você.”
- “Não é preciso entender a causa agora.”
- “Sua percepção de hoje já é suficiente.”
- “Não existem respostas certas ou erradas aqui.”

Evitar:
- afirmações deterministas;
- sentenças sobre aura, corpo, memória ou padrão como fato consumado;
- linguagem de culpa;
- frases que possam aumentar medo ou sensação de defeito.

### Apoio durante a pergunta
Não exibir devolutiva automática depois de cada resposta.

Somente quando a pessoa permanecer **1 minuto sem responder à pergunta atual**, mostrar uma mensagem curta e discreta de acolhimento.

Essa mensagem deve:
- reforçar que não existe resposta certa;
- lembrar que a pessoa pode responder no próprio ritmo;
- não interpretar o silêncio;
- não pressionar;
- não antecipar diagnóstico;
- não fazer venda;
- não sugerir produto.

Exemplo:
“Pode ir no seu tempo. Não existe resposta certa aqui — escolha apenas o que mais se aproxima de como você se percebe hoje.”

### Princípio central
**A pessoa não deve sentir que está sendo analisada a cada clique. Deve sentir que está sendo acompanhada enquanto se percebe.**



## REGRA DE PRAZO — MODALIDADES

Status: **REGRA OFICIAL**

### Prazos
- **R$ 50 — 7 dias / áudio personalizado sem meditação guiada:** entrega em até **3 dias**.
- **R$ 100 — 7 dias / áudio personalizado com meditação guiada:** entrega em até **3 dias**.
- **R$ 180 — 21 Dias para Voltar para Mim — Reintegração da Vida:** entrega entre **3 e 5 dias**.

### Início do prazo
O prazo começa após:
- confirmação da compra;
- conclusão da anamnese;
- existência dos dados necessários para montar a composição individual.

### Comunicação ao usuário
O prazo deve aparecer:
- antes da finalização da compra;
- após a confirmação da compra;
- em **Minha Jornada** enquanto o material estiver sendo preparado.

### Regra de status
O sistema nunca deve marcar o material como pronto antes da publicação real.

Mensagens sugeridas:
- planos de 7 dias: **“Seu material personalizado está sendo preparado com base na sua anamnese. O prazo de entrega é de até 3 dias.”**
- jornada de 21 dias: **“Sua jornada personalizada está sendo preparada com base na sua anamnese. O prazo de entrega é de 3 a 5 dias.”**



## REGRA PRÉ-PAGAMENTO — PRAZO E ÁUDIO PREPARATIVO

Status: **REGRA OFICIAL**

Antes da confirmação do pagamento, o usuário deve visualizar uma mensagem clara explicando o motivo do prazo de entrega.

### Mensagem de pré-pagamento
Texto-base:

**“Como cada áudio é preparado de forma exclusiva a partir da sua anamnese, pedimos esse tempo para realizar com cuidado a programação energética necessária para o seu momento. Enquanto o seu material personalizado está sendo preparado, você receberá acesso imediato a um áudio preparativo do protocolo, já programado para apoiar a preparação dos aspectos físico, emocional, mental e espiritual para a sua imersão.”**

### Regra de transparência
A mensagem deve:
- aparecer antes do pagamento;
- informar o prazo da modalidade escolhida;
- deixar claro que o áudio exclusivo ainda será preparado;
- não sugerir que o material personalizado já está pronto;
- explicar que o áudio preparativo é uma etapa provisória de preparação;
- não usar promessa de resultado garantido.

### Áudio preparativo
Após a confirmação da compra, enquanto o material exclusivo estiver em produção:
- liberar imediatamente um **áudio preparativo do protocolo**;
- este áudio é **fixo e único para todos os usuários**;
- não é um áudio personalizado;
- ele deve ser separado tecnicamente dos áudios exclusivos;
- sua função dentro do protocolo é preparar a pessoa para a etapa seguinte;
- pode contemplar, dentro da proposta energética do protocolo, os campos físico, emocional, mental e espiritual;
- **não possui voz, narração ou meditação guiada**;
- **não possui roteiro falado**;
- deve funcionar como uma faixa sonora/energética de preparação;
- não deve conter leitura individual, diagnóstico, sistemas específicos da pessoa ou composição exclusiva;
- deve ser disponibilizado **somente para reprodução dentro do app**;
- **não pode ser baixado pelo usuário**;
- não deve gerar link público permanente;
- não deve exibir botão “Baixar”;
- o controle de acesso deve permanecer no app/backend;
- quando o áudio/jornada personalizada for publicada, o preparativo pode deixar de aparecer como material principal de espera, sem alterar sua natureza de áudio fixo do protocolo.

### Prazo exibido junto da mensagem
- modalidade R$ 50: até **3 dias**;
- modalidade R$ 100: até **3 dias**;
- modalidade R$ 180 / 21 Dias: entre **3 e 5 dias**.

### Estado em Minha Jornada
Enquanto o personalizado não estiver pronto, mostrar:
- status **Em preparação**;
- prazo correspondente;
- player do áudio preparativo;
- mensagem acolhedora explicando que a composição individual está sendo preparada.



### Composição energética oficial do áudio preparativo
Base de sustentação:
- Golden Light Source;
- Original Reiki Platinum.

Sistema principal:
- Soul Shakti.

Sequência preparativa:
- Body Purification — preparação do campo físico;
- Soul Healing — preparação emocional;
- Mind Empowerment — preparação mental;
- Spiritual Alignment — preparação espiritual;
- integração e fechamento.

### Regra técnica
O áudio preparativo deve ter um identificador próprio de asset global do protocolo.

Não usar:
- `audio_plan_id` individual;
- caminho por usuário/anamnese;
- download autenticado individual.

Usar:
- asset global privado;
- reprodução autorizada dentro do app;
- sem opção de download na interface USER.

A regra de download continua válida apenas para os áudios personalizados/exclusivos do usuário.


## REGRA LGPD E POLÍTICA DE PRIVACIDADE

Status: **EM REVISÃO — NÃO CONSIDERAR FECHADO PARA PRODUÇÃO**

O aplicativo trata dados pessoais e pode tratar dados pessoais sensíveis fornecidos pela própria pessoa na anamnese. Por isso, a experiência deve manter uma camada permanente de transparência e proteção de dados.

### Obrigatório no cadastro
- acesso à Política de Privacidade antes da criação da conta;
- consentimento específico e destacado para os dados fornecidos na anamnese;
- indicação de que a anamnese pode conter dados pessoais sensíveis;
- registro da data/hora do consentimento quando tecnicamente disponível;
- nenhuma caixa de consentimento pré-marcada.

### Política de Privacidade
A política deve explicar, em linguagem simples:
- quem é o controlador;
- quais categorias de dados são tratadas;
- quais são as finalidades;
- como são tratados dados sensíveis;
- operadores/fornecedores necessários à prestação do serviço;
- armazenamento e segurança;
- retenção e eliminação;
- direitos do titular;
- decisões/análises automatizadas quando aplicável;
- atualizações da política;
- canal de contato para exercício dos direitos.

### Acesso permanente
A Política de Privacidade deve permanecer acessível:
- na tela de cadastro;
- após o login;
- pelo rodapé/área da conta.

### Direitos do titular
O fluxo deve permitir futuramente operacionalizar:
- confirmação e acesso;
- correção;
- informação sobre compartilhamento;
- revogação de consentimento;
- eliminação quando cabível;
- demais direitos previstos na LGPD.

### Itens em revisão antes da publicação comercial
- revisar e eliminar riscos de armazenamento local de dados sensíveis em chaves compartilhadas do navegador;
- criar a área **Privacidade e meus dados**;
- separar consentimentos gerais de consentimento para dados pessoais sensíveis da anamnese;
- definir o canal oficial de contato para privacidade/LGPD;
- confirmar os fornecedores efetivamente utilizados e refletir isso na política;
- definir formalmente os prazos/regras de retenção por categoria de dado;
- definir o fluxo de acesso, correção, revogação, portabilidade quando aplicável e solicitação de exclusão;
- registrar protocolo e histórico das solicitações de privacidade;
- definir o que pode ser eliminado imediatamente e o que eventualmente precisa ser conservado por fundamento legal;
- revisar juridicamente a versão final antes do lançamento comercial;
- executar auditoria LGPD completa antes de considerar o módulo apto para produção.

### Ordem sugerida para a revisão
1. armazenamento local e exposição entre contas;
2. área **Privacidade e meus dados**;
3. consentimentos separados;
4. canal oficial de privacidade;
5. política de retenção;
6. fluxo operacional dos direitos do titular;
7. revisão jurídica;
8. auditoria final de produção.

### Regra de fechamento
Nenhum destes itens deve ser marcado como **FECHADO**, **APROVADO PARA PRODUÇÃO** ou equivalente sem revisão específica e validação final do fluxo real do aplicativo.



### Regra sonora do áudio preparativo
O áudio preparativo é **instrumental/ambiental e sem locução**.

Não usar:
- voz humana;
- TTS;
- meditação guiada;
- afirmações faladas;
- instruções de respiração narradas;
- roteiro de abertura ou fechamento falado.

Podem existir, quando aprovados:
- trilha ambiente;
- Solfeggio;
- silêncio estruturado;
- elementos sonoros suaves;
- programação energética realizada pelo Everton.

Este áudio não entra no pipeline de geração de voz dos áudios personalizados.


## COMPLEMENTO OPCIONAL — RELATÓRIO COMPLETO NO PLANO DE 7 DIAS

Status: **REGRA OFICIAL**

### Aplicação
No plano de **R$ 50 / 7 dias**, o usuário recebe normalmente a leitura básica já definida para essa modalidade.

Opcionalmente, poderá adquirir o **Relatório Completo** por **R$ 15 adicionais**, totalizando **R$ 65**.

No plano de **R$ 100**, o relatório completo permanece incluído, sem cobrança adicional.

### Regra de apresentação
O complemento deve ser apresentado de forma discreta e sem pressão comercial.

Texto sugerido:
**“Quero conhecer minha leitura completa — + R$ 15”**

Não usar linguagem como:
- “resultado melhor”;
- “versão superior”;
- “diagnóstico verdadeiro”;
- “você precisa disso”;
- comparações que diminuam a entrega do plano de R$ 50.

O plano de R$ 50 continua completo dentro da proposta contratada; o Relatório Completo é apenas um aprofundamento opcional.

### Conteúdo do Relatório Completo
O relatório completo deve ser detalhado e manter o mesmo padrão de profundidade das modalidades que já incluem leitura completa.

Ele deve apresentar, em linguagem acessível ao usuário:

- síntese acolhedora do momento atual;
- áreas que aparecem como prioritárias;
- relação entre as respostas, sem expor pontuações, pesos ou fórmulas internas;
- padrões percebidos e como eles se conectam no momento atual;
- intenção central do cuidado;
- tipo de energia que será trabalhada;
- para que essa energia é utilizada dentro do protocolo;
- em quais campos/áreas ela atua dentro da proposta do sistema;
- sistemas energéticos selecionados para a composição;
- recursos específicos usados dentro desses sistemas, quando for apropriado revelar ao usuário;
- Solfeggio selecionado, quando aplicável, com explicação simples da intenção de uso;
- florais selecionados, quando aplicável, com explicação simples de sua função dentro do protocolo;
- aromaterapia selecionada, quando aplicável, incluindo forma de uso e cuidados já catalogados;
- cristais etéricos selecionados, quando aplicável, explicando:
  - que não é necessário possuir a pedra física;
  - que o cristal é usado como referência energética na composição;
  - qual a intenção de cada cristal dentro do protocolo;
- áreas corporais/chakras relacionadas à composição, quando isso fizer parte da leitura aprovada;
- como os recursos se complementam;
- orientação de uso do áudio;
- o que observar ao longo dos 7 dias;
- fechamento acolhedor e reavaliação ao final do período.

### Regra de linguagem
As descrições de energia, sistema, cristal, floral, aroma, frequência ou chakra devem:
- permanecer dentro da linguagem do protocolo;
- explicar finalidade e área de atuação sem prometer resultado garantido;
- não transformar linguagem energética em alegação médica;
- não expor lógica interna, score, peso, fórmula, Biblioteca-Mestra, comandos privados, símbolos internos ou justificativas técnicas reservadas ao ADM;
- usar apenas propriedades já documentadas/catalogadas, sem improvisação.

### Regra dos recursos
Se um recurso não estiver documentado ou validado na Biblioteca-Mestra, ele não deve aparecer no relatório como se sua função fosse conhecida.

O relatório completo deve refletir exatamente a composição aprovada para aquele usuário e aquela anamnese.
