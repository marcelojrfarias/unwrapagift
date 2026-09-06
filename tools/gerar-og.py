#!/usr/bin/env python3
"""Gera a imagem de preview (Open Graph) a partir da ilustração da capa.

    python3 tools/gerar-og.py

A ilustração é preta sobre transparente, então não serve direto: no WhatsApp
a transparência vira preto. Aqui ela é composta sobre o papel do tema e
recolorida no verde, junto do nome em Cormorant Garamond — a mesma fonte do
site, para o preview e a capa parecerem a mesma coisa.
"""
import os
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L, A = 1200, 630
PAPEL, SAGE, TINTA, MUTED, DOURADO = (251,250,247), (138,156,126), (38,55,43), (107,114,99), (217,196,139)

EYEBROW = 'U M   P R E S E N T E   P A R A   D E S E M B R U L H A R'
NOME    = 'Bruna e Alexandre'


def cormorant(tamanho):
    f = ImageFont.truetype(os.path.join(RAIZ, 'tools/fontes/cormorant.ttf'), tamanho)
    try:
        f.set_variation_by_axes([300])   # light, como no site
    except Exception:
        pass
    return f


def gerar():
    og = Image.new('RGB', (L, A), PAPEL)
    d = ImageDraw.Draw(og)

    def centro(txt, f, y, cor):
        x0, y0, x1, y1 = d.textbbox((0, 0), txt, font=f)
        d.text(((L - (x1 - x0)) // 2 - x0, y - y0), txt, font=f, fill=cor)
        return y + (y1 - y0)

    sans = ImageFont.truetype('/System/Library/Fonts/Supplemental/Futura.ttc', 20)
    centro(EYEBROW, sans, 84, MUTED)
    fim = centro(NOME, cormorant(76), 124, TINTA)

    filete = fim + 30
    d.line([(L//2 - 32, filete), (L//2 + 32, filete)], fill=DOURADO, width=2)

    arte = Image.open(os.path.join(RAIZ, 'img/capa.png')).convert('RGBA')
    alvo = 300
    largura = round(arte.width * alvo / arte.height)
    arte = arte.resize((largura, alvo), Image.LANCZOS)
    verde = Image.new('RGBA', arte.size, SAGE + (0,))
    verde.putalpha(arte.getchannel('A'))
    og.paste(verde, ((L - largura) // 2, filete + 28), verde)

    destino = os.path.join(RAIZ, 'img/og.png')
    og.save(destino, optimize=True)
    print(f'{destino} {og.size} {os.path.getsize(destino)//1024} KB')


if __name__ == '__main__':
    gerar()
