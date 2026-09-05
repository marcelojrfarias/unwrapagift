#!/usr/bin/env python3
"""Prepara uma ilustração para o site.

    python3 tools/preparar-imagem.py <origem> img/etapa-2.png

Faz três coisas que o site precisa e que os geradores raramente entregam:

1. Traço em preto puro sobre fundo transparente. O CSS pinta a cor do tema por
   cima com mask-image, então a cor da imagem é descartada — o que importa é a
   opacidade. Ela vem da escuridão do pixel, o que preserva o antialiasing das
   linhas finas.
2. Apara as bordas vazias. As imagens costumam vir com muito ar em volta; sem
   aparar, a ilustração aparece pequena no meio de um bloco vazio.
3. Reduz para 1100px de largura.

O site usa a proporção real do arquivo, então não precisa ser quadrada.
"""
import sys
from PIL import Image

LARGURA_ALVO = 1100


def preparar(origem, destino):
    im = Image.open(origem).convert('RGBA')
    largura, altura = im.size
    px = im.load()

    saida = Image.new('RGBA', (largura, altura))
    sp = saida.load()
    for y in range(altura):
        for x in range(largura):
            r, g, b, a = px[x, y]
            luz = 0.2126 * r + 0.7152 * g + 0.0722 * b
            sp[x, y] = (0, 0, 0, int(round((255 - luz) * (a / 255))))

    caixa = saida.getbbox()
    if caixa is None:
        raise SystemExit('A imagem ficou vazia: o traço provavelmente é claro demais.')
    saida = saida.crop(caixa)

    if saida.width > LARGURA_ALVO:
        nova_altura = round(saida.height * LARGURA_ALVO / saida.width)
        saida = saida.resize((LARGURA_ALVO, nova_altura), Image.LANCZOS)

    saida.save(destino, optimize=True)
    print(f'{origem} {im.size} -> {destino} {saida.size} '
          f'(proporção {saida.width / saida.height:.2f})')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    preparar(sys.argv[1], sys.argv[2])
