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
