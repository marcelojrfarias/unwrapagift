#!/usr/bin/env python3
"""Prepara uma ilustração para o site.

    python3 tools/preparar-imagem.py <origem> img/etapa-2.png [--focar]

Faz três coisas que o site precisa e que os geradores raramente entregam:

1. Traço em preto puro sobre fundo transparente. O CSS pinta a cor do tema por
   cima com mask-image, então a cor da imagem é descartada — o que importa é a
   opacidade. Ela vem da escuridão do pixel, o que preserva o antialiasing das
   linhas finas. Por isso peça fundo BRANCO PURO ao gerador: branco vira
   transparente sozinho.

   Pixels quase brancos são zerados de vez (LIMIAR_FUNDO). JPG comprime mal
   perto de linhas finas e deixa um chuvisco cinza em volta do traço; sem o
   corte, esse ruído viraria um véu por cima da tela.
2. Apara as bordas vazias. As imagens costumam vir com muito ar em volta; sem
   aparar, a ilustração aparece pequena no meio de um bloco vazio.
3. Reduz para 1100px de largura.

O site usa a proporção real do arquivo, então não precisa ser quadrada.

Com --focar, corta também as pontas finas: quando uma linha de chão ou de
horizonte atravessa a imagem inteira, aparar só o vazio não adianta — a
proporção fica larguíssima e o assunto encolhe. O corte procura onde está a
massa do desenho e deixa uma sobra da linha de cada lado.
"""
import sys
from PIL import Image

LARGURA_ALVO = 1100
LIMIAR_FUNDO = 236   # acima disso é fundo, não traço


def focar_no_assunto(im):
    """Corta as pontas onde só passa uma linha fina."""
    px = im.load()
    largura, altura = im.size
    tinta = [sum(1 for y in range(altura) if px[x, y][3] > 40) for x in range(largura)]
    pico = max(tinta)
    if pico == 0:
        return im

    limiar = pico * 0.12
    densas = [x for x, t in enumerate(tinta) if t >= limiar]
    if not densas:
        return im

    esq, dir_ = densas[0], densas[-1]
    sobra = round((dir_ - esq) * 0.09)      # um naco de linha de cada lado
    esq = max(0, esq - sobra)
    dir_ = min(largura, dir_ + sobra + 1)
    if dir_ - esq >= largura:
        return im
    print(f'  --focar: largura {largura} -> {dir_ - esq}')
    return im.crop((esq, 0, dir_, altura))


def preparar(origem, destino, focar=False):
    im = Image.open(origem).convert('RGBA')
    largura, altura = im.size
    px = im.load()

    saida = Image.new('RGBA', (largura, altura))
    sp = saida.load()
    for y in range(altura):
        for x in range(largura):
            r, g, b, a = px[x, y]
            luz = 0.2126 * r + 0.7152 * g + 0.0722 * b
            if luz >= LIMIAR_FUNDO:
                sp[x, y] = (0, 0, 0, 0)
                continue
            # reescala para o traço não perder densidade com o corte do fundo
            tinta = (LIMIAR_FUNDO - luz) / LIMIAR_FUNDO * 255
            sp[x, y] = (0, 0, 0, int(round(tinta * (a / 255))))

    caixa = saida.getbbox()
    if caixa is None:
        raise SystemExit('A imagem ficou vazia: o traço provavelmente é claro demais.')
    saida = saida.crop(caixa)

    if focar:
        saida = focar_no_assunto(saida)

    if saida.width > LARGURA_ALVO:
        nova_altura = round(saida.height * LARGURA_ALVO / saida.width)
        saida = saida.resize((LARGURA_ALVO, nova_altura), Image.LANCZOS)

    saida.save(destino, optimize=True)
    print(f'{origem} {im.size} -> {destino} {saida.size} '
          f'(proporção {saida.width / saida.height:.2f})')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 2:
        raise SystemExit(__doc__)
    preparar(args[0], args[1], focar='--focar' in sys.argv)
