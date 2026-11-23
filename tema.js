/* Aplica o tema salvo antes de a página ser desenhada,
   evitando que ela "pisque" no tema claro ao trocar de página. */
(function () {
  var tema = null;
  try { tema = localStorage.getItem("tema"); } catch (e) { /* navegação privada */ }
  if (!tema) tema = matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
  document.documentElement.dataset.tema = tema;
  document.documentElement.classList.add("js");
})();
