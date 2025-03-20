let intervaloPodio;

async function carregarResultados() {
  try {
    const res = await fetch('/api/ranking');
    const dados = await res.json();
    console.log(dados);

    /* ✅ Transforma os dados dinâmicos em array */
    const equipes = Object.entries(dados).map(([nome, valor]) => ({
      nome,
      valor
    }));
    console.log(equipes);

    /* ✅ Ordena por valor decrescente */
    equipes.sort((a, b) => b.valor - a.valor);

    // Atualiza o pódio
    if (equipes.length === 0) {
      console.warn("Nenhum dado retornado pela API.");
      return;
    }
    
    const [primeiro, segundo, terceiro] = equipes;

    
    if (primeiro) {
      document.getElementById('barraPrimeiro').style.height = `150px`;
      document.getElementById('nomePrimeiro').textContent = primeiro.nome
      document.getElementById('valorPrimeiro').textContent = `R$ ${primeiro.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    
    if (segundo) {
      document.getElementById('barraSegundo').style.height = `${(segundo.valor / primeiro.valor) * 150}px`;
      document.getElementById('nomeSegundo').textContent = segundo.nome
      document.getElementById('valorSegundo').textContent = `R$ ${segundo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    
    if (terceiro) {
      document.getElementById('barraTerceiro').style.height = `${(terceiro.valor / primeiro.valor) * 150}px`;
      document.getElementById('nomeTerceiro').textContent = terceiro.nome
      document.getElementById('valorTerceiro').textContent = `R$ ${terceiro.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }    

    // Atualiza o Top 10
    const lista = document.querySelector('.topDez');
    lista.innerHTML = '';

    for (let i = 3; i < Math.min(equipes.length, 10); i++) {
      const li = document.createElement('li');

      const posicao = document.createElement('span');
      posicao.textContent = `${i + 1}º`;
      posicao.style.width = '50px';
      posicao.style.textAlign = 'left';

      const nome = document.createElement('span');
      nome.textContent = equipes[i].nome
      nome.style.flexGrow = '1';
      nome.style.textAlign = 'center';

      const valor = document.createElement('span');
      valor.textContent = `R$ ${equipes[i].valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      valor.style.width = '150px';
      valor.style.textAlign = 'right';

      li.appendChild(posicao);
      li.appendChild(nome);
      li.appendChild(valor);

      lista.appendChild(li);
    }

    iniciarLoopPodio();

  } catch (erro) {
    console.error('Erro ao carregar os dados:', erro);
  }
}

function iniciarLoopPodio() {
  const terceiro = document.querySelector('.lugar.terceiro');
  const segundo = document.querySelector('.lugar.segundo');
  const primeiro = document.querySelector('.lugar.primeiro');

  if (!primeiro || !segundo || !terceiro) {
    console.error("Um dos elementos do pódio não foi encontrado.");
    return;
  }

  clearInterval(intervaloPodio);

  const lugares = [terceiro, segundo, primeiro];
  let index = 0;

  intervaloPodio = setInterval(() => {
    lugares.forEach(lugar => lugar.classList.remove('destacado'));
    lugares[index].classList.add('destacado');
    index = (index + 1) % lugares.length;
  }, 1800);
}

// Inicia tudo ao carregar
window.addEventListener('load', () => {
  carregarResultados();

  // Atualiza dados a cada 1 minuto
  setInterval(() => {
    carregarResultados();
  }, 60000);
});