# Site VPPN — Contexto técnico detalhado

## Status
- **LIVE** em thiagoberaldo.com/vppn/
- Arquivo principal: `vppn/index.html`
- Hosting: Cloudflare Pages (project: paginas-vppn)
- GitHub: rafaelucci10/Paginas-VPPN (branch main)

---

## Tecnologias

- HTML5 + CSS3 + JS — tudo em um único arquivo `vppn/index.html`
- Fontes self-hosted: `fonts/fonts.css` (Fraunces + Plus Jakarta Sans em woff2)
- Sem frameworks externos
- Imagens locais em `vppn/images/` (todas WebP)

---

## Vídeos — VTurb Facade

O VSL carrega imediatamente. Os outros 7 vídeos usam **facade** (thumbnail local + player carrega só ao clicar).

### Função vtPlay()
```javascript
function vtPlay(el){
  const src = el.getAttribute('data-psrc');
  const vid = el.getAttribute('data-vid');
  const player = document.createElement('vturb-smartplayer');
  player.id = vid;
  player.style.cssText = 'display:block;margin:0 auto;width:100%;';
  el.parentNode.replaceChild(player, el);
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}
```

### HTML do facade (padrão)
```html
<div class="vt-facade" onclick="vtPlay(this)"
  data-psrc="https://scripts.converteai.net/3557a022-cd7d-4f0d-a446-8306d693def2/players/{ID}/v4/player.js"
  data-vid="vid-{ID}">
  <img src="images/thumbnail.webp" alt="" loading="lazy">
  <button class="vt-play" aria-label="Assistir">
    <svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
  </button>
</div>
```

### VSL (carregamento imediato, no head)
```html
<div class="hero__video yt--shadow">
  <vturb-smartplayer id="vid-6a01353ff18251980def0e70" style="display:block;margin:0 auto;width:100%;"></vturb-smartplayer>
  <script>var s=document.createElement("script");s.src="https://scripts.converteai.net/3557a022-cd7d-4f0d-a446-8306d693def2/players/6a01353ff18251980def0e70/v4/player.js",s.async=!0,document.head.appendChild(s);</script>
</div>
```

---

## Carrosseis infinitos

3 carrosseis em JS puro com triplicação de slides + wrap automático.

```
wapp (WhatsApp):       mobile=1, tablet=2, desktop=3
logos (empreendimentos): mobile=2, tablet=3, desktop=5
deps (depoimentos):    mobile=1, tablet=2, desktop=4
```

---

## Seções em ordem

| # | Seção | Fundo |
|---|---|---|
| 1 | Hero | Verde escuro — VSL VTurb + bullets + CTA |
| 2 | Ícones | Bege escuro — 5 ícones SVG |
| 3 | Trust bar | Verde médio — 4 credenciais |
| 4 | O que é o Método | Bege claro |
| 5 | Para quem é | Verde escuro |
| 6 | Calculadora IAT | Bege escuro — imagem WebP local |
| 7 | Turismo cresce | Verde escuro — carrossel WhatsApp |
| 8 | Empreendimentos | Bege escuro — carrossel logos |
| 9 | Depoimentos | Branco — carrossel prints + 4 Shorts facade |
| 10 | Silvestre IA | Bege escuro |
| 11 | Nova forma de viver | Verde escuro — 3 vídeos depoimento facade (3 colunas iguais) |
| 12 | Comparação | Bege claro — 2 colunas |
| 13 | Trilha dos ciclos | Bege escuro — zigzag 5 ciclos |
| 14 | Passos do método | Verde escuro — 3 passos |
| 15 | Bônus | Verde médio — 2 cards |
| 16 | Suporte | Bege escuro — imagem + garantia |
| 17 | Pricing | Bege claro — 12x R$149,96 ou R$1.450 à vista |
| 18 | Bio Thiago | Verde escuro — 2 fotos |
| 19 | FAQ | Bege escuro — accordion + WhatsApp |
| 20 | CTA Final | Verde escuro |
| 21 | Footer | Preto |

---

## Imagens locais (vppn/images/)

| Arquivo | Uso | Tamanho |
|---|---|---|
| `Gemini_Generated_Image_fwq2nafwq2nafwq2.webp` | IAT section principal | 40KB |
| `Gemini_Generated_Image_fwq2nafwq2nafwq2-768x665.webp` | Passo 1 | 38KB |
| `dep-connie.webp` | Facade depoimento Connie | 51KB |
| `dep-bernardo.webp` | Facade depoimento Bernardo | 26KB |
| `dep-sheila.webp` | Facade depoimento Sheila | 57KB |
| `short-n8idoIxLt0Q.webp` | Facade Short 1 | 70KB |
| `short-5Nw-vS3Z508.webp` | Facade Short 2 | 39KB |
| `short-l9z2mJuwvEs.webp` | Facade Short 3 | 70KB |
| `short-KGYffErFWU.webp` | Facade Short 4 | 47KB |
| `vivendo_de-3_copy-1-768x285.png` | Logo (PNG — WebP ficou maior) | 30KB |

Thumbnails dos facades: baixados do YouTube (1280×720) e convertidos para WebP com `cwebp -q 85`.

---

## Meta Pixel

```html
<!-- Meta Pixel -->
<script>!function(f,b,e,v,n,t,s){...}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1358655868587428');
fbq('track','PageView');</script>
```

- `InitiateCheckout` em todos os botões Hotmart (`onclick="fbq('track','InitiateCheckout')"`)
- `Contact` em todos os botões WhatsApp (`onclick="fbq('track','Contact')"`)

---

## Performance — decisões técnicas

| Problema | Solução |
|---|---|
| 8 scripts VTurb no load | Facade: só VSL carrega, outros 7 carregam ao clicar |
| Gemini PNG 2.2MB | Convertido para WebP: 40KB (-98%) |
| CLS 0.299 no hero | `aspect-ratio:16/9` no `.hero__video` |
| Fontes bloqueando render | `<link rel="preload" as="style" onload="...">` |
| Thumbnails VTurb borrados | Substituídos por thumbnails YouTube locais em WebP |

---

## Seção depoimentos — layout 3 colunas

Alterado de 2 colunas (2 cards esquerda + 1 card esticado direita) para **3 colunas iguais** com `align-items:start`. Elimina espaço vazio abaixo do card Sheila.

```css
.nf-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;align-items:start}
/* Colapsa para 1 coluna em ≤960px */
```

---

## Pendências

- [ ] Testar em mobile real (iPhone e Android)
- [ ] Configurar redirect thiagodovalberaldo.com.br → thiagoberaldo.com/vppn/ (plugin Redirection no WP)
- [ ] Verificar connect rate no Facebook após pixel ativo
- [ ] Instalar pixel também em obrigado-vppn/ e seu-acesso/
