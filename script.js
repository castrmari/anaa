/* ==========================================================
   Site de Formatura da Ana Lívia — Interatividade
   O mesmo arquivo atende às duas páginas: cada bloco só roda
   se os elementos dele existirem na página aberta.
   ========================================================== */

const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

function lerPreferencia(chave) {
  try { return localStorage.getItem(chave); } catch { return null; }
}
function salvarPreferencia(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch { /* navegação privada */ }
}

/* ---------- 1. Tema claro / escuro ---------- */
const temaBtn = $("#temaBtn");

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  temaBtn.textContent = tema === "escuro" ? "☀️" : "🌙";
}

aplicarTema(lerPreferencia("tema") ||
  (matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro"));

temaBtn.addEventListener("click", () => {
  const novo = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
  aplicarTema(novo);
  salvarPreferencia("tema", novo);
});

/* ---------- 2. Menu mobile ---------- */
const menuBtn = $("#menuBtn");
const navLinks = $("#navLinks");

menuBtn.addEventListener("click", () => {
  const aberto = navLinks.classList.toggle("aberto");
  menuBtn.setAttribute("aria-expanded", aberto);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && navLinks.classList.contains("aberto")) {
    navLinks.classList.remove("aberto");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

/* ---------- 3. Barra de progresso e botão "voltar ao topo" ---------- */
const barra = $("#barraProgresso");
const voltarTopo = $("#voltarTopo");

window.addEventListener("scroll", () => {
  const total = document.documentElement.scrollHeight - innerHeight;
  barra.style.width = `${total > 0 ? (scrollY / total) * 100 : 0}%`;
  voltarTopo.classList.toggle("mostrar", scrollY > 600);
}, { passive: true });

voltarTopo.addEventListener("click", () => scrollTo({ top: 0 }));

/* ---------- 4. Animações ao rolar e contadores ---------- */
function animarContador(el) {
  const alvo = Number(el.dataset.contar);
  const inicio = performance.now();
  function passo(agora) {
    const progresso = Math.min((agora - inicio) / 1200, 1);
    el.textContent = Math.round(alvo * progresso);
    if (progresso < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

function revelar(el) {
  if (el.dataset.contar) animarContador(el);
  else el.classList.add("visivel");
}

if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      revelar(entrada.target);
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  $$(".revelar, [data-contar]").forEach(el => observador.observe(el));
} else {
  $$(".revelar, [data-contar]").forEach(revelar);
}

/* ---------- 5. Efeito de digitação (página da jornada) ---------- */
const digitando = $("#digitando");
if (digitando) {
  const frases = [
    "Formanda do Ensino Médio 🎓",
    "Pronta para o próximo capítulo 🚀"
  ];
  let iFrase = 0, iLetra = 0, apagando = false;

  (function digitar() {
    const letras = [...frases[iFrase]];          // separa emojis corretamente
    digitando.textContent = letras.slice(0, iLetra).join("");

    if (!apagando && iLetra < letras.length) iLetra++;
    else if (apagando && iLetra > 0) iLetra--;
    else if (!apagando) { apagando = true; return setTimeout(digitar, 1800); }
    else { apagando = false; iFrase = (iFrase + 1) % frases.length; }

    setTimeout(digitar, apagando ? 35 : 70);
  })();
}

/* ---------- 6. Linha do tempo: sanfona "Ver mais" e filtro ---------- */
$$(".detalhes").forEach(det => {
  const interno = document.createElement("div");
  interno.className = "detalhes-interno";
  interno.append(...det.childNodes);
  det.append(interno);
});

$$(".ver-mais").forEach(botao => {
  botao.addEventListener("click", () => {
    const aberto = botao.nextElementSibling.classList.toggle("aberto");
    botao.setAttribute("aria-expanded", aberto);
    botao.textContent = aberto ? "Ver menos ▴" : "Ver mais ▾";
  });
});

$$(".filtros-tempo .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    $$(".filtros-tempo .chip").forEach(c => c.classList.remove("ativo"));
    chip.classList.add("ativo");
    const fase = chip.dataset.fase;
    $$(".evento").forEach(ev => {
      ev.classList.toggle("oculto", fase !== "todas" && ev.dataset.fase !== fase);
      ev.classList.add("visivel");
    });
  });
});

/* ---------- 7. Lightbox de fotos ---------- */
const lightbox = $("#lightbox");
if (lightbox) {
  $$(".foto-ampliavel").forEach(img => {
    img.addEventListener("click", () => {
      $("#lightboxImg").src = img.src;
      $("#lightboxImg").alt = img.alt;
      $("#lightboxLegenda").textContent = img.alt;
      lightbox.hidden = false;
      document.body.classList.add("travado");
    });
  });
  const fechar = () => { lightbox.hidden = true; document.body.classList.remove("travado"); };
  lightbox.addEventListener("click", fechar);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !lightbox.hidden) fechar(); });
}

/* ---------- 8. Confete de comemoração ---------- */
const btnConfete = $("#btnConfete");
if (btnConfete) {
  const canvas = $("#confete");
  const ctx = canvas.getContext("2d");
  let pedacos = [];

  function animarConfete() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pedacos.forEach(p => {
      p.y += p.vel; p.x += p.deriva; p.giro += 0.1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.tam / 2, -p.tam / 4, p.tam, p.tam / 2);
      ctx.restore();
    });
    pedacos = pedacos.filter(p => p.y < canvas.height + 20);
    if (pedacos.length) requestAnimationFrame(animarConfete);
  }

  btnConfete.addEventListener("click", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const cores = ["#5b3df5", "#f0567a", "#fbbf24", "#34d399", "#60a5fa"];
    pedacos = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      tam: 6 + Math.random() * 6,
      cor: cores[Math.floor(Math.random() * cores.length)],
      vel: 2 + Math.random() * 3,
      giro: Math.random() * Math.PI,
      deriva: Math.random() * 2 - 1
    }));
    requestAnimationFrame(animarConfete);
  });
}

/* ---------- 9. Portfólio de redações ---------- */
const grade = $("#gradeRedacoes");
if (grade && typeof REDACOES !== "undefined") {
  const EIXOS = {
    sociedade: "👥 Sociedade",
    ambiente: "🌎 Meio ambiente",
    tecnologia: "💻 Tecnologia",
    saude: "💪 Saúde",
    cultura: "🏛️ Cultura"
  };
  const PARTES = ["Introdução", "Desenvolvimento 1", "Desenvolvimento 2", "Conclusão"];

  const busca = $("#busca");
  const contagem = $("#contagem");
  let filtroEixo = "todos";
  let listaVisivel = [];
  const lidas = new Set(JSON.parse(lerPreferencia("lidas") || "[]"));

  const palavras = r => r.paragrafos.join(" ").trim().split(/\s+/).length;
  const normalizar = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function renderizar() {
    const termo = normalizar(busca.value);
    listaVisivel = REDACOES.map((_, i) => i).filter(i => {
      const r = REDACOES[i];
      const casaEixo = filtroEixo === "todos" || r.eixo === filtroEixo;
      const casaBusca = normalizar(`${r.titulo} ${r.tema} ${r.repertorios.join(" ")}`).includes(termo);
      return casaEixo && casaBusca;
    });

    grade.innerHTML = "";
    if (!listaVisivel.length) {
      grade.innerHTML = `<p class="sem-resultado">Nenhuma redação encontrada 😕</p>`;
    }

    listaVisivel.forEach((i, ordem) => {
      const r = REDACOES[i];
      const card = document.createElement("button");
      card.className = "card-redacao";
      card.dataset.eixo = r.eixo;
      card.style.animationDelay = `${ordem * 40}ms`;
      card.innerHTML = `
        ${lidas.has(i) ? '<span class="lida">✓ lida</span>' : ""}
        <span class="numero">${String(i + 1).padStart(2, "0")}</span>
        <span class="eixo">${EIXOS[r.eixo]}</span>
        <span class="titulo"></span>
        <span class="tema"></span>
        <span class="rodape-card">
          <span>${palavras(r)} palavras</span>
          <span>${Math.ceil(palavras(r) / 200)} min de leitura</span>
        </span>`;
      card.type = "button";
      $(".titulo", card).textContent = r.titulo;
      $(".tema", card).textContent = r.tema;
      card.addEventListener("click", () => abrir(i));
      grade.append(card);
    });

    contagem.textContent = `Exibindo ${listaVisivel.length} de ${REDACOES.length} redações`;
  }

  busca.addEventListener("input", renderizar);
  $$("#filtrosRedacao .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      $$("#filtrosRedacao .chip").forEach(c => c.classList.remove("ativo"));
      chip.classList.add("ativo");
      filtroEixo = chip.dataset.eixo;
      renderizar();
    });
  });

  /* Modal de leitura */
  const modal = $("#modal");
  const modalTexto = $("#modalTexto");
  const destacar = $("#destacarRep");
  let atual = 0;
  let tamFonte = 1.05;
  let focoAnterior = null;

  function abrir(indice) {
    atual = indice;
    const r = REDACOES[indice];

    $("#modalMeta").textContent = `Redação ${indice + 1} · ${EIXOS[r.eixo]} · 2026`;
    $("#modalTitulo").textContent = r.titulo;
    $("#modalTema").textContent = `Tema: ${r.tema}`;
    $("#modalInfo").textContent = `${palavras(r)} palavras`;

    modalTexto.innerHTML = "";
    r.paragrafos.forEach((texto, n) => {
      const bloco = document.createElement("div");
      bloco.className = "paragrafo";
      const rotulo = document.createElement("p");
      rotulo.className = "rotulo";
      rotulo.textContent = PARTES[n] + (r.repertorios[n] ? ` · Repertório: ${r.repertorios[n]}` : "");
      const p = document.createElement("p");
      p.textContent = texto;
      bloco.append(rotulo, p);
      modalTexto.append(bloco);
    });
    modalTexto.scrollTop = 0;

    const pos = listaVisivel.indexOf(indice);
    $("#modalPosicao").textContent = `${pos + 1} / ${listaVisivel.length}`;
    $("#anterior").disabled = pos <= 0;
    $("#proxima").disabled = pos >= listaVisivel.length - 1;

    if (modal.hidden) focoAnterior = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("travado");
    $(".modal-fechar", modal).focus();

    lidas.add(indice);
    salvarPreferencia("lidas", JSON.stringify([...lidas]));
  }

  function fechar() {
    modal.hidden = true;
    document.body.classList.remove("travado");
    renderizar();
    // devolve o foco ao card que estava aberto (ajuda quem navega pelo teclado)
    const cards = $$(".card-redacao");
    const pos = listaVisivel.indexOf(atual);
    (cards[pos] || focoAnterior || document.body).focus();
  }

  function navegar(direcao) {
    const pos = listaVisivel.indexOf(atual) + direcao;
    if (pos >= 0 && pos < listaVisivel.length) abrir(listaVisivel[pos]);
  }

  $$("[data-fechar]", modal).forEach(el => el.addEventListener("click", fechar));
  $("#anterior").addEventListener("click", () => navegar(-1));
  $("#proxima").addEventListener("click", () => navegar(1));
  destacar.addEventListener("change", () => modalTexto.classList.toggle("estrutura", destacar.checked));

  function ajustarFonte(delta) {
    tamFonte = Math.min(1.6, Math.max(0.85, tamFonte + delta));
    modalTexto.style.setProperty("--tam-fonte", `${tamFonte}rem`);
  }
  $("#fonteMais").addEventListener("click", () => ajustarFonte(0.1));
  $("#fonteMenos").addEventListener("click", () => ajustarFonte(-0.1));

  document.addEventListener("keydown", e => {
    if (modal.hidden) return;
    if (e.key === "Escape") fechar();
    if (e.key === "ArrowRight") navegar(1);
    if (e.key === "ArrowLeft") navegar(-1);
  });

  renderizar();
}
