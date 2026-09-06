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

**A cabeça dele fica em contorno, só a barba é preenchida.** O corte real é degradê — escuro no
topo, raspado nas laterais — mas em traço a 126px essa diferença não se lê, e o que carrega a
identidade dele é a barba. Padronizar no contorno limpo custa uma imagem em vez de três e não
perde reconhecimento.

O risco a vigiar é o oposto: ao pedir preenchimento para o cabelo dela, o gerador tende a
preencher a cabeça dele junto e o Xand aparece de cabeleira. Daí `no black shape on his head` no
descritor e `man with a full head of hair` no negativo.

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
NEGATIVE: outlined-only beard, empty beard, outlined-only hair, man with a full head of hair,
filled-in hair on the man, color, shading, gradient,
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
| **Bruna** | `a tall slim woman with long dark wavy hair filled in as a solid black shape, falling well past her shoulders` | `IMG_4393`, `IMG_4394`, `IMG_4395` |
| **Alexandre (Xand)** | `a tall, lean, slim-built man with very short cropped hair drawn as clean outline only (no black shape on his head) and a FULL SOLID BLACK BEARD filled in as a dark shape, wearing an oversized t-shirt that adds bulk to his slim frame` | `IMG_4391`, `IMG_4396`, `IMG_4397` |

### Os outros quatro

Numa cena com seis pessoas o problema deixa de ser semelhança e passa a ser **distinção**: se dois
saem parecidos, a imagem perde o sentido. A divisão abaixo dá a cada um uma silhueta própria.

| Pessoa | Descritor | Marca que o separa |
|---|---|---|
| **Ariane** | `the shortest of the six, a short slim woman with very long straight dark hair filled solid black — a straight silhouette with no waves` | cabelo liso e reto; a mais baixa |
| **Giu** | `a woman of average height with a fuller, curvier build, dark hair tied up in a bun filled solid black — compact silhouette, no hair on her shoulders` | cabelo preso |
| **Natan** | `a man of average height with a stocky, solid, heavier build, short dark curly hair and a short cropped beard, both outline only, no glasses` | sem óculos; o mais encorpado |
| **Marcelo** | `a tall man of average build, with voluminous dark curly hair in outline, a goatee, and thick rectangular glasses in outline` | óculos |

Duas regras que sustentam isso:

- **Só a Bruna, a Ari e a Giu têm preenchimento de cabelo**, cada uma com um formato diferente:
  ondulado longo, liso longo, preso. Três variações de "cabelo escuro solto" não se distinguiriam.
- **Cada homem tem um tipo de mancha preta diferente, e só um tipo.** Marcelo é o único com o
  cabelo preenchido; Alexandre o único com a barba preenchida; Natan não tem nenhuma das duas.
  Massa preta em cima, massa preta embaixo, nenhuma massa — três leituras distintas. Óculos e
  barba curta ficam sempre em contorno, senão os três viram o mesmo homem no tamanho real.

**Alturas** (do mais alto ao mais baixo): Alexandre, Marcelo (quase igual), Natan, Giu e Bruna
(quase iguais), Ariane (a mais baixa). **Portes:** Alexandre alto e magro, Bruna alta e magra,
Ariane baixinha e magra, Marcelo alto de porte médio, Natan médio e encorpado, Giu mais encorpada.

Numa cena com seis, altura e porte carregam tanto quanto o cabelo — e o modelo tende a desenhar
um corpo só e repetir. Daí `everyone the same build` no negativo, junto de `everyone the same
height`.

> Correção: até a etapa 4 eu descrevi o Alexandre como `broad-shouldered`. Ele é alto e magro — o
> volume vem da camiseta oversized. As cinco imagens já publicadas seguem válidas porque a
> silhueta larga vinha da roupa, mas o descritor certo é o desta tabela.

---

## 5. Os prompts, etapa por etapa

Monte cada um assim: **`[BLOCO DE ESTILO]` + `SCENE:` + `[NEGATIVO]`**

### Etapa 1 — Tempo de qualidade  ✅ pronta

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

### Etapa 4 — Água gelada  ✅ pronta

```
SCENE: A man alone at a kitchen sink, seen from a three-quarter front view, washing a single
cooking pot under a running tap. He is wearing a hooded sweatshirt with the hood up over his head
and long sleeves pushed up at the wrists, shoulders slightly hunched — he is cold. Water falls
from the tap as four or five thin lines. He is tall and broad-shouldered, with a FULL SOLID BLACK
BEARD; his face and hood are clean outline only. Only the pot, the tap, the water and a single
sink line are drawn, and the sink line stops inside the frame on both sides.
```

Três decisões que valeram:

- **Panela, não prato.** A copy fala em panela, e a etapa 3 já é a dos pratos — sem isso as duas
  cozinhas virariam a mesma imagem.
- **Moletom com capuz**, não "roupa de frio" genérica. Precisa ler como frio em meio segundo, sem
  cor e a 126px. O capuz veio caído nos ombros em vez de na cabeça e ainda assim funcionou: a
  silhueta encorpada e o cordão bastam para diferenciar da camiseta das outras.
- `steam` e `hot water` **no negativo**: vapor é o clichê de louça e diria o oposto do que a etapa
  precisa dizer.

Ele sozinho não contradiz a etapa 3: lá o casal divide, aqui alguém enfrenta a água gelada
mesmo dividindo.

### Etapa 5 — Os seis  ✅ pronta

```
SCENE: Six friends standing shoulder to shoulder in a single row, facing the viewer, all raising
a glass together in a toast. From left to right: [Marcelo], [Ariane], [Bruna], [Alexandre],
[Giu], [Natan] — use os descritores das tabelas acima, na íntegra. Only the six figures and their
raised glasses are drawn. No table, no chairs, no room, no floor line.
```

**Sem mesa, de propósito.** A copy fala do primeiro jantar na casa nova e uma mesa posta casaria
com isso, mas a 126px de altura seis pessoas mais uma mesa viram uma mancha. Em pé, cada figura
fica com ~35px de largura e a silhueta do cabelo ainda lê. O brinde sozinho entrega o jantar.

**A ordem é por casais** — Marcelo e Ari, Bruna e Xand, Giu e Natan — com o casal do presente no
meio. Ela resolve um risco de leitura de brinde: Marcelo e Natan, os dois mais parecidos entre si
(cabelo escuro encaracolado, barba curta), ficam nas duas pontas, o mais longe possível um do
outro. E a linha das cabeças vira um zigue-zague em vez de uma escada.

Acrescente ao negativo desta cena: `glasses on more than one man`, `full beards on more than one
man`, `identical hairstyles`, `two women with the same hair`, `everyone the same height`,
`everyone the same build`. É o erro típico com seis pessoas — o modelo replica um traço marcante
em todo mundo e apaga a distinção.

E repita a exclusividade **dentro da descrição de cada um** (`He is the only one wearing glasses`,
`He is the only one with a full beard`), não só no negativo: o modelo lê a lista de cima para
baixo e tende a esquecer restrições que ficaram longe.

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
