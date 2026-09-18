# Integração Oficial — Anamnese Integrativa + Áudios Programados + Protocolo de 21 Dias

## Status
**DIRETRIZ OFICIAL / CONGELADA**

Este documento registra a arquitetura funcional aprovada por Everton Piceni para a integração entre o aplicativo de Anamnese Integrativa, os áudios programados e o protocolo **21 Dias para Voltar para Mim — Reintegração da Vida**.

## 1. Papel da Anamnese

A Anamnese Integrativa é a porta de entrada do cuidado.

Sua função é identificar, a partir das respostas do usuário, **o que pede mais atenção naquele momento** e direcioná-lo para o recurso ou tratamento mais adequado entre os que estiverem disponíveis no protocolo naquele momento.

A anamnese não é apenas um formulário e não deve expor a lógica técnica interna ao usuário.

Fluxo central:

**PESSOA → ANAMNESE → NECESSIDADE ATUAL → LEITURA INTERNA → COMPOSIÇÃO DO CUIDADO → ACOMPANHAMENTO → REAVALIAÇÃO**

## 2. Recursos que podem compor o cuidado

Conforme a necessidade identificada, o sistema poderá indicar uma composição com um ou mais dos seguintes recursos:

- áudio programado;
- tratamento ou trilha disponível;
- floral ou composição floral cadastrada;
- aromaterapia cadastrada;
- cristais etéricos indicados;
- integração com o protocolo **21 Dias para Voltar para Mim — Reintegração da Vida**;
- outros recursos terapêuticos/energéticos que venham a ser incorporados oficialmente à biblioteca do projeto.

Não é obrigatório utilizar todos os recursos em todos os casos. A composição deve priorizar coerência e adequação ao momento da pessoa, não quantidade.

## 3. Áudios programados

Os áudios programados são parte do tratamento e não simples conteúdo complementar.

Podem ser utilizados para:

- acolhimento inicial;
- estabilização;
- presença e aterramento;
- medo;
- insegurança;
- vitalidade;
- reconexão corporal;
- movimento;
- recomeço;
- preparação para o protocolo de 21 dias;
- apoio durante a jornada;
- reavaliação e continuidade.

O app deve permitir acompanhar a execução do áudio e, quando previsto, colher uma percepção simples antes/depois para alimentar a reavaliação.

## 4. Florais, aromaterapia e cristais etéricos

A indicação desses recursos deve vir de bibliotecas cadastradas e da correlação interna definida no sistema.

### Florais
O usuário recebe a indicação de forma simples e acolhedora. A justificativa técnica permanece no painel ADM.

### Aromaterapia
O sistema só pode utilizar opções e formas de uso previamente cadastradas e validadas. Não improvisar dosagens, vias de uso ou recomendações fora do cadastro.

### Cristais etéricos
Podem ser indicados como suporte complementar conforme a composição interna. O usuário não precisa visualizar o sistema energético técnico que levou à seleção.

## 5. Integração com o Protocolo de 21 Dias

A anamnese poderá encaminhar o usuário para a jornada de três formas:

### Entrada direta
Quando o momento da pessoa estiver compatível com o início da jornada completa.

### Preparação
Quando for mais adequado realizar previamente áudios e/ou recursos de suporte antes do início dos 21 dias.

### Apoio paralelo
Quando a pessoa já estiver na jornada e a anamnese/reavaliação indicar um recurso complementar.

A anamnese também poderá ser utilizada em checkpoints ao longo da jornada para adaptar o cuidado conforme a evolução do usuário.

## 6. Regra de separação USER x ADM

### O usuário vê
- acolhimento;
- leitura simples do momento atual;
- prática indicada;
- áudio programado;
- floral indicado;
- aromaterapia indicada;
- cristais etéricos indicados;
- trilha ou próximo passo;
- evolução em linguagem humana e não técnica.

### O usuário NÃO vê
- Biblioteca-Mestra;
- nomes dos sistemas técnicos internos;
- pesos;
- pontuações;
- fórmulas;
- cruzamentos;
- rankings internos;
- fontes documentais;
- módulos, símbolos e comandos;
- justificativas técnicas de seleção.

### O painel ADM do Everton vê
- respostas completas;
- texto livre;
- eixos e pontuações;
- prioridades;
- sistemas analisados;
- Biblioteca-Mestra;
- compatibilidades;
- fontes documentais;
- módulos, níveis, símbolos e comandos documentados;
- chakras/centros relacionados;
- áudio indicado;
- floral;
- aromaterapia;
- cristais etéricos;
- sequência;
- tratamento/trilha;
- itens considerados e não selecionados;
- justificativa da composição;
- histórico e reavaliações.

Essa separação é obrigatória.

## 7. Layout

O layout visual aprovado para o aplicativo de Anamnese Integrativa é a referência oficial da experiência do usuário.

Diretrizes:

- usar exclusivamente o logo oficial aprovado por Everton;
- atmosfera acolhedora, limpa, elegante e suave;
- verde profundo + dourado suave;
- natureza, luz e respiro visual;
- evitar excesso de informação;
- não exibir elementos técnicos na interface do usuário;
- o painel técnico completo pertence ao ADM.

## 8. Regra central do motor

A pergunta que orienta o sistema é:

**“Do que esta pessoa precisa neste momento?”**

E a resposta operacional é:

**“Qual é o melhor cuidado disponível hoje dentro do protocolo para acolher essa necessidade?”**

## 9. Arquitetura consolidada

**PESSOA → ANAMNESE → NECESSIDADE ATUAL → LEITURA INTERNA → ÁUDIO PROGRAMADO + FLORAL + AROMATERAPIA + CRISTAIS ETÉRICOS + TRILHA DISPONÍVEL → ACOMPANHAMENTO → REAVALIAÇÃO → INTEGRAÇÃO COM OS 21 DIAS, QUANDO INDICADO**

## 10. Regra de evolução

A anamnese não deve ficar presa ao conteúdo disponível na data de sua criação.

Novos áudios, tratamentos, trilhas, florais, recursos de aromaterapia, cristais etéricos e demais recursos oficialmente incorporados ao projeto podem passar a integrar o motor de direcionamento sem necessidade de reconstruir a experiência da anamnese.

---

**Esta integração deve ser tratada como decisão oficial do projeto e não deve ser alterada por interpretação livre, simplificação ou exposição de dados técnicos ao usuário.**
