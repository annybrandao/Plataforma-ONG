const templates = {
  index: `
    <section>
      <h2>Quem Somos</h2>
      <p>A ONG Esperança Viva atua há mais de 10 anos promovendo a inclusão social e o desenvolvimento de comunidades carentes. Trabalhamos com projetos voltados à educação, saúde e meio ambiente.</p>
      <img src="imagens/Voluntarios.jpg" alt="Voluntários em ação" style="max-width:100%;height:auto;">
    </section>
  `,
  projetos: `
    <section>
      <h2>Nossos Projetos</h2>
      <div class="cards">
        <article class="card">
          <img src="imagens/projeto1.webp" alt="Projeto" />
          <div class="card-content"><h3>Projeto Sementes do Futuro</h3><p>Oferece aulas de reforço escolar e oficinas culturais para crianças em situação de vulnerabilidade.</p></div>
        </article>
        <article class="card">
          <img src="imagens/projeto2.jpg" alt="Projeto" />
          <div class="card-content"><h3>Projeto Verde Vida</h3><p>Promove ações de sustentabilidade e educação ambiental em comunidades urbanas.</p></div>
        </article>
      </div>
    </section>
  `,
  cadastro: `
    <section>
      <h2>Cadastro de Voluntário</h2>
      <form id="form-cadastro" novalidate>
        <fieldset>
          <legend>Informações Pessoais</legend>

          <label for="nome">Nome Completo</label>
          <input type="text" id="nome" name="nome" required>

          <label for="email">E-mail</label>
          <input type="email" id="email" name="email" required>

          <label for="cpf">CPF</label>
          <input type="text" id="cpf" name="cpf" required pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" placeholder="000.000.000-00" maxlength="14">

          <label for="telefone">Telefone</label>
          <input type="tel" id="telefone" name="telefone" required pattern="\\(\\d{2}\\)\\s?\\d{4,5}-\\d{4}" placeholder="(00) 00000-0000" maxlength="15">

          <label for="nascimento">Data de Nascimento</label>
          <input type="date" id="nascimento" name="nascimento" required>
        </fieldset>

        <fieldset>
          <legend>Endereço</legend>

          <label for="endereco">Endereço</label>
          <input type="text" id="endereco" name="endereco" required>

          <label for="cep">CEP</label>
          <input type="text" id="cep" name="cep" required pattern="\\d{5}-\\d{3}" placeholder="00000-000" maxlength="9">

          <label for="cidade">Cidade</label>
          <input type="text" id="cidade" name="cidade" required>

          <label for="estado">Estado</label>
          <select id="estado" name="estado" required>
            <option value="">Selecione</option>
            <option>GO</option><option>RJ</option><option>MG</option><option>BA</option><option>SP</option><option>RS</option>
          </select>
        </fieldset>

        <div id="alerta" class="alert" style="display:none;"></div>
        <button type="submit">Enviar Cadastro</button>
      </form>
    </section>
  `,
  contato: `
    <section>
      <h2>Fale Conosco</h2>
      <p>Email: <a href="mailto:contato@esperancaviva.org">contato@esperancaviva.org</a></p>
      <p>Telefone: (11) 4002-8922</p>
      <p>Endereço: Rua da Solidariedade, 123 - São Paulo, SP</p>
    </section>
  `
};

function loadPage(page) {
  const main = document.getElementById('main-content');
  if (!main) return console.error('main-content não encontrado');
  main.innerHTML = templates[page] || '<p>Página não encontrada.</p>';
  if (page === 'cadastro') setupCadastro(); // reativa lógica do formulário
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[data-page]');
    if (!a) return;
    ev.preventDefault();
    const page = a.getAttribute('data-page');
    loadPage(page);
    history.pushState({page}, '', '#' + page);
  });

  const initial = location.hash.replace('#','') || 'index';
  loadPage(initial);

  window.addEventListener('popstate', (ev) => {
    const page = (ev.state && ev.state.page) || 'index';
    loadPage(page);
  });
});

function setupCadastro() {
  const form = document.getElementById('form-cadastro');
  const alerta = document.getElementById('alerta');
  if (!form) return console.warn('form-cadastro não encontrado');

  // helper: aplicar máscara usando regex replacements
  const maskCPF = (v) => v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2').slice(0,14);
  const maskTel = (v) => {
    const digits = v.replace(/\D/g,'').slice(0,11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2' + (digits.length>6? '-$3':'')).trim();
    } else {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');
    }
  };
  const maskCEP = (v) => v.replace(/\D/g,'').replace(/(\d{5})(\d)/,'$1-$2').slice(0,9);

  const cpfEl = document.getElementById('cpf');
  const telEl = document.getElementById('telefone');
  const cepEl = document.getElementById('cep');

  [cpfEl, telEl, cepEl].forEach(el => {
    if (!el) return;
    el.oninput = null;
    el.onblur = null;
  });

  if (cpfEl) cpfEl.addEventListener('input', (e) => { e.target.value = maskCPF(e.target.value); });
  if (telEl) telEl.addEventListener('input', (e) => { e.target.value = maskTel(e.target.value); });
  if (cepEl) cepEl.addEventListener('input', (e) => { e.target.value = maskCEP(e.target.value); });

  form.onsubmit = null;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alerta.style.display = 'none';

    const campos = Array.from(form.querySelectorAll('input, select'));
    let valido = true;
    campos.forEach(campo => {
      campo.classList.remove('invalid');
      if (!campo.checkValidity()) {
        valido = false;
        campo.classList.add('invalid');
      }
    });

    if (!valido) {
      const primeiro = form.querySelector('.invalid');
      let mensagem = 'Por favor corrija os campos destacados.';
      if (primeiro) {
        if (primeiro.id === 'cpf') mensagem = 'CPF inválido. Formato esperado: 000.000.000-00';
        else if (primeiro.id === 'telefone') mensagem = 'Telefone inválido. Use (00) 00000-0000';
        else if (primeiro.id === 'cep') mensagem = 'CEP inválido. Use 00000-000';
        else if (primeiro.type === 'email') mensagem = 'E-mail inválido.';
        else mensagem = 'Preencha o campo: ' + (primeiro.previousElementSibling ? primeiro.previousElementSibling.textContent : primeiro.name);
      }
      alerta.textContent = mensagem;
      alerta.style.display = 'block';
      alerta.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--laranja') || '#fb8c00';
      return;
    }

    const dados = Object.fromEntries(new FormData(form).entries());
    const lista = JSON.parse(localStorage.getItem('cadastros') || '[]');
    lista.push(dados);
    localStorage.setItem('cadastros', JSON.stringify(lista));

    alerta.textContent = 'Cadastro enviado com sucesso!';
    alerta.style.display = 'block';
    alerta.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--verde-principal') || '#2e7d32';
    form.reset();
  });
}