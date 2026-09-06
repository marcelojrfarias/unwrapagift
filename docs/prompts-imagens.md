# Prompts para as imagens — Bruna e Alexandre

Guia para gerar as 6 imagens do site (`etapa-1.png` … `etapa-5.png` e `presente.png`).

O objetivo não é fazer 6 boas imagens. É fazer **6 imagens que pareçam a mesma mão**. Consistência
vale mais que capricho individual: uma etapa fora do padrão estraga a sequência inteira.

A referência de estilo não é uma ideia abstrata — é o desenho da casa com palmeiras que aparece
atrás do "SAVE the DATE" no convite deles (`bruna-e-alexandre/PHOTO-2026-09-05-11-54-15.jpg`).
Linha fina, uniforme, sem preenchimento, muita área vazia. É esse traço que queremos.

---

## 0. O que pedir ao gerador (leia antes)

**Peça traço preto sobre fundo BRANCO PURO (#FFFFFF).** O Gemini não entrega
transparência e devolve `.jpg` — tudo bem. O tratamento converte a escuridão de
cada pixel em opacidade, então branco vira transparente sozinho. Uma cor chapada
(verde, magenta) daria mais trabalho e sujaria a borda das linhas.

O que o JPG estraga é outra coisa: a compressão deixa um chuvisco cinza em volta
do traço. `tools/preparar-imagem.py` corta tudo acima de 236 de luminância, então
esse ruído não vira véu na tela. Só não peça fundo cinza, creme ou com sombra —
aí o corte come o desenho junto.

---

## 1. Decisão técnica: gere em PRETO, não em verde

Pode parecer errado, já que o site é verde-sálvia. É de propósito.

As imagens são geradas em **traço preto puro sobre fundo transparente**, e o CSS pinta a cor do
tema por cima usando `mask-image`. Três razões:

1. Nenhum modelo de imagem acerta `#8A9C7E` seis vezes seguidas. Ia dar seis verdes diferentes.
2. Trocar o tema do site (aniversário, chá de bebê) reaproveita o mesmo arquivo em outra cor.
3. Preto puro sobre transparente é o único formato que a máscara lê sem sujeira nas bordas.

Se a sua ferramenta insistir em fundo branco, veja "Limpeza" no fim do documento.

---

## 1b. Cabelo e barba são preenchidos (a exceção que importa)

Linha fina some. Na tela a ilustração aparece com ~126px de altura, e nesse tamanho o cabelo
ondulado dela desenhado a traço vira uma névoa cinza e a barba dele desaparece — as duas pessoas
deixam de ser reconhecíveis.

Então há uma exceção deliberada ao "sem preenchimento": **o cabelo dela e a barba dele são massas
pretas sólidas**. É o que dá presença às figuras no tamanho real, e é o que faz Bruna e Alexandre
serem eles, e não um casal genérico.

Isso vale para toda cena onde apareçam. O bloco de estilo abaixo já traz a regra.

**Cuidado com o efeito colateral:** ao pedir preenchimento, o gerador tende a preencher a cabeça
dele junto com a barba, e o Xand aparece com cabelo. Ele é de cabeça raspada — a mancha preta é
só a barba. Por isso os prompts trazem `the top and back of his head are clean outline` e
`man with hair` no negativo.

## 2. Bloco de estilo — cole em TODOS os prompts

Sempre em inglês: os modelos de imagem entendem melhor e erram menos no traço.
Este bloco vai **antes** da descrição da cena, sem alterar uma palavra entre uma imagem e outra.

```
STYLE: Single continuous line drawing, minimalist one-line art. Pure black, thin, perfectly
uniform stroke with no variation in weight, on a plain pure white background (#FFFFFF) — flat
white, no shadow, no gradient, no texture. Line art only, with TWO exceptions: the woman's hair
and the man's beard are filled in as solid black shapes, not just outlined. Everything else is
unfilled line work — no shading, no hatching, no color. The confident economy of a fine-line
sketch on a botanical wedding invitation: calm, elegant, unhurried. Landscape orientation,
roughly 3:2. Tight framing: the subject fills most of the frame with only a small margin around
it. Faces reduced to essential features only: no rendered eyes, no skin texture, no facial
shading. People are recognizable by silhouette, hair, build and posture, never by facial detail.
Clean vector-like curves.
```

## 3. Prompt negativo — cole em TODOS

```
NEGATIVE: outlined-only beard, empty beard, outlined-only hair, color, shading, gradient,
watercolor, painted background, any background,
frame, border, text, letters, numbers, watermark, signature, drop shadow, 3D render,
photorealism, crosshatching, thick brush strokes, varying line weight, sketchy double lines,
detailed facial features, realistic eyes, cartoon expressions, logos, brands.
```

---

## 4. Como usar as fotos de referência

As fotos estão em `bruna-e-alexandre/`. **Referência facial em desenho de linha funciona menos do
que você espera** — o traço apaga quase tudo que identifica um rosto. O que sobrevive à
simplificação é a silhueta: cabelo, barba, altura, porte, postura.

Então faça as duas coisas ao mesmo tempo:

- **Anexe as fotos** como imagem de referência, se a ferramenta aceitar (Nano Banana / Gemini,
  GPT Image, Flux Kontext aceitam upload direto; no Midjourney use `--cref <url> --cw 30` —
  peso baixo, porque peso alto tenta trazer detalhe fotográfico e quebra o traço).
- **Descreva os traços marcantes em texto**, mesmo tendo anexado a foto. É o texto que segura
  o reconhecimento. Os blocos abaixo já trazem essa descrição pronta.

### Descritores das pessoas

Use exatamente estes textos, sempre iguais, em toda cena onde a pessoa aparecer:

| Pessoa | Descritor (colar em inglês) | Foto |
|---|---|---|
| **Bruna** | `a woman with long dark wavy hair filled in as a solid black shape, falling well past her shoulders, slim build` | `IMG_4393`, `IMG_4394`, `IMG_4395` |
| **Alexandre (Xand)** | `a tall broad-shouldered man with a closely shaved head and a FULL SOLID BLACK BEARD filled in as a dark shape, wearing an oversized t-shirt` | `IMG_4391`, `IMG_4396`, `IMG_4397` |

> **Pendência:** a etapa 5 mostra os seis. Ainda não há fotos de **Ari, Giu, Natan e Marcelo**.
> Coloque uma foto de cada em `bruna-e-alexandre/` e escreva um descritor no mesmo formato acima
> antes de gerar essa imagem. Sem isso, gere a etapa 5 com os seis de costas (o prompt alternativo
> está lá embaixo) — funciona bem e não depende de semelhança.

---

## 5. Os prompts, etapa por etapa

Monte cada um assim: **`[BLOCO DE ESTILO]` + `SCENE:` + `[NEGATIVO]`**

### Etapa 1 — Tempo de qualidade  ⚠️ refazer: o preenchimento invadiu a cabeça dele

```
SCENE: A couple sitting side by side on the sand at the beach, seen from behind and slightly to
one side, shoulders touching, each holding a beer bottle resting on one knee. The sea is
suggested by two or three loose horizontal lines and a single horizon line. On the left,
a woman with long dark wavy hair falling well past her shoulders, slim build. On the right,
a tall broad-shouldered man with a closely shaved head and a full dark beard, wearing an
oversized t-shirt. Relaxed, unhurried, no faces visible.
```

De costas resolve dois problemas: não depende de semelhança facial e é mais bonito no traço.

### Etapa 2 — Construir o futuro  ✅ pronta

```
SCENE: A couple standing side by side, seen from behind, holding hands, looking out toward a
distant city skyline drawn as a low simple cluster of rectangular buildings on the horizon.
On the left, a woman with long dark wavy hair falling well past her shoulders, slim build.
On the right, a tall broad-shouldered man with a closely shaved head and a full dark beard,
wearing an oversized t-shirt. Wide empty space above them. Quiet, forward-looking.
```

### Etapa 3 — Uma tarefa a menos para dividir  ✅ pronta

```
SCENE: A couple standing side by side at a kitchen counter, in profile, facing each other
slightly. One hands a clean plate to the other; a small neat stack of three plates sits on the
counter between them, and a dish towel hangs from the counter edge. On the left, a woman with
long dark wavy hair falling well past her shoulders. On the right, a tall broad-shouldered man
with a closely shaved head and a full dark beard, wearing an oversized t-shirt. Only the counter
line is drawn — no cabinets, no appliances, no kitchen background.
```

**Atenção:** nada de máquina nesta cena. A revelação depende de o objeto não aparecer antes.

### Etapa 4 — Água gelada em pleno julho

```
SCENE: A close-up of a single hand held under a running kitchen faucet. The water is drawn as
four or five thin falling lines. One pan sits in the sink below. Only the faucet, the hand, the
water, the pan and a single line for the sink edge — nothing else in the frame. Still, cold,
slightly resigned.
```

Única cena sem pessoas inteiras. É proposital: quebra o ritmo antes da última etapa e deixa o
detalhe concreto falar sozinho.

### Etapa 5 — Os seis

**Versão A** (quando houver fotos dos quatro):

```
SCENE: Six friends gathered around a round dinner table, seen from a slightly elevated angle,
all raising glasses together in a toast. On the table only a few plates and glasses, drawn
sparsely. [descritores das seis pessoas, na ordem em que aparecem]. Warm, informal, everyone
leaning slightly toward the center of the table.
```

**Versão B** (sem as fotos — use esta se o tempo apertar):

```
SCENE: Six friends seen from behind, standing shoulder to shoulder in a loose row, arms over
each other's shoulders, looking away from the viewer. Varied heights and builds. One of them
has a closely shaved head and broad shoulders; two have long wavy hair. No faces visible.
```

### Revelação — O presente  ✅ pronta

```
SCENE: A compact countertop dishwasher, front three-quarter view, resting on a single horizontal
counter line. The door is slightly ajar and through the opening one pull-out rack is visible,
holding three plates on edge. Squat, compact proportions: it sits on top of a counter, it is NOT
a tall built-in under-counter unit. A thin control strip across the top front, drawn as one plain
empty line with no markings, no buttons and no writing on it. Nothing else in the frame: no
kitchen, no cabinets, no floor, no objects around it.
```

Sem logo, sem marca, sem nada que remeta a vitrine de loja.

**Referência:** anexe a foto do aparelho **fechado**. O erro mais provável do modelo é desenhar
uma lava-louças de embutir, alta; a foto fechada mostra a proporção compacta de bancada, que é o
que mais importa acertar. A foto com a porta aberta ajuda no interior, se der para anexar as duas.
Cuidado: as fotos têm a marca escrita no painel, e o modelo tende a copiar — daí o `no writing`
no prompt.

---

## 6. Especificação de saída

| Item | Valor |
|---|---|
| Formato | PNG ou JPG, tanto faz — o tratamento resolve |
| Dimensão | ~1100px no lado maior; **não precisa ser quadrada** — o site usa a proporção real |
| Traço | Preto puro (`#000000`), espessura uniforme |
| Fundo | Branco puro (#FFFFFF), chapado, sem sombra nem gradiente |
| Margem | Nada encosta na borda — deixe ~15% de respiro em volta |
| Peso | Até ~200 KB por arquivo (é linha, comprime muito) |

Nomes exatos, na pasta `img/` do projeto:

```
img/etapa-1.png   img/etapa-2.png   img/etapa-3.png
img/etapa-4.png   img/etapa-5.png   img/presente.png
```

O site funciona sem elas. Se o arquivo não existir, a etapa aparece só com o texto e o layout
não abre buraco. Então pode publicar antes e ir colocando as imagens depois, uma a uma.

---

## 7. Preparar o arquivo

Não jogue a imagem direto em `img/`. Passe por:

```sh
python3 tools/preparar-imagem.py ~/Downloads/imagem.png img/etapa-2.png
```

Se uma linha de chão ou de horizonte atravessar a imagem de ponta a ponta, acrescente
`--focar`. Sem ele, aparar só o vazio não resolve: a proporção fica larguíssima e o assunto
encolhe. Foi o caso do presente — a linha do balcão deixava a proporção em 2.41 e a máquina
saía com 232px de largura na tela; com `--focar`, a proporção caiu para 1.29 e ela passou
a ocupar 223px de largura por 173 de altura.

O script converte o traço para preto puro sobre transparente (a opacidade vem da escuridão
do pixel, o que preserva o antialiasing das linhas finas), **apara as bordas vazias** e reduz
para 1100px.

O corte importa mais do que parece: a imagem da etapa 1 veio 704×1527 e virou 696×431 depois
de aparar — quase dois terços do arquivo eram espaço vazio. Sem isso a ilustração apareceria
minúscula no meio de um bloco em branco.

---

## 7b. Enquadramento: peça sempre paisagem

O site fixa a **altura** das ilustrações e deixa a largura sair da proporção — assim todas as
etapas mostram a imagem na mesma altura e nada abaixo pula de uma tela para a outra. Para o
desenho aproveitar bem essa altura, ele precisa ser mais largo que alto.

Duas frases que passaram a valer para todos os prompts:

- `Tight framing: the subject fills most of the frame` — a da praia veio com dois terços de
  espaço vazio; o corte resolve, mas o enquadramento fica melhor quando não preciso cortar.
- `Landscape orientation, roughly 3:2` mais `no horizon lines running edge to edge` — uma linha
  atravessando a imagem inteira empurra a proporção para 2.4 e o assunto encolhe. Foi o que
  aconteceu com o presente.

## 8. Checklist antes de fechar

Abra as seis lado a lado e confira:

- [ ] A espessura do traço é a mesma nas seis? (o erro mais comum e o mais visível)
- [ ] Todas têm a mesma quantidade de "ar" em volta do assunto?
- [ ] Nenhuma tem preenchimento, sombra ou cinza no meio do desenho?
- [ ] Nenhuma tem texto, número, logo ou assinatura?
- [ ] A etapa 3 não mostra nenhuma máquina?
- [ ] O fundo é transparente de verdade? (abra sobre um fundo escuro para conferir)
- [ ] Bruna e Xand são reconhecíveis pela silhueta nas etapas 1, 2 e 3?
