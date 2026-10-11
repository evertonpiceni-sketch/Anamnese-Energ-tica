# Revisão e correções — 11/10/2026

Referências: documento congelado de cinco páginas e imagens aprovadas enviadas nesta sessão. O logo PNG é o arquivo original enviado. O fundo editorial foi limpo a partir da referência, removendo textos e marcas para permitir conteúdo personalizado; a foto da abertura foi preservada.

## Correções realizadas

- Relatório completo com narrativa contínua e cinco páginas; recursos deixam de ser cards.
- Tela, download e preparação do PDF por e-mail usam o mesmo componente. O PDF preserva toda a página como imagem; seu texto não é selecionável. Conteúdos extensos são escalados para caber em A4, com possível redução da legibilidade.
- Leitura básica publicada retorna ao layout em blocos aprovado, com recursos realmente publicados. Não se inventam energias nem imagens de recursos ausentes do modelo de dados público.
- Removida geração antecipada do relatório completo no envio da anamnese e fallback por valor do plano de teste. A publicação aprovada e o entitlement determinam a entrega.
- E-mail ADM respeita o direito ao relatório completo e usa a publicação aprovada, sem enviar um resumo no lugar dela.
- Recursos explicitamente removidos pelo ADM não voltam por seleção automática. Sistemas internos não aparecem na nova narrativa pública.
- Corrigidos erros de TypeScript, concorrência de resolução de perfil, callback de autenticação, restauração de rascunho, índice inválido e indisponibilidade do armazenamento local.
- Identificadores locais passam a UUID. Metadados públicos passam a português e linguagem acolhedora.
- Removidos logo SVG antigo e dependências herdadas sem uso; dependências fixadas e lockfile incluído. jsPDF atualizado para versão sem os avisos de vulnerabilidade encontrados.
- ADM e geração de PDF carregados sob demanda.

## Verificação

`npm run lint`, `npm run build`, `npm test`, `npm audit` e `git diff --check`.

Os testes de navegador verificam cinco páginas no PDF, recursos removidos pelo ADM, escolhas de 7/21 dias, ausência de transbordamento em celular, restauração de rascunho, falha de armazenamento, ausência de consulta ao relatório sem entitlement, envio completo sem exibição antecipada e layout básico separado.

Supabase de produção consultado em modo de leitura: todas as 19 tabelas públicas possuem RLS; funções de checkout, confirmação e envio estão ativas. `is_admin()` verifica o usuário autenticado em `profiles`, tem `search_path` definido e é necessário às políticas. Não se revogou seu acesso, pois isso quebraria as políticas existentes.

## Limites ainda existentes

- Proteção contra senhas vazadas está desativada no Supabase. [Configuração](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- Envio real por e-mail, pagamento real, upload/reprodução de áudio e sessão ADM autenticada não foram exercitados com contas reais. Os testes de envio da anamnese usam respostas simuladas da API.
- A existência da função de e-mail não confirma que seu provedor esteja configurado; a pendência original da arquitetura permanece válida.
- Relatórios já publicados no banco não foram reescritos. A nova narrativa é aplicada em novas publicações pelo ADM; a nova apresentação é aplicada também aos relatórios existentes.
- Esta revisão não altera migrations nem configurações de produção. A entrega pelo repositório permite revisar as alterações antes da publicação.

## Continuação — duração confirmada, programação diária e produção

O pagamento de teste confirmou 7 dias; título e subtítulo da publicação desse teste foram corrigidos no banco, sem alterar pagamento, permissões ou conteúdo das respostas. Novas leituras e PDFs resolvem a duração pelo entitlement vigente. A publicação do teste ainda não tinha revisão nem composição diária vinculada; não se inventou uma programação aprovada para preencher essa ausência.

A pedido de Everton, o motor agora propõe uma programação diferente entre os dias, limitada às energias documentadas dos sistemas selecionados e às prioridades da anamnese. Sistemas estimulantes são excluídos no início ou diante de alta sensibilidade. Everton revisa a proposta no ADM, altera energias e intenções e aprova. A publicação rejeita dias ausentes, energias fora da composição e repetição da mesma composição em dias consecutivos. Alterar a programação muda a assinatura do plano de áudio, evitando reutilizar o vínculo de uma composição anterior.

O relatório mantém cinco páginas narrativas e entrega a programação aprovada em anexo no mesmo documento: seis páginas para 7 dias, oito para 21 dias. Mudanças de duração exigem nova revisão da programação, sem repetição ou truncamento automático. Foram adicionados testes de duração, anexo com 21 dias no PDF e restrições do motor diário.

O logo PNG retorna 404 no deploy antigo; as correções de layout ainda estavam apenas no PR. A entrega inclui publicação efetiva em produção e verificação do logo original. O caminho SVG antigo redireciona ao PNG para compatibilidade com páginas antigas em cache.

## Correção de energias explícitas e símbolos dos chakras

- A página de cuidado lista os nomes das energias da programação revisada (ou da composição revisada quando ainda não há distribuição diária), além do anexo por dia.
- A ausência de aprovação fica explícita. Não se preenche a entrega com sugestões ainda não revisadas.
- Os círculos dos chakras foram substituídos pelos símbolos das próprias imagens aprovadas, exibidos como recortes de fundo; não houve redesenho das figuras.
- Ao abrir uma anamnese com plano confirmado no ADM, o motor prepara a proposta diária quando ainda não existe uma. A revisão existente, incluindo programação parcial, é preservada. A proposta continua rascunho, sem aprovação automática.
- Validação adicional: nomes de energias, sete símbolos, layout móvel e inicialização do ADM sem escrita ou publicação automática. O teste real não tinha composição aprovada no momento desta correção.

## Leitura sustentada pelas respostas (answers-v2)

A auditoria do teste identificou 20 respostas válidas, mas o relatório legado usava parágrafos amplamente fixos e omitia o pedido livre. O conteúdo foi corrigido independentemente da referência visual.

- Cada pergunta tem uma observação e uma intenção próprias. A intensidade marcada determina se o tema é prioritário, secundário ou pouco presente; a análise ponderada desempata a ordem dos temas com a mesma intensidade.
- Perguntas não respondidas ou com valores inválidos não são tratadas como zero. Não há atribuição automática de esgotamento, autocobrança, desejo de mudança, empatia ou forças preservadas.
- Intenção, necessidade, desafios, forças declaradas, regiões corporais e sensibilidade são incorporados sem interpretar uma citação como um diagnóstico. A leitura não atribui uma causa única aos cruzamentos de respostas.
- Chakras são associados aos temas efetivamente marcados (ou às regiões indicadas), com as respostas de origem identificadas. Não são escolhidos apenas porque constam de um sistema energético ou do modelo visual.
- A leitura básica usa a mesma evidência individual. O componente deixou de afirmar uma sequência fixa de sustentação, alívio e integração para toda pessoa.
- O relatório registra versão do gerador, identificador de origem, impressão reproduzível das respostas e evidências por pergunta. A impressão não é uma credencial de segurança. A publicação compara a origem com a anamnese salva e recusa respostas diferentes ou incompletas antes da aprovação.
- Relatórios legados são reconstruídos na leitura com a anamnese acessível por RLS, preservando as energias, a programação revisada e os recursos já registrados. Essa reconstrução não aprova terapias e não escreve automaticamente no banco.
- O único relatório do teste pago identificado foi corrigido no banco com guarda de concorrência e conferência das respostas. Pedido e desafio foram incluídos, 20 evidências registradas, duração de 7 dias preservada, sem alteração de energias ou programação. Não havia resultado básico publicado para esse teste; não foi criada uma publicação fictícia.

Validação adicional: variações isoladas das 20 perguntas produzem leituras distintas; nenhum tema intenso ou chakra é gerado em um formulário zerado; informações ausentes não viram respostas negativas; citações são preservadas; revisão de relatório legado mantém a programação; tentativa de publicar leitura de respostas diferentes é recusada sem escrita.

O gerador usa regras textuais por tema, não um modelo de linguagem que compreenda livremente qualquer relato. O texto aberto é incorporado como declaração da pessoa; a revisão do terapeuta continua necessária para contextualizar e aprovar a composição.


### Correção de acolhimento e continuidade da leitura

A versão answers-v3 mantém as respostas e a rastreabilidade nos metadados, mas retira contagens, notas e reprodução da escala do texto entregue. Dificuldades de baixa intensidade não são tratadas como forças. A fé declarada recebe contexto sem pressupor desconexão espiritual quando ela não foi relatada.

O relatório deixou de distribuir temas em cinco páginas fixas. A leitura, os pontos de apoio, as intenções de cuidado, os centros associados e os recursos revisados integram um único documento contínuo, seguido da programação diária quando aprovada. Não há capa vazia nem encerramento em uma página própria. O PDF pagina pelo conteúdo real, preserva largura e tamanho do texto e evita dividir parágrafos e composições diárias entre folhas. A composição aprovada e a duração contratada não são modificadas por esta atualização.

A primeira tela usa a fotografia de natureza aprovada sem a camada branca que apagava suas cores. O texto inicial acolhe a pessoa e permite começar no próprio ritmo, sem apresentar detalhes da análise técnica.
