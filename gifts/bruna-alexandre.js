/* Conteúdo do presente. Só dados — nenhuma lógica mora aqui.
   Os campos de texto aceitam HTML simples (<br>, <em>). */

window.GIFT = {
  theme: 'botanico',

  recipients: [
    { name: 'Bruna',     short: 'Bruna'     },
    { name: 'Alexandre', short: 'Alexandre' }
  ],

  senders: ['Ari', 'Giu', 'Natanzinho', 'Marcelo'],

  /* Quanto tempo os dois precisam segurar, em ms. */
  holdMs: 2200,

  cover: {
    eyebrow: 'Um presente de casamento para',
    title:   'Bruna<br>e Alexandre',
    desc:    'De Ari, Giu, Natanzinho e Marcelo.',
    img:     '../img/capa.png',
    cta:     'Pressionem ao mesmo tempo para desembrulhar'
  },

  steps: [
    {
      title: 'Antes de qualquer coisa, este presente é tempo para vocês dois',
      desc:  'Pra tomar uma cerveja gelada, explorar São Paulo, viajar o mundo, pra namorar...',
      img:   '../img/etapa-1.png',
      cta:   'Continuar desembrulhando'
    },
    {
      title: 'É tempo para construir o que vocês já estão construindo',
      desc:  'A carreira, a próxima loja, a casa que virou lar e a família que estão começando.',
      img:   '../img/etapa-2.png',
      cta:   'Tem mais'
    },
    {
      title: 'É uma tarefa a menos para dividir',
      desc:  'Toda casa tem a conversa sobre de quem é a vez. Essa aqui a gente já resolveu por vocês.',
      img:   '../img/etapa-3.png',
      cta:   'Quase lá'
    },
    {
      title: 'É não ter que pôr a mão na água gelada no inverno',
      desc:  'Nenhum dos dois vai ter que lavar panela no frio',
      img:   '../img/etapa-4.png',
      cta:   'Falta pouco'
    },
    {
      title: 'É tempo que sobra para a família e os amigos',
      desc:  'Incluindo a gente, óbvio. Já estamos nos convidando pro próximo jantar na casa nova haha',
      img:   '../img/etapa-5.png',
      cta:   'Abrir'
    }
  ],

  reveal: {
    kind:      'O presente',
    name:      'Uma lava-louças',
    img:       '../img/presente.png',
    msg:       'E umas 200 horas por ano de volta, para usar do jeito que quiserem',
    signoff:   'Com carinho,',
    signature: 'Ari, Giu, Natanzinho e Marcelo'
  }
};
