# unwrap

Envie presentes desembrulháveis.

Um site onde quem recebe abre o presente em etapas e só descobre o que é no fim.
Quando o presente é para duas pessoas, **as duas precisam encostar o dedo em círculos
separados ao mesmo tempo e segurar** — um sozinho não passa.

Estático: sem build, sem dependências, sem backend. Publica no GitHub Pages.

## Rodar

```sh
python3 -m http.server 8000
```

## Criar um presente novo

1. Copie `gifts/bruna-alexandre.js` para `gifts/seu-presente.js` e troque o conteúdo.
2. Se quiser outra paleta, copie `assets/theme-botanico.css` para `assets/theme-<nome>.css`
   e mexa só nas variáveis.
3. Crie `seu-presente/index.html` (copie de `bruna-e-alexandre/`) apontando para os dois.

Cada presente vive na própria pasta e ganha a própria URL:
`.../unwrapagift/bruna-e-alexandre/`. A raiz é uma página neutra — não revela
nenhum presente para quem cair nela por acaso.

O motor se adapta ao que estiver no arquivo: uma pessoa em `recipients` mostra um círculo
e a instrução vai para o singular; duas mostram dois e a trava simultânea. O indicador de
progresso se ajusta a qualquer número de etapas.

```js
window.GIFT = {
  theme: 'botanico',
  recipients: [{ name: 'Bruna', short: 'bruna' }],  // 1 ou 2
  senders: ['...'],
  holdMs: 2200,                                     // tempo de segurar
  cover:  { eyebrow, title, desc, img?, cta },      // cta = texto acima dos círculos
  steps:  [ { title, desc?, img?, cta } ],          // quantas quiser
  reveal: { kind, name, img?, msg, signoff, signature, dedication? }
};
```

Campos de texto aceitam HTML simples (`<br>`, `<em>`).

O `cta` é o único texto em volta dos círculos. Na capa ele ensina a mecânica
("Pressionem ao mesmo tempo para desembrulhar"); nas etapas vira a escada que
cria antecipação ("Tem mais", "Quase lá", "Falta pouco", "Abrir"). Como o texto
vem daqui, é ele que decide singular ou plural conforme quem recebe.

## Estrutura

```
index.html                página neutra do projeto
bruna-e-alexandre/        um presente = uma pasta = uma URL
assets/
  base.css              layout, tipografia, movimento
  theme-botanico.css    só variáveis de cor e fonte
  engine.js             capa, etapas, revelação, confetes
  hold.js               segurar para avançar (independente do resto)
gifts/                  conteúdo, um arquivo por presente
img/                    ilustrações (opcionais)
docs/
  prompts-imagens.md    como gerar as ilustrações
```

## Prévia no WhatsApp

`tools/gerar-og.py` compõe `img/og.png` a partir da ilustração da capa: papel de fundo, traço
recolorido no verde do tema e o nome em Cormorant Garamond, a mesma fonte do site. A ilustração
crua não serve — ela é preta sobre transparente, e transparência vira preto no WhatsApp.

As meta tags ficam no `index.html` de cada presente. A prévia nunca revela o presente.

## Imagens

Opcionais. Se o arquivo não existir, a tela renderiza só com o texto e o layout não abre
buraco — dá para publicar antes das ilustrações ficarem prontas e adicioná-las depois.

Gere em **traço preto sobre fundo transparente**: o CSS pinta a cor do tema por cima com
`mask-image`, então a mesma imagem serve a qualquer tema e a cor fica idêntica em todas.
Ver `docs/prompts-imagens.md`.
