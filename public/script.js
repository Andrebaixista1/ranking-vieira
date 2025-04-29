let intervaloPodio;
const API_BASE_URL = 'http://26.87.3.24:3010'; // URL base do seu backend

// Elemento de loading
function createLoader() {
  const loader = document.createElement('div');
  loader.id = 'loading-indicator';
  loader.style.position = 'fixed';
  loader.style.top = '20px';
  loader.style.right = '20px';
  loader.style.padding = '10px';
  loader.style.background = 'rgba(0,0,0,0.7)';
  loader.style.color = 'white';
  loader.style.borderRadius = '5px';
  loader.style.display = 'none';
  document.body.appendChild(loader);
  return loader;
}

// Elemento de erro
function createErrorElement() {
  const errorDiv = document.createElement('div');
  errorDiv.id = 'error-message';
  errorDiv.style.position = 'fixed';
  errorDiv.style.bottom = '20px';
  errorDiv.style.left = '50%';
  errorDiv.style.transform = 'translateX(-50%)';
  errorDiv.style.padding = '15px';
  errorDiv.style.background = '#ff4444';
  errorDiv.style.color = 'white';
  errorDiv.style.borderRadius = '5px';
  errorDiv.style.zIndex = '1000';
  errorDiv.style.display = 'none';
  document.body.appendChild(errorDiv);
  return errorDiv;
}

// Mostra/oculta loader
function toggleLoader(show) {
  const loader = document.getElementById('loading-indicator') || createLoader();
  loader.textContent = 'Carregando dados...';
  loader.style.display = show ? 'block' : 'none';
}

// Mostra mensagem de erro
function showError(message) {
  const errorDiv = document.getElementById('error-message') || createErrorElement();
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => errorDiv.style.display = 'none', 5000);
}

async function carregarResultados() {
  toggleLoader(true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/ranking`);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    
    const dados = await response.json();
    
    if (!dados || typeof dados !== 'object') {
      throw new Error('Dados recebidos são inválidos');
    }

    /* Transforma os dados em array */
    const equipes = Object.entries(dados).map(([nome, valor]) => ({
      nome,
      valor: parseFloat(valor) || 0
    }));

    /* Ordena por valor decrescente */
    equipes.sort((a, b) => b.valor - a.valor);

    // Atualiza o pódio
    if (equipes.length === 0) {
      showError("Nenhum dado disponível no ranking.");
      return;
    }
    
    const [primeiro, segundo, terceiro] = equipes;

    // Atualiza primeiro lugar
    if (primeiro) {
      const primeiroElement = document.getElementById('barraPrimeiro');
      if (primeiroElement) {
        primeiroElement.style.height = `150px`;
        document.getElementById('nomePrimeiro').textContent = primeiro.nome;
        document.getElementById('valorPrimeiro').textContent = 
          `R$ ${primeiro.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }
    }
    
    // Atualiza segundo lugar
    if (segundo) {
      const segundoElement = document.getElementById('barraSegundo');
      if (segundoElement) {
        const altura = primeiro.valor > 0 ? (segundo.valor / primeiro.valor) * 150 : 0;
        segundoElement.style.height = `${altura}px`;
        document.getElementById('nomeSegundo').textContent = segundo.nome;
        document.getElementById('valorSegundo').textContent = 
          `R$ ${segundo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }
    }
    
    // Atualiza terceiro lugar
    if (terceiro) {
      const terceiroElement = document.getElementById('barraTerceiro');
      if (terceiroElement) {
        const altura = primeiro.valor > 0 ? (terceiro.valor / primeiro.valor) * 150 : 0;
        terceiroElement.style.height = `${altura}px`;
        document.getElementById('nomeTerceiro').textContent = terceiro.nome;
        document.getElementById('valorTerceiro').textContent = 
          `R$ ${terceiro.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }
    }

    // Atualiza o Top 10
    const lista = document.querySelector('.topDez');
    if (lista) {
      lista.innerHTML = '';

      for (let i = 3; i < Math.min(equipes.length, 10); i++) {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.padding = '8px 0';

        const posicao = document.createElement('span');
        posicao.textContent = `${i + 1}º`;
        posicao.style.width = '50px';
        posicao.style.textAlign = 'left';

        const nome = document.createElement('span');
        nome.textContent = equipes[i].nome;
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
    }

    iniciarLoopPodio();

  } catch (erro) {
    console.error('Erro detalhado:', {
      message: erro.message,
      stack: erro.stack,
      name: erro.name
    });
    showError('Falha ao carregar ranking. Tentando novamente...');
    
    // Tenta novamente após 30 segundos
    setTimeout(carregarResultados, 30000);
  } finally {
    toggleLoader(false);
  }
}

function iniciarLoopPodio() {
  const terceiro = document.querySelector('.lugar.terceiro');
  const segundo = document.querySelector('.lugar.segundo');
  const primeiro = document.querySelector('.lugar.primeiro');

  if (!primeiro || !segundo || !terceiro) {
    console.error("Elementos do pódio não encontrados.");
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
  // Cria elementos de UI
  createLoader();
  createErrorElement();
  
  // Carrega dados imediatamente
  carregarResultados();

  // Atualiza dados a cada 1 minuto
  setInterval(carregarResultados, 60000);
});