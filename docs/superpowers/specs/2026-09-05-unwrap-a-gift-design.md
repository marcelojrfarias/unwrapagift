# unwrapagift — presente desembrulhável

**Data:** 2026-09-05 · **Estado:** aprovado, em implementação

## 1. Objetivo

Um site onde quem recebe um presente o "desembrulha" numa sequência de telas, e só no fim
descobre o que é. A primeira instância é o presente de casamento de Bruna e Alexandre, dado por
Ariane, Giuliana, Natan e Marcelo.

A experiência tem que funcionar com o celular na mão dos dois, ao vivo. Para avançar, **os dois
precisam encostar o dedo em círculos separados ao mesmo tempo e segurar**. Um sozinho não passa.
Essa trava é o coração da coisa, não um enfeite.

O motor é genérico. O conteúdo de Bruna e Alexandre é um arquivo de dados.

**Prazo:** hoje. Isso governa todas as decisões de escopo abaixo.

## 2. Restrições de tom (do handoff, não negociáveis)

- Preço, loja ou "presentão" não aparecem em lugar nenhum.
- O presente é enquadrado como **tempo**, não como eletrodoméstico.
- Sem cards, sombras ou bordas arredondadas.
- Sem progresso numérico ("3 de 5", porcentagem).
- Não dá para pular etapas nem avançar com um dedo só.
- No máximo quatro elementos por tela.

## 3. Arquitetura

Estático, sem build, sem dependências. Deploy é `git push` para GitHub Pages.

```
index.html                  casca: <head>, containers, imports
assets/
  base.css                  layout, tipografia, animações
  theme-botanico.css        só variáveis de cor e fontes
  engine.js                 máquina de estados e renderização
  hold.js                   o componente de segurar (isolado)
gifts/
  bruna-alexandre.js        só conteúdo
img/                        etapa-1..5.png, presente.png
docs/prompts-imagens.md     guia de geração das imagens
```

Cada unidade tem uma responsabilidade: `hold.js` não sabe o que é uma etapa, `engine.js` não sabe
o que é uma lava-louças, `gifts/*.js` não contém lógica. Próximo presente = novo arquivo em
`gifts/` + novo `theme-*.css`, sem tocar no motor.

## 4. Contrato de conteúdo

```js
window.GIFT = {
  theme: 'botanico',
  recipients: [{ name, short }],   // 1 ou 2
  senders: [String],
  holdMs: 2200,
  cover:  { eyebrow, title, desc, cta },
  steps:  [ { title, desc?, img?, cta } ],
  reveal: { kind, name, img?, msg, signoff, signature }
}
```

`recipients.length` governa a mecânica: 1 item → um pad e instrução no singular; 2 → dois pads e
a trava simultânea. `steps.length` governa o indicador de progresso, que se adapta a qualquer N.

## 5. Fluxo

Máquina de estados de um inteiro só, `idx`:

- `idx === -1` → capa. CTA é um botão comum (ninguém deveria precisar de dois dedos para começar).
- `0 <= idx < steps.length` → etapa. Avança só pelo hold.
- `idx === steps.length` → revelação.

Voltar é livre (botão no canto + folhas já douradas do indicador). Avançar nunca é.

Sem rotas, sem histórico do navegador, sem persistência. Recarregar a página recomeça — e isso é
desejável: o presente pode ser aberto de novo.

## 6. O componente de segurar

O ponto onde a noite dá certo ou errado. O protótipo tem três defeitos reais aqui:

1. Mistura handlers `touch*` e `mouse*`. No iOS, `touchstart` dispara um `mousedown` sintético
   logo depois — dá para soltar o dedo e a barra continuar enchendo.
2. Se o dedo escorrega para fora do círculo, o `touchend` não chega no elemento e o pad trava aceso.
3. `Date.now()` no loop de progresso ignora o timestamp do frame.

Reescrever com **Pointer Events**:

- Cada pad guarda seu próprio `pointerId` e chama `setPointerCapture` no `pointerdown`. O dedo
  pode escorregar para fora que os eventos continuam chegando ao pad certo.
- Um único caminho de código para toque, mouse e caneta. Sem eventos duplicados.
- `touch-action: none` no pad, para o navegador não roubar o gesto como scroll.
- `-webkit-touch-callout: none` e `user-select: none`, para o iOS não abrir o menu de
  copiar/compartilhar nem selecionar texto no long-press.
- Progresso por `requestAnimationFrame` usando o timestamp do próprio frame.
- Soltar um dedo zera os dois. A trava é o ponto.
- Ao completar: `navigator.vibrate(...)` onde existir (silenciosamente ignorado no iOS).
- Teclado: `Space`/`Enter` segura o pad focado, para funcionar sem toque.
- `prefers-reduced-motion`: o preenchimento vira degraus discretos em vez de animação contínua.

Sem `maximum-scale=1` no viewport — o zoom continua funcionando, como o handoff pede.

## 7. Progresso

O raminho com folhas do protótipo, mantido: folha dourada = etapa vencida, nenhum número.
Adiciona-se o que faltava — folhas já douradas são clicáveis e voltam àquela etapa, com
`aria-label` dizendo a qual.

## 8. Revelação

Confetes em canvas nas cores do tema (refinar densidade e queda), título emergindo em ritmo mais
lento que as demais telas, vibração curta, assinatura dos quatro em destaque. Sem botão, sem som.
Sob `prefers-reduced-motion`, os confetes não rodam e o conteúdo aparece direto.

## 9. Imagens

Geradas em **traço preto sobre fundo transparente**; o CSS pinta a cor do tema por cima com
`mask-image` + `background-color`. Assim a cor é idêntica nas seis imagens (nenhum gerador acerta
o mesmo verde seis vezes) e o mesmo arquivo serve a outro tema. Fallback para `<img>` comum onde
`mask-image` não existir.

Se o arquivo não existir, a etapa renderiza só com texto e **o layout não abre buraco** — sem
placeholder tracejado. O site pode ir ao ar antes das imagens ficarem prontas.

Guia de geração: `docs/prompts-imagens.md`.

## 10. Acessibilidade e mobile

Mobile é o alvo; a web é consequência. `100dvh`, `env(safe-area-inset-*)`, área de toque dos pads
≥ 84px, foco visível em tudo que é interativo, contraste do texto secundário verificado sobre o
papel off-white, `aria-live` anunciando a troca de etapa.

## 11. Copy final (aprovada)

**Capa**
- eyebrow: `UM PRESENTE DE CASAMENTO PARA`
- título: `Bruna e Alexandre`
- desc: `De Ari, Giu, Natanzinho e Marcelo.` / `Para abrir juntos.`
- cta: `Começar a desembrulhar`

**Etapas** (título / descrição / rótulo do CTA)

1. `Antes de qualquer coisa, este presente é tempo para vocês dois`
   `Pra tomar uma cerveja gelada, explorar São Paulo, viajar o mundo, pra namorar...`
   — `Continuar desembrulhando`
2. `É tempo para construir o que vocês já estão construindo`
   `A carreira, a próxima loja, a casa que virou lar e a família que estão começando.`
   — `Tem mais`
3. `É uma tarefa a menos para dividir`
   `Toda casa tem a conversa sobre de quem é a vez. Essa aqui a gente já resolveu por vocês.`
   — `Quase lá`
4. `É não ter que pôr a mão na água gelada no inverno`
   `Nenhum dos dois vai ter que lavar panela no frio`
   — `Falta pouco`
5. `E que sobre bastante tempo para a família e os amigos`
   `Incluindo a gente, óbvio. Já estamos nos convidando pro próximo jantar na casa nova haha`
   — `Abrir`

**Revelação**
- kind: `O PRESENTE`
- nome: `Uma lava-louças`
- msg: `Umas 200 horas por ano de volta, para usar do jeito que quiserem`
- signoff: `Com carinho,`
- assinatura: `Ari, Giu, Natanzinho e Marcelo`

Instrução no rodapé dos pads: `Os dois ao mesmo tempo. Encostem e segurem.`
(Com um destinatário: `Encoste e segure.`)

## 12. Publicação

GitHub Pages a partir de `main`, raiz do repositório —
`https://marcelojrfarias.github.io/unwrapagift/`. Presentes futuros viram subpastas.

## 13. Fora de escopo

Backend, persistência, tela de configuração, build/bundler, segundo tema, suporte a mais de dois
destinatários, compartilhamento, analytics.

## 14. Riscos

| Risco | Mitigação |
|---|---|
| A trava de dois dedos falhar no aparelho deles, ao vivo | Pointer Events + `setPointerCapture`; testar em iOS e Android reais antes de publicar |
| Imagens não ficarem prontas a tempo | Layout já funciona sem elas; entram depois sem mexer no código |
| Fontes do Google demorarem e a tela piscar | `font-display: swap` e fallback serifado/sans declarado |
| Abrirem no desktop por engano | Layout centralizado de coluna única funciona igual; mouse usa o mesmo caminho de código |
