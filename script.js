// Variables globales para configuración
let currentSettings = {
  fontSize: 100,
  speechRate: 1,
  selectedVoice: null,
  voices: [],
  themePreset: "default",
  customPrimary: "#667eea",
  customAccent: "#f59e0b",
}

const themePalettes = {
  // Todas las paletas siguen la misma tonalidad (mismo contraste) pero con familias de color distintas
  default: { primary: "#5c5eff", accent: "#ff6ec7", secondary: "#2dd4bf" }, // morados vibrantes
  forest: { primary: "#1fbf8f", accent: "#0fa76f", secondary: "#42ffd1" },  // verdes
  ocean: { primary: "#1f9dff", accent: "#00c2ff", secondary: "#6ef1ff" },   // azules
  sunset: { primary: "#ff7a59", accent: "#ff4f81", secondary: "#ffc75f" },  // cálidos
  graphite: { primary: "#7f8ba3", accent: "#b7c2d6", secondary: "#dfe6f0" }, // grises luminosos
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarTodosLosTerminos()
  inicializarTema()
  inicializarConfiguracion()
  cargarVoces()

  // La búsqueda en tiempo real ahora se maneja en inicializarBusquedaGoogle()

  // Manejadores del botón de tema (ambos botones)
  document.getElementById("theme-switch").addEventListener("click", cambiarTema)
  document.getElementById("theme-switch-setting").addEventListener("click", cambiarTema)
  const themePresetSelect = document.getElementById("theme-preset")
  if (themePresetSelect) { themePresetSelect.addEventListener("change", manejarCambioPreset) }
  const saveCustomBtn = document.getElementById("save-custom-theme")
  if (saveCustomBtn) { saveCustomBtn.addEventListener("click", guardarTemaPersonalizado) }
  const resetThemeBtn = document.getElementById("reset-theme-colors")
  if (resetThemeBtn) { resetThemeBtn.addEventListener("click", restablecerTema) }

  // Manejadores de configuración
  document.getElementById("font-size").addEventListener("input", cambiarTamanoFuente)
  document.getElementById("speech-rate").addEventListener("input", cambiarVelocidadVoz)
  document.getElementById("voice-select").addEventListener("change", cambiarVoz)
  document.getElementById("test-voice").addEventListener("click", probarVoz)

  // Manejadores de datos
  document.getElementById("backup-data").addEventListener("click", crearCopiaSeguridad)
  document.getElementById("restore-data").addEventListener("click", () => {
    document.getElementById("restore-file-input").click()
  })
  document.getElementById("clear-data").addEventListener("click", borrarTodosLosDatos)

  // Crear input oculto para restaurar datos
  const restoreInput = document.createElement("input")
  restoreInput.type = "file"
  restoreInput.id = "restore-file-input"
  restoreInput.accept = ".json"
  restoreInput.style.display = "none"
  restoreInput.addEventListener("change", restaurarDatos)
  document.body.appendChild(restoreInput)

  // Manejadores de formulario de agregar término
  document.getElementById("add-term-form").addEventListener("submit", agregarTermino)
  document.getElementById("category-input").addEventListener("change", manejarCategoriaOtra)

  // Manejadores de exportación
  document.getElementById("export-json").addEventListener("click", () => exportarDatos("json"))
  document.getElementById("export-csv").addEventListener("click", () => exportarDatos("csv"))
  document.getElementById("export-txt").addEventListener("click", () => exportarDatos("txt"))
  document.getElementById("export-favorites").addEventListener("click", exportarFavoritos)

  actualizarEstadisticas()

  // Inicializar búsqueda tipo Google
  inicializarBusquedaGoogle()
})

// Inicializa la sección de tiempos verbales con UI mejorada
// -------------------- Tenses module (fix "siempre mostrar") --------------------
function initTenses() {
  const select = document.getElementById("tenses-verb-select");
  const subjectSelect = document.getElementById("tenses-subject-select");
  const viewToggle = document.getElementById("tenses-view-toggle");
  const copyAllBtn = document.getElementById("tenses-copy-all");
  const speakBtn = document.getElementById("tenses-speak-example");
  const datalist = document.getElementById("tenses-verb-datalist");
  const verbInput = document.getElementById("tenses-verb-input");
  const verbTypeIndicator = document.getElementById("verb-type-indicator"); // opcional en HTML

  if (!select) return;

  // 1) Fuente de verbos (irregulares + comunes)
  const commonRegularVerbs = [
    "work","play","open","close","listen","watch","learn","fix","build","start","stop","study","help","like",
    "love","need","want","use","try","call","talk"
  ];
  const irregularVerbs = verbosIrregulares.map(v => v.infinitivo);
  const verbs = Array.from(new Set([...irregularVerbs, ...commonRegularVerbs])).sort();

  // 2) Default SIEMPRE DISPONIBLE
  const DEFAULT_VERB = verbs[0];

  // 3) Poblado de <select> y <datalist>
  select.innerHTML = "";
  verbs.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
  if (datalist) {
    datalist.innerHTML = "";
    verbs.forEach(v => {
      const o = document.createElement("option");
      o.value = v;
      datalist.appendChild(o);
    });
  }

  // 4) Estado inicial seguro: si no hay nada elegido, usar el primero
  select.value = DEFAULT_VERB;
  if (verbInput) verbInput.value = ""; // el usuario puede escribir; si deja vacío, usamos DEFAULT_VERB

  // 5) Indicador regular/irregular (opcional)
  function updateVerbTypeIndicator(verb) {
    if (!verbTypeIndicator) return;
    const isIrregular = verbosIrregulares.some(v => v.infinitivo === verb);
    verbTypeIndicator.textContent = isIrregular ? "Irregular" : "Regular";
    verbTypeIndicator.className = `verb-type ${isIrregular ? "irregular" : "regular"}`;
  }

  // 6) Helper: obtener SIEMPRE un verbo válido
  function getActiveVerb() {
    const typed = (verbInput?.value || "").trim();
    // a) si el usuario escribió algo que coincide exacto con la lista
    const exact = verbs.find(v => v.toLowerCase() === typed.toLowerCase());
    if (exact) return exact;

    // b) si hay un comienzo coincidente, tomamos la primera sugerencia
    if (typed) {
      const suggestion = verbs.find(v => v.toLowerCase().startsWith(typed.toLowerCase()));
      if (suggestion) return suggestion;
    }

    // c) si no escribió o no matchea, usar el valor del select si está,
    //    y si tampoco hay, caer al DEFAULT_VERB
    return select.value || DEFAULT_VERB;
  }

  // 7) Render SIEMPRE con un verbo válido
  let viewMode = "cards"; // "cards" | "table"
  function render() {
    const verb = getActiveVerb();
    // sin parpadeos: mantener sincronizado el select con el activo
    select.value = verb;

    updateVerbTypeIndicator(verb);
    const subject = subjectSelect ? subjectSelect.value : "I";
    renderTensesView(verb, subject, viewMode);
  }

  // 8) Listeners
  select.addEventListener("change", () => {
    // si eligen del select, respetarlo y renderizar
    if (verbInput) verbInput.value = ""; // limpiar input para evitar confusión
    render();
  });

  if (subjectSelect) {
    subjectSelect.addEventListener("change", render);
  }

  if (verbInput) {
    // mientras escribe, no cortamos el render: que SIEMPRE haya algo en pantalla
    verbInput.addEventListener("input", () => {
      // no exigimos match; render con getActiveVerb() que ya cae al default si no coincide
      render();
    });
    verbInput.addEventListener("change", render);
    verbInput.addEventListener("blur", render);
    verbInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        render();
      }
    });
  }

  function updateViewToggleUI(mode) {
    if (!viewToggle) return;
    if (mode === "cards") {
      viewToggle.innerHTML = '<i class="fas fa-table"></i> Ver en tabla';
      viewToggle.setAttribute("aria-label", "Ver en tabla");
    } else {
      viewToggle.innerHTML = '<i class="fas fa-th-large"></i> Ver en tarjetas';
      viewToggle.setAttribute("aria-label", "Ver en tarjetas");
    }
  }

  if (viewToggle) {
    updateViewToggleUI(viewMode);
    viewToggle.addEventListener("click", () => {
      viewMode = viewMode === "cards" ? "table" : "cards";
      updateViewToggleUI(viewMode);

      const tableWrap = document.getElementById("tenses-table-wrap");
      const cardsWrap = document.getElementById("tenses-cards");
      if (viewMode === "cards") {
        tableWrap?.classList.add("hidden");
        cardsWrap?.classList.remove("hidden");
      } else {
        tableWrap?.classList.remove("hidden");
        cardsWrap?.classList.add("hidden");
      }
      render();
    });
  }

  if (copyAllBtn) {
    copyAllBtn.addEventListener("click", () => {
      const verb = getActiveVerb();
      const subject = subjectSelect ? subjectSelect.value : "I";
      copyAllExamples(verb, subject);
    });
  }

  if (speakBtn) {
    speakBtn.addEventListener("click", () => {
      const verb = getActiveVerb();
      const forms = conjugateAll(verb);
      const subject = subjectSelect ? subjectSelect.value : "I";
      const firstExample = generateExampleText(TENSES[0], forms, subject);
      pronunciar(firstExample);
    });
  }

  // 9) Render inicial: aunque el input esté vacío, SIEMPRE muestra tarjetas/tabla
  render();
}

// reglas de conjugación simplificadas
function toPastSimple(verb) {
  const found = verbosIrregulares.find((v) => v.infinitivo.toLowerCase() === verb.toLowerCase())
  if (found) return found.pasado
  if (verb.endsWith("e")) return verb + "d"
  if (verb.endsWith("y") && !/[aeiou]y$/.test(verb)) return verb.slice(0, -1) + "ied"
  return verb + "ed"
}
function toPastParticiple(verb) {
  const found = verbosIrregulares.find((v) => v.infinitivo.toLowerCase() === verb.toLowerCase())
  if (found) return found.participio || found.pasado
  return toPastSimple(verb)
}
function toGerund(verb) {
  if (verb === "be") return "being"
  if (verb.endsWith("ie")) return verb.slice(0, -2) + "ying"
  if (verb.endsWith("e") && verb.length > 1 && !verb.endsWith("ee")) return verb.slice(0, -1) + "ing"
  if (/[b-df-hj-np-tv-z][aeiou][b-df-hj-np-tv-z]$/.test(verb) && verb.length <= 4) return verb + verb.slice(-1) + "ing"
  return verb + "ing"
}
function toThirdPerson(verb) {
  if (verb === "be") return "is"
  if (verb.endsWith("y") && !/[aeiou]y$/.test(verb)) return verb.slice(0, -1) + "ies"
  if (/(s|sh|ch|x|z|o)$/.test(verb)) return verb + "es"
  return verb + "s"
}
function conjugateAll(verb) {
  return { base: verb, third: toThirdPerson(verb), past: toPastSimple(verb), pastPart: toPastParticiple(verb), gerund: toGerund(verb) }
}

// Nuevas plantillas de ejemplo con placeholders {subject} y tokens {base}/{third}/{past}/{pastPart}/{gerund}
const TENSES = [
  { name: "Present Simple", structure: "Subject + base verb (add -s for he/she/it)", templates: ["{subject} {verb}", "{subject} {verb} the task"] },
  { name: "Present Continuous", structure: "Subject + am/is/are + verb-ing", templates: ["{subject} is {gerund}", "{subject} are {gerund}"] },
  { name: "Present Perfect", structure: "Subject + have/has + past participle", templates: ["{subject} have {pastPart}", "{subject} has {pastPart}"] },
  { name: "Present Perfect Continuous", structure: "Subject + have/has been + verb-ing", templates: ["{subject} have been {gerund}"] },
  { name: "Past Simple", structure: "Subject + past simple", templates: ["{subject} {past}"] },
  { name: "Past Continuous", structure: "Subject + was/were + verb-ing", templates: ["{subject} was {gerund}"] },
  { name: "Past Perfect", structure: "Subject + had + past participle", templates: ["{subject} had {pastPart}"] },
  { name: "Future Simple", structure: "Subject + will + base verb", templates: ["{subject} will {base}"] },
  { name: "Future Continuous", structure: "Subject + will be + verb-ing", templates: ["{subject} will be {gerund}"] },
  { name: "Future Perfect", structure: "Subject + will have + past participle", templates: ["{subject} will have {pastPart}"] },
]

// Genera una cadena de ejemplo para una plantilla dada
function generateExampleText(tense, forms, subject) {
  const tpl = (tense.templates && tense.templates[0]) || "{subject} {base}"
  // pick the template that best fits subject (simple heuristic)
  let t = tpl
  // Replace tokens
  t = t.replace(/{subject}/g, subject)
  t = t.replace(/{base}/g, forms.base)
  t = t.replace(/{third}/g, forms.third)
  t = t.replace(/{past}/g, forms.past)
  t = t.replace(/{pastPart}/g, forms.pastPart)
  t = t.replace(/{gerund}/g, forms.gerund)
  // small fixes for agreement: if subject is He/She/It and template uses {base}, replace with third
  if (/^(He|She|It)$/i.test(subject) && t.includes(forms.base) && !t.includes(forms.third)) {
    t = t.replace(forms.base, forms.third)
  }
  return t
}

// Render en tarjetas y en tabla (según viewMode)
function renderTensesView(verb, subject, viewMode = "cards") {
  const forms = conjugateAll(verb)
  const cardsWrap = document.getElementById("tenses-cards")
  const tbody = document.getElementById("tenses-table-body")
  if (cardsWrap) cardsWrap.innerHTML = ""
  if (tbody) tbody.innerHTML = ""

  TENSES.forEach((t) => {
    const examples = t.templates.map((tpl) => {
      return tpl.replace(/{subject}/g, subject)
        .replace(/{base}/g, forms.base)
        .replace(/{third}/g, forms.third)
        .replace(/{past}/g, forms.past)
        .replace(/{pastPart}/g, forms.pastPart)
        .replace(/{gerund}/g, forms.gerund)
    }).map((s) => {
      // agreement tweak
      if (/^(He|She|It)$/i.test(subject) && s.includes(forms.base) && !s.includes(forms.third)) {
        return s.replace(forms.base, forms.third)
      }
      return s
    })

    // tarjetas
    if (cardsWrap && viewMode === "cards") {
      const card = document.createElement("article")
      card.className = "tenses-card"
      const h = document.createElement("h4")
      h.textContent = t.name
      const st = document.createElement("div")
      st.className = "structure"
      st.textContent = t.structure
      const ex = document.createElement("div")
      ex.className = "examples"
      ex.innerHTML = examples.map((e) => `<div>- ${e}</div>`).join("")

      const actions = document.createElement("div")
      actions.className = "card-actions"
      const copyBtn = document.createElement("button")
      copyBtn.className = "icon-btn"
      copyBtn.textContent = "Copiar"
      copyBtn.addEventListener("click", () => copyTextToClipboard(examples.join("\n")))

      const speakBtn = document.createElement("button")
      speakBtn.className = "icon-btn"
      speakBtn.textContent = "Escuchar"
      speakBtn.title = "Escuchar ejemplo"
      speakBtn.addEventListener("click", () => pronunciar(examples[0]))

      actions.appendChild(copyBtn)
      actions.appendChild(speakBtn)

      card.appendChild(h)
      card.appendChild(st)
      card.appendChild(ex)
      card.appendChild(actions)

      cardsWrap.appendChild(card)
    }

    // tabla (si está visible o se pide)
    if (tbody) {
      const tr = document.createElement("tr")
      const tdName = document.createElement("td")
      const tdStruct = document.createElement("td")
      const tdExample = document.createElement("td")

      tdName.textContent = t.name
      tdStruct.innerHTML = `<div class="structure">${t.structure}</div>`
      tdExample.innerHTML = `<div class="examples">${examples.map((e) => `<div>- ${e}</div>`).join("")}</div>`

      tr.appendChild(tdName)
      tr.appendChild(tdStruct)
      tr.appendChild(tdExample)
      tbody.appendChild(tr)
    }
  })
}

// Copiar texto al portapapeles
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch (e) {}
    ta.remove()
    mostrarNotificacion('Copiado al portapapeles', 'success')
    return
  }
  navigator.clipboard.writeText(text).then(() => mostrarNotificacion('Copiado al portapapeles', 'success'))
}

function copyAllExamples(verb, subject) {
  const forms = conjugateAll(verb)
  const lines = TENSES.map((t) => {
    const ex = generateExampleText(t, forms, subject)
    return `${t.name}: ${ex}`
  })
  copyTextToClipboard(lines.join('\n'))
}

// Iniciar módulo de tiempos al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  try {
    initTenses()
  } catch (e) {
    console.error("Error inicializando tenses module:", e)
  }
})

// -------------------- End Tenses module --------------------

function mostrarTodosLosTerminos() {
  const nuevosTerminos = [
    {
      term: "however",
      pronunciation: "",
      translation: "sin embargo",
      definition: "Conjunción usada para contrastar ideas.",
      examples: ["I wanted to go; however, it rained."],
      category: "other",
    },
    {
      term: "hold",
      pronunciation: "",
      translation: "mantener",
      definition: "Sujetar o mantener algo en posición.",
      examples: ["Please hold this for a moment."],
      category: "programming",
    },
    {
      term: "between",
      pronunciation: "",
      translation: "entre",
      definition: "En el espacio o intervalo que separa dos cosas.",
      examples: ["The keys are between the books."],
      category: "other",
    },
    {
      term: "breadcrumbs",
      pronunciation: "",
      translation: "migas de pan",
      definition: "Atajos o enlaces de navegación para volver a una sección anterior.",
      examples: ["Click the breadcrumbs to go back to the homepage."],
      category: "software",
    },
    {
      term: "up to",
      pronunciation: "",
      translation: "hasta (en lugares)",
      definition: "Indica el límite superior de algo.",
      examples: ["Walk up to the door."],
      category: "other",
    },
    {
      term: "dropdown",
      pronunciation: "",
      translation: "menú desplegable",
      definition: "Elemento de interfaz que muestra opciones al hacer clic.",
      examples: ["Choose a value from the dropdown."],
      category: "software",
    },
    {
      term: "siblings",
      pronunciation: "",
      translation: "etiqueta hermana de un mismo padre",
      definition: "Etiquetas que comparten el mismo elemento padre.",
      examples: ["Use .siblings() to select them."],
      category: "programming",
    },
    {
      term: "path",
      pronunciation: "",
      translation: "camino",
      definition: "Ruta que indica la ubicación de un archivo o recurso.",
      examples: ["The path to the file is C:/docs/file.txt."],
      category: "software",
    },
    {
      term: "below",
      pronunciation: "",
      translation: "debajo",
      definition: "En una posición más baja.",
      examples: ["Scroll down to see what's below."],
      category: "other",
    },
    {
      term: "toggle",
      pronunciation: "",
      translation: "alternar",
      definition: "Cambiar entre dos estados.",
      examples: ["Click the button to toggle the menu."],
      category: "software",
    },
    {
      term: "both",
      pronunciation: "",
      translation: "ambos",
      definition: "Dos elementos a la vez.",
      examples: ["Both files are corrupted."],
      category: "other",
    },
    {
      term: "shortcuts",
      pronunciation: "/shortcuts/",
      translation: "atajos",
      definition: "Combinaciones de teclas para ejecutar acciones rápidamente.",
      examples: ["Ctrl+C is a common shortcut."],
      category: "software",
    },
    {
      term: "matching",
      pronunciation: "",
      translation: "coincidir",
      definition: "Cuando dos elementos tienen características iguales.",
      examples: ["Use matching brackets."],
      category: "programming",
    },
    {
      term: "hover over",
      pronunciation: "",
      translation: "posicionarse sobre",
      definition: "Mover el cursor sobre un elemento sin hacer clic.",
      examples: ["Hover over the image to zoom."],
      category: "software",
    },
    {
      term: "keybinding",
      pronunciation: "",
      translation: "vinculación de teclas",
      definition: "Asignación de una tecla o combinación a una acción.",
      examples: ["You can customize keybindings."],
      category: "software",
    },
    {
      term: "peek",
      pronunciation: "",
      translation: "pispiar / echar un vistazo",
      definition: "Ver rápidamente algo.",
      examples: ["Let's peek at the result."],
      category: "other",
    },
    {
      term: "embed",
      pronunciation: "",
      translation: "incluir",
      definition: "Insertar contenido dentro de otro.",
      examples: ["Embed the video on the page."],
      category: "software",
    },
    {
      term: "bracket",
      pronunciation: "",
      translation: "corchete",
      definition: "Símbolo utilizado en programación o escritura.",
      examples: ["Use square brackets in arrays."],
      category: "programming",
    },
    {
      term: "bracket matching",
      pronunciation: "",
      translation: "corchetes coincidentes",
      definition: "Resaltar o verificar pares de corchetes.",
      examples: ["The editor has bracket matching."],
      category: "programming",
    },
    {
      term: "as soon as",
      pronunciation: "",
      translation: "tan pronto como",
      definition: "Indica inmediatez de acción.",
      examples: ["I'll call you as soon as I arrive."],
      category: "other",
    },
    {
      term: "throughout",
      pronunciation: "",
      translation: "a lo largo de",
      definition: "Durante todo el periodo o lugar.",
      examples: ["Throughout the day."],
      category: "other",
    },
    {
      term: "invoke",
      pronunciation: "",
      translation: "usar",
      definition: "Llamar a una función o comando.",
      examples: ["Invoke the method directly."],
      category: "programming",
    },
    {
      term: "across",
      pronunciation: "",
      translation: "a lo largo de",
      definition: "De un lado a otro.",
      examples: ["Spread across regions."],
      category: "other",
    },
    {
      term: "the loop",
      pronunciation: "",
      translation: "el bucle",
      definition: "Secuencia que se repite en programación.",
      examples: ["Inside the loop, add 1."],
      category: "programming",
    },
    {
      term: "fix",
      pronunciation: "",
      translation: "arreglar/reparar",
      definition: "Corregir un error.",
      examples: ["Fix the bug in the code."],
      category: "programming",
    },
    {
      term: "inlay hints",
      pronunciation: "",
      translation: "pistas incrustadas",
      definition: "Sugerencias visuales dentro del código.",
      examples: ["Enable inlay hints in the editor."],
      category: "software",
    },
    {
      term: "brings up",
      pronunciation: "",
      translation: "trae",
      definition: "Mostrar o presentar algo.",
      examples: ["This brings up a menu."],
      category: "software",
    },
    {
      term: "printout",
      pronunciation: "",
      translation: "copia impresa",
      definition: "Documento físico impreso.",
      examples: ["The report is in the printout."],
      category: "hardware",
    },
    {
      term: "wipe out",
      pronunciation: "",
      translation: "borrar",
      definition: "Eliminar completamente.",
      examples: ["Wipe out all user data."],
      category: "security",
    },
    {
      term: "annoying",
      pronunciation: "/uh-NOY-ing",
      translation: "molesto",
      definition: "Algo que causa molestia.",
      examples: ["That popup is very annoying."],
      category: "other",
    },
    {
      term: "hook up",
      pronunciation: "",
      translation: "conectar",
      definition: "Conectar un dispositivo o componente.",
      examples: ["Hook up the speakers to the PC."],
      category: "hardware",
    },
    {
      term: "opt in",
      pronunciation: "",
      translation: "optar / decidir",
      definition: "Elegir participar en algo.",
      examples: ["You must opt in to receive emails."],
      category: "security",
    },
    {
      term: "wrapper",
      pronunciation: "",
      translation: "encapsulador",
      definition: "Objeto que encapsula otro para agregar funcionalidad.",
      examples: ["Use a wrapper for the API."],
      category: "programming",
    },
    {
      term: "which",
      pronunciation: "",
      translation: "el cual / la cual",
      definition: "Pronombre relativo.",
      examples: ["The file, which is large, is safe."],
      category: "other",
    },
  ]

  const glosario = obtenerGlosario()
  const yaCargados = new Set(glosario.map((t) => t.term.toLowerCase()))

  const nuevos = nuevosTerminos.filter((t) => !yaCargados.has(t.term.toLowerCase()))

  if (nuevos.length > 0) {
    const combinado = glosario.concat(nuevos)
    localStorage.setItem("glosario", JSON.stringify(combinado))
  }

  mostrarResultados(obtenerGlosario())
}

// Función para búsqueda en tiempo real
function buscarEnTiempoReal() {
  const input = document.getElementById("search-input").value.trim().toLowerCase();
  const categoria = document.getElementById("category-filter").value;
  const exacta = document.getElementById("exact-match").checked;
  const buscarDescripcion = document.getElementById("search-description").checked;
  const soloFavoritos = document.getElementById("only-favorites").checked;
  const ordenarPor = document.getElementById("sort-filter").value;

  let resultados = obtenerGlosario();

  if (input.length > 0) {
    resultados = resultados.filter((t) => {
      const enTerm = t.term.toLowerCase();
      const enTraduccion = t.translation?.toLowerCase() || "";
      const enDefinicion = t.definition?.toLowerCase() || "";
      const enEjemplos = t.examples?.join(" ").toLowerCase() || "";

      if (exacta) {
        return enTerm === input;
      }

      return (
        enTerm.includes(input) ||
        enTraduccion.includes(input) ||
        (buscarDescripcion && (enDefinicion.includes(input) || enEjemplos.includes(input)))
      );
    });
  }

  if (categoria) {
    resultados = resultados.filter((t) => t.category === categoria);
  }

  if (soloFavoritos) {
    const favs = obtenerFavoritos().map((f) => f.term.toLowerCase());
    resultados = resultados.filter((t) => favs.includes(t.term.toLowerCase()));
  }

  if (ordenarPor === "alpha") {
    resultados.sort((a, b) => a.term.localeCompare(b.term));
  } else if (ordenarPor === "category") {
    resultados.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
  } else if (ordenarPor === "favorites") {
    const favs = obtenerFavoritos().map((f) => f.term.toLowerCase());
    resultados.sort((a, b) => {
      const aFav = favs.includes(a.term.toLowerCase()) ? -1 : 1;
      const bFav = favs.includes(b.term.toLowerCase()) ? -1 : 1;
      return aFav - bFav;
    });
  }

  mostrarResultados(resultados);
}


// Función para inicializar el tema
function inicializarTema() {
  const temaGuardado = localStorage.getItem("tema") || "light"
  aplicarTema(temaGuardado)
}

// Función para cambiar tema
function cambiarTema() {
  const temaActual = document.documentElement.getAttribute("data-theme") || "light"
  const nuevoTema = temaActual === "light" ? "dark" : "light"
  aplicarTema(nuevoTema)
  localStorage.setItem("tema", nuevoTema)
}

// Función para aplicar tema
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema)
}

// Utilidades de color
function hexToRgb(hex) {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex
  if (normalized.length !== 6) return null
  const int = Number.parseInt(normalized, 16)
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

function componentToHex(v) {
  const h = v.toString(16)
  return h.length === 1 ? "0" + h : h
}

function lightenHex(hex, factor = 0.25) {
  const rgb = hexToRgb(hex)
  if (!rgb) return "#ffffff"
  const mix = {
    r: Math.round(rgb.r + (255 - rgb.r) * factor),
    g: Math.round(rgb.g + (255 - rgb.g) * factor),
    b: Math.round(rgb.b + (255 - rgb.b) * factor),
  }
  return `#${componentToHex(mix.r)}${componentToHex(mix.g)}${componentToHex(mix.b)}`
}

function mixHex(a, b, ratio = 0.5) {
  const rgbA = hexToRgb(a)
  const rgbB = hexToRgb(b)
  if (!rgbA || !rgbB) return a
  const mix = {
    r: Math.round(rgbA.r * (1 - ratio) + rgbB.r * ratio),
    g: Math.round(rgbA.g * (1 - ratio) + rgbB.g * ratio),
    b: Math.round(rgbA.b * (1 - ratio) + rgbB.b * ratio),
  }
  return `#${componentToHex(mix.r)}${componentToHex(mix.g)}${componentToHex(mix.b)}`
}

function getComplementaryColor(primaryHex, accentHex = null) {
  const rgb = hexToRgb(primaryHex)
  if (!rgb) return "#ffffff"
  const comp = { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b }
  let complement = `#${componentToHex(comp.r)}${componentToHex(comp.g)}${componentToHex(comp.b)}`
  // Mezcla ligera con el acento para ganar saturación y luego ilumina para legibilidad
  if (accentHex) complement = mixHex(complement, accentHex, 0.35)
  return lightenHex(complement, 0.18)
}

function aplicarColoresTema(preset = "default", primary = null, accent = null) {
  const palette = themePalettes[preset] || themePalettes.default
  const primaryColor = primary || palette.primary
  const accentColor = accent || palette.accent
  const secondaryColor = palette.secondary || accentColor
  const titleColor = getComplementaryColor(primaryColor, accentColor)

  const root = document.documentElement.style
  root.setProperty("--primary-color", primaryColor)
  root.setProperty("--secondary-color", secondaryColor)
  root.setProperty("--accent-color", accentColor)
  root.setProperty("--primary-gradient", `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`)
  root.setProperty("--title-color", titleColor)
}

// Funciones de configuración
function inicializarConfiguracion() {
  const configuracionGuardada = localStorage.getItem("configuracion")
  if (configuracionGuardada) {
    currentSettings = { ...currentSettings, ...JSON.parse(configuracionGuardada) }
  }

  // Aplicar configuración guardada
  document.getElementById("font-size").value = currentSettings.fontSize
  document.getElementById("font-size-value").textContent = currentSettings.fontSize + "%"
  document.getElementById("speech-rate").value = currentSettings.speechRate
  document.getElementById("speech-rate-value").textContent = currentSettings.speechRate + "x"
  const presetSelect = document.getElementById("theme-preset")
  if (presetSelect) presetSelect.value = currentSettings.themePreset || "default"
  const primaryInput = document.getElementById("color-primary")
  const accentInput = document.getElementById("color-accent")
  if (primaryInput) primaryInput.value = currentSettings.customPrimary
  if (accentInput) accentInput.value = currentSettings.customAccent

  // Aplicar tamaAo de fuente
  document.documentElement.style.fontSize = currentSettings.fontSize / 100 + "rem"
  actualizarVisibilidadCustomTheme()
  aplicarColoresTema(currentSettings.themePreset, currentSettings.customPrimary, currentSettings.customAccent)
}

function cambiarTamanoFuente(event) {
  const nuevoTamano = Number.parseInt(event.target.value)
  currentSettings.fontSize = nuevoTamano
  document.getElementById("font-size-value").textContent = nuevoTamano + "%"
  document.documentElement.style.fontSize = nuevoTamano / 100 + "rem"
  guardarConfiguracion()
}

function cambiarVelocidadVoz(event) {
  const nuevaVelocidad = Number.parseFloat(event.target.value)
  currentSettings.speechRate = nuevaVelocidad
  document.getElementById("speech-rate-value").textContent = nuevaVelocidad + "x"
  guardarConfiguracion()
}

function cargarVoces() {
  const cargarVocesDisponibles = () => {
    const voces = speechSynthesis.getVoices()
    const vocesEnIngles = voces.filter((voz) => voz.lang.startsWith("en"))

    const selectVoz = document.getElementById("voice-select")
    selectVoz.innerHTML = ""

    if (vocesEnIngles.length === 0) {
      selectVoz.innerHTML = '<option value="">No hay voces disponibles</option>'
      return
    }

    vocesEnIngles.forEach((voz, index) => {
      const option = document.createElement("option")
      option.value = index
      option.textContent = `${voz.name} (${voz.lang})`
      selectVoz.appendChild(option)
    })

    currentSettings.voices = vocesEnIngles

    // Seleccionar voz guardada o primera disponible
    if (currentSettings.selectedVoice !== null) {
      selectVoz.value = currentSettings.selectedVoice
    } else if (vocesEnIngles.length > 0) {
      currentSettings.selectedVoice = 0
      selectVoz.value = 0
      guardarConfiguracion()
    }
  }

  // Cargar voces inmediatamente si están disponibles
  cargarVocesDisponibles()

  // También escuchar el evento por si las voces se cargan después
  speechSynthesis.addEventListener("voiceschanged", cargarVocesDisponibles)
}

function cambiarVoz(event) {
  currentSettings.selectedVoice = Number.parseInt(event.target.value)
  guardarConfiguracion()
}

function probarVoz() {
  const textoEjemplo = "Hello, this is a test of the selected voice configuration."
  pronunciar(textoEjemplo)
}

function actualizarVisibilidadCustomTheme() {
  const presetSelect = document.getElementById("theme-preset")
  const customControls = document.getElementById("custom-theme-controls")
  if (!presetSelect || !customControls) return
  customControls.style.display = presetSelect.value === "custom" ? "block" : "none"
}

function manejarCambioPreset(event) {
  const preset = event.target.value
  currentSettings.themePreset = preset
  if (preset !== "custom") {
    aplicarColoresTema(preset)
    guardarConfiguracion()
  }
  actualizarVisibilidadCustomTheme()
}

function guardarTemaPersonalizado() {
  const primaryInput = document.getElementById("color-primary")
  const accentInput = document.getElementById("color-accent")
  if (!primaryInput || !accentInput) return
  currentSettings.themePreset = "custom"
  currentSettings.customPrimary = primaryInput.value
  currentSettings.customAccent = accentInput.value
  aplicarColoresTema("custom", currentSettings.customPrimary, currentSettings.customAccent)
  guardarConfiguracion()
  actualizarVisibilidadCustomTheme()
  mostrarNotificacion("Tema personalizado guardado", "success", { tabId: "settings" })
}

function restablecerTema() {
  currentSettings.themePreset = "default"
  currentSettings.customPrimary = themePalettes.default.primary
  currentSettings.customAccent = themePalettes.default.accent
  const presetSelect = document.getElementById("theme-preset")
  if (presetSelect) presetSelect.value = "default"
  const primaryInput = document.getElementById("color-primary")
  const accentInput = document.getElementById("color-accent")
  if (primaryInput) primaryInput.value = currentSettings.customPrimary
  if (accentInput) accentInput.value = currentSettings.customAccent
  aplicarColoresTema("default")
  guardarConfiguracion()
  actualizarVisibilidadCustomTheme()
  mostrarNotificacion("Colores restablecidos", "info", { tabId: "settings" })
}

function guardarConfiguracion() {
  localStorage.setItem("configuracion", JSON.stringify(currentSettings))
}

// Funciones de gestión de datos
function crearCopiaSeguridad() {
  const datos = {
    glosario: obtenerGlosario(),
    favoritos: obtenerFavoritos(),
    configuracion: currentSettings,
    fecha: new Date().toISOString(),
  }

  const dataStr = JSON.stringify(datos, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `glosario-backup-${new Date().toISOString().split("T")[0]}.json`
  link.click()
  URL.revokeObjectURL(url)

  mostrarNotificacion("Copia de seguridad creada correctamente", "success", { tabId: "settings" })
}

function restaurarDatos(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const datos = JSON.parse(e.target.result)

      if (datos.glosario) {
        localStorage.setItem("glosario", JSON.stringify(datos.glosario))
      }
      if (datos.favoritos) {
        localStorage.setItem("favoritos", JSON.stringify(datos.favoritos))
      }
      if (datos.configuracion) {
        localStorage.setItem("configuracion", JSON.stringify(datos.configuracion))
        currentSettings = { ...currentSettings, ...datos.configuracion }
        inicializarConfiguracion()
      }

      mostrarNotificacion("Datos restaurados correctamente", "success", { tabId: "settings" })

      // Actualizar vista actual
      const inputActual = document.getElementById("search-input").value.trim()
      if (inputActual) {
        buscarEnTiempoReal()
      } else {
        mostrarResultados(obtenerGlosario())
      }

      actualizarEstadisticas()
    } catch (error) {
      mostrarNotificacion("Error al restaurar los datos. Archivo inválido.", "error", { tabId: "settings" })
    }
  }
  reader.readAsText(file)
}

function borrarTodosLosDatos() {
  if (!confirm("¿Estás seguro de que deseas borrar todos los datos? Esta acción no se puede deshacer.")) {
    return
  }

  localStorage.removeItem("glosario")
  localStorage.removeItem("favoritos")
  localStorage.removeItem("configuracion")

  // Reiniciar configuración
  currentSettings = {
    fontSize: 100,
    speechRate: 1,
    selectedVoice: null,
    voices: [],
    themePreset: "default",
    customPrimary: "#667eea",
    customAccent: "#f59e0b",
  }
  inicializarConfiguracion()

  // Limpiar vista
  mostrarResultados([])
  actualizarEstadisticas()

  mostrarNotificacion("Todos los datos han sido borrados", "info", { tabId: "settings" })
}

function buscarTérmino() {
  const input = document.getElementById("search-input").value.trim()
  if (!input) {
    mostrarResultados(obtenerGlosario())
    return
  }

  const glosario = obtenerGlosario()
  const resultado = glosario.find((t) => t.term.toLowerCase() === input.toLowerCase())

  if (resultado) {
    mostrarResultados([resultado])
  } else {
    const resultadosParciales = glosario.filter(
      (termino) =>
        termino.term.toLowerCase().includes(input.toLowerCase()) ||
        termino.translation.toLowerCase().includes(input.toLowerCase()),
    )

    if (resultadosParciales.length > 0) {
      mostrarResultados(resultadosParciales)
    } else {
      mostrarResultados([])
    }
  }
}

function mostrarResultados(resultados) {
  const lista = document.getElementById("results-list")
  const cantidad = document.getElementById("results-count")

  lista.innerHTML = ""
  cantidad.textContent = `${resultados.length} resultado(s) encontrado(s)`

  resultados.forEach((t) => {
    const item = document.createElement("li")
    item.className = "result-item"

    // Verificar si el termino esta en favoritos
    const favoritos = obtenerFavoritos()
    const esFavorito = favoritos.some((fav) => fav.term.toLowerCase() === t.term.toLowerCase())
    const iconoFavorito = esFavorito ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>'
    const claseFavorito = esFavorito ? "favorited" : ""

    item.innerHTML = `
            <button class="favorite-button ${claseFavorito}" onclick="toggleFavorito('${t.term}', event)" title="${esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}">
                ${iconoFavorito}
            </button>
            <div class="result-header">
                <span class="result-term">${t.term}</span>
            </div>
            <div class="result-pronunciation">/${t.pronunciation || ""}/ <button class="icon-button" onclick="pronunciar('${t.term}')" title="Escuchar"><i class="fas fa-volume-up"></i></button></div>
            <div class="result-translation"><strong>Traducción:</strong> ${t.translation || "N/A"}</div>
            <div class="result-definition"><strong>Definición:</strong> ${t.definition || "N/A"}</div>
            <div class="result-definition"><strong>Ejemplos:</strong><br> ${t.examples?.map((e) => `&bull; ${e}`).join("<br>") || "No hay ejemplos"}</div>
            <div class="result-category">${t.category || "otros"}</div>
        `
    lista.appendChild(item)
  })
}

function toggleFavorito(termino, event) {
  const glosario = obtenerGlosario()
  const terminoCompleto = glosario.find((t) => t.term.toLowerCase() === termino.toLowerCase())

  if (!terminoCompleto) {
    mostrarNotificacion("TAcrmino no encontrado", "error", { tabId: "search" })
    return
  }

  const favoritos = obtenerFavoritos()
  const indiceExistente = favoritos.findIndex((fav) => fav.term.toLowerCase() === termino.toLowerCase())
  const boton = event?.currentTarget || event?.target
  const actualizarBoton = (esFavorito) => {
    if (!boton) return
    boton.classList.toggle("favorited", esFavorito)
    boton.innerHTML = esFavorito ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>'
    boton.setAttribute("title", esFavorito ? "Quitar de favoritos" : "Agregar a favoritos")
  }

  if (indiceExistente !== -1) {
    favoritos.splice(indiceExistente, 1)
    localStorage.setItem("favoritos", JSON.stringify(favoritos))
    actualizarBoton(false)
    mostrarNotificacion(`"${termino}" removido de favoritos`, "info", { tabId: "favorites" })
  } else {
    const nuevoFavorito = { ...terminoCompleto, fechaFavorito: new Date().toISOString() }
    favoritos.push(nuevoFavorito)
    localStorage.setItem("favoritos", JSON.stringify(favoritos))
    actualizarBoton(true)
    mostrarNotificacion(`"${termino}" agregado a favoritos`, "success", { tabId: "favorites" })
  }

  const inputActual = document.getElementById("search-input").value.trim()
  if (inputActual) {
    buscarEnTiempoReal()
  } else {
    mostrarResultados(obtenerGlosario())
  }

  actualizarEstadisticas()
  if (document.getElementById("favorites").classList.contains("active")) {
    mostrarFavoritos()
  }
}
function obtenerGlosario() {
  return JSON.parse(localStorage.getItem("glosario")) || []
}

function obtenerNombreSeccion(tabId) {
  const link = document.querySelector(`nav a[data-tab="${tabId}"]`)
  return link ? link.textContent.trim() : tabId
}

function restackNotifications() {
  const container = document.getElementById("notification-container")
  if (!container) return

  const cards = Array.from(container.querySelectorAll(".notification-card"))
  const maxVisible = 3
  if (cards.length > maxVisible) {
    cards.slice(0, cards.length - maxVisible).forEach((c) => {
      c.classList.remove("show")
      c.remove()
    })
  }

  const visibles = Array.from(container.querySelectorAll(".notification-card"))
  visibles.forEach((card, idx) => {
    const depth = visibles.length - idx - 1
    if (depth > 0) {
      card.classList.add("stacked")
      card.style.setProperty("--stack-index", depth)
    } else {
      card.classList.remove("stacked")
      card.style.removeProperty("--stack-index")
    }
  })
}

function mostrarNotificacion(mensaje, tipo = "info", opciones = {}) {
  const container = document.getElementById("notification-container")
  if (!container) return

  const { tabId = null, duration = 4000 } = opciones
  const card = document.createElement("div")
  card.className = `notification-card ${tipo}${tabId ? " clickable" : ""}`

  const texto = document.createElement("div")
  texto.className = "notification-text"
  texto.textContent = mensaje
  card.appendChild(texto)

  if (tabId) {
    const pill = document.createElement("span")
    pill.className = "notification-pill"
    pill.textContent = obtenerNombreSeccion(tabId)
    card.appendChild(pill)
    card.title = `Ir a ${pill.textContent}`
  }

  container.appendChild(card)
  restackNotifications()

  requestAnimationFrame(() => {
    card.classList.add("show")
  })

  const removeCard = () => {
    card.classList.remove("show")
    setTimeout(() => {
      card.remove()
      restackNotifications()
    }, 200)
  }

  let timeoutId = setTimeout(removeCard, duration)

  card.addEventListener("mouseenter", () => {
    clearTimeout(timeoutId)
  })
  card.addEventListener("mouseleave", () => {
    timeoutId = setTimeout(removeCard, duration / 2)
  })

  card.addEventListener("click", () => {
    if (tabId) {
      activarTab(tabId)
    }
    removeCard()
  })
}

function pronunciar(texto) {
  const synth = window.speechSynthesis
  const utter = new SpeechSynthesisUtterance(texto)

  // Aplicar configuración de voz
  if (currentSettings.voices && currentSettings.selectedVoice !== null) {
    const vozSeleccionada = currentSettings.voices[currentSettings.selectedVoice]
    if (vozSeleccionada) {
      utter.voice = vozSeleccionada
    }
  }

  utter.rate = currentSettings.speechRate
  utter.lang = "en-US"
  synth.speak(utter)
}

// Agregar término
function agregarTermino(event) {
  event.preventDefault()

  const termino = document.getElementById("term-input").value.trim()
  const pronunciacion = document.getElementById("pronunciation-input").value.trim()
  const traduccion = document.getElementById("translation-input").value.trim()
  const definicion = document.getElementById("definition-input").value.trim()
  const ejemplos = document.getElementById("example-input").value.trim()
  const categoria = document.getElementById("category-input").value

  if (!termino || !traduccion || !definicion) {
    mostrarNotificacion("Por favor completa todos los campos obligatorios", "error", { tabId: "add" })
    return
  }

  const nuevoTermino = {
    term: termino,
    pronunciation: pronunciacion || undefined,
    translation: traduccion,
    definition: definicion,
    examples: ejemplos
      ? ejemplos
          .split("\n")
          .map((e) => e.trim())
          .filter((e) => e)
      : undefined,
    category: categoria || "other",
    dateAdded: new Date().toISOString(),
  }

  const glosario = obtenerGlosario()

  // Verificar si ya existe
  const existe = glosario.find((t) => t.term.toLowerCase() === termino.toLowerCase())
  if (existe) {
    mostrarNotificacion("Este término ya existe en el glosario", "warning", { tabId: "add" })
    return
  }

  glosario.push(nuevoTermino)
  localStorage.setItem("glosario", JSON.stringify(glosario))

  mostrarNotificacion(`Término "${termino}" agregado correctamente`, "success", { tabId: "search" })

  // Limpiar formulario
  document.getElementById("add-term-form").reset()
  document.getElementById("other-category-group").style.display = "none"

  actualizarEstadisticas()
}

function manejarCategoriaOtra(event) {
  const otherGroup = document.getElementById("other-category-group")
  if (event.target.value === "other") {
    otherGroup.style.display = "block"
  } else {
    otherGroup.style.display = "none"
  }
}

// Exportar datos
function exportarDatos(formato) {
  const glosario = obtenerGlosario()

  if (glosario.length === 0) {
    mostrarNotificacion("No hay términos para exportar", "warning", { tabId: "add" })
    return
  }

  let contenido, nombreArchivo, tipoMime

  switch (formato) {
    case "json":
      contenido = JSON.stringify(glosario, null, 2)
      nombreArchivo = "glosario.json"
      tipoMime = "application/json"
      break

    case "csv":
      const headers = "Término,Pronunciación,Traducción,Definición,Ejemplos,Categoría\n"
      const filas = glosario
        .map(
          (t) =>
            `"${t.term}","${t.pronunciation || ""}","${t.translation}","${t.definition}","${(t.examples || []).join("; ")}","${t.category || ""}"`,
        )
        .join("\n")
      contenido = headers + filas
      nombreArchivo = "glosario.csv"
      tipoMime = "text/csv"
      break

    case "txt":
      contenido = glosario
        .map(
          (t) =>
            `${t.term}\n` +
            `Pronunciación: ${t.pronunciation || "N/A"}\n` +
            `Traducción: ${t.translation}\n` +
            `Definición: ${t.definition}\n` +
            `Ejemplos: ${(t.examples || []).join(", ") || "N/A"}\n` +
            `Categoría: ${t.category || "N/A"}\n` +
            `${"=".repeat(50)}\n`,
        )
        .join("\n")
      nombreArchivo = "glosario.txt"
      tipoMime = "text/plain"
      break
  }

  const blob = new Blob([contenido], { type: tipoMime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nombreArchivo
  link.click()
  URL.revokeObjectURL(url)

  mostrarNotificacion(`Glosario exportado como ${formato.toUpperCase()}`, "success", { tabId: "add" })
}

const verbosIrregulares = [
  { infinitivo: "arise", pasado: "arose", participio: "arisen" },
  { infinitivo: "awake", pasado: "awoke", participio: "awoken" },
  { infinitivo: "be", pasado: "was / were", participio: "been" },
  { infinitivo: "bear", pasado: "bore", participio: "borne" },
  { infinitivo: "beat", pasado: "beat", participio: "beaten" },
  { infinitivo: "become", pasado: "became", participio: "become" },
  { infinitivo: "begin", pasado: "began", participio: "begun" },
  { infinitivo: "bend", pasado: "bent", participio: "bent" },
  { infinitivo: "bet", pasado: "bet", participio: "bet" },
  { infinitivo: "bid", pasado: "bid", participio: "bid" },
  { infinitivo: "bite", pasado: "bit", participio: "bitten" },
  { infinitivo: "bleed", pasado: "bled", participio: "bled" },
  { infinitivo: "blow", pasado: "blew", participio: "blown" },
  { infinitivo: "break", pasado: "broke", participio: "broken" },
  { infinitivo: "bring", pasado: "brought", participio: "brought" },
  { infinitivo: "broadcast", pasado: "broadcast", participio: "broadcast" },
  { infinitivo: "build", pasado: "built", participio: "built" },
  { infinitivo: "burn", pasado: "burnt / burned", participio: "burnt / burned" },
  { infinitivo: "burst", pasado: "burst", participio: "burst" },
  { infinitivo: "buy", pasado: "bought", participio: "bought" },
  { infinitivo: "catch", pasado: "caught", participio: "caught" },
  { infinitivo: "choose", pasado: "chose", participio: "chosen" },
  { infinitivo: "come", pasado: "came", participio: "come" },
  { infinitivo: "cost", pasado: "cost", participio: "cost" },
  { infinitivo: "creep", pasado: "crept", participio: "crept" },
  { infinitivo: "cut", pasado: "cut", participio: "cut" },
  { infinitivo: "deal", pasado: "dealt", participio: "dealt" },
  { infinitivo: "dig", pasado: "dug", participio: "dug" },
  { infinitivo: "do", pasado: "did", participio: "done" },
  { infinitivo: "draw", pasado: "drew", participio: "drawn" },
  { infinitivo: "dream", pasado: "dreamt / dreamed", participio: "dreamt / dreamed" },
  { infinitivo: "drink", pasado: "drank", participio: "drunk" },
  { infinitivo: "drive", pasado: "drove", participio: "driven" },
  { infinitivo: "eat", pasado: "ate", participio: "eaten" },
  { infinitivo: "fall", pasado: "fell", participio: "fallen" },
  { infinitivo: "feed", pasado: "fed", participio: "fed" },
  { infinitivo: "feel", pasado: "felt", participio: "felt" },
  { infinitivo: "fight", pasado: "fought", participio: "fought" },
  { infinitivo: "find", pasado: "found", participio: "found" },
  { infinitivo: "fly", pasado: "flew", participio: "flown" },
  { infinitivo: "forbid", pasado: "forbade", participio: "forbidden" },
  { infinitivo: "forget", pasado: "forgot", participio: "forgotten" },
  { infinitivo: "forgive", pasado: "forgave", participio: "forgiven" },
  { infinitivo: "freeze", pasado: "froze", participio: "frozen" },
  { infinitivo: "get", pasado: "got", participio: "got / gotten" },
  { infinitivo: "give", pasado: "gave", participio: "given" },
  { infinitivo: "go", pasado: "went", participio: "gone" },
  { infinitivo: "grow", pasado: "grew", participio: "grown" },
  { infinitivo: "hang", pasado: "hung", participio: "hung" },
  { infinitivo: "have", pasado: "had", participio: "had" },
  { infinitivo: "hear", pasado: "heard", participio: "heard" },
  { infinitivo: "hide", pasado: "hid", participio: "hidden" },
  { infinitivo: "hit", pasado: "hit", participio: "hit" },
  { infinitivo: "hold", pasado: "held", participio: "held" },
  { infinitivo: "hurt", pasado: "hurt", participio: "hurt" },
  { infinitivo: "keep", pasado: "kept", participio: "kept" },
  { infinitivo: "kneel", pasado: "knelt / kneeled", participio: "knelt / kneeled" },
  { infinitivo: "know", pasado: "knew", participio: "known" },
  { infinitivo: "lay", pasado: "laid", participio: "laid" },
  { infinitivo: "lead", pasado: "led", participio: "led" },
  { infinitivo: "leave", pasado: "left", participio: "left" },
  { infinitivo: "lend", pasado: "lent", participio: "lent" },
  { infinitivo: "let", pasado: "let", participio: "let" },
  { infinitivo: "lie", pasado: "lay", participio: "lain" },
  { infinitivo: "light", pasado: "lit / lighted", participio: "lit / lighted" },
  { infinitivo: "lose", pasado: "lost", participio: "lost" },
  { infinitivo: "make", pasado: "made", participio: "made" },
  { infinitivo: "mean", pasado: "meant", participio: "meant" },
  { infinitivo: "meet", pasado: "met", participio: "met" },
  { infinitivo: "pay", pasado: "paid", participio: "paid" },
  { infinitivo: "put", pasado: "put", participio: "put" },
  { infinitivo: "read", pasado: "read", participio: "read" },
  { infinitivo: "ride", pasado: "rode", participio: "ridden" },
  { infinitivo: "ring", pasado: "rang", participio: "rung" },
  { infinitivo: "rise", pasado: "rose", participio: "risen" },
  { infinitivo: "run", pasado: "ran", participio: "run" },
  { infinitivo: "say", pasado: "said", participio: "said" },
  { infinitivo: "see", pasado: "saw", participio: "seen" },
  { infinitivo: "seek", pasado: "sought", participio: "sought" },
  { infinitivo: "sell", pasado: "sold", participio: "sold" },
  { infinitivo: "send", pasado: "sent", participio: "sent" },
  { infinitivo: "set", pasado: "set", participio: "set" },
  { infinitivo: "shake", pasado: "shook", participio: "shaken" },
  { infinitivo: "shine", pasado: "shone", participio: "shone" },
  { infinitivo: "shoot", pasado: "shot", participio: "shot" },
  { infinitivo: "show", pasado: "showed", participio: "shown / showed" },
  { infinitivo: "shut", pasado: "shut", participio: "shut" },
  { infinitivo: "sing", pasado: "sang", participio: "sung" },
  { infinitivo: "sink", pasado: "sank", participio: "sunk" },
  { infinitivo: "sit", pasado: "sat", participio: "sat" },
  { infinitivo: "sleep", pasado: "slept", participio: "slept" },
  { infinitivo: "slide", pasado: "slid", participio: "slid" },
  { infinitivo: "speak", pasado: "spoke", participio: "spoken" },
  { infinitivo: "spend", pasado: "spent", participio: "spent" },
  { infinitivo: "spill", pasado: "spilt / spilled", participio: "spilt / spilled" },
  { infinitivo: "spin", pasado: "spun", participio: "spun" },
  { infinitivo: "spit", pasado: "spat", participio: "spat / spit" },
  { infinitivo: "split", pasado: "split", participio: "split" },
  { infinitivo: "spread", pasado: "spread", participio: "spread" },
  { infinitivo: "stand", pasado: "stood", participio: "stood" },
  { infinitivo: "steal", pasado: "stole", participio: "stolen" },
  { infinitivo: "stick", pasado: "stuck", participio: "stuck" },
  { infinitivo: "sting", pasado: "stung", participio: "stung" },
  { infinitivo: "stink", pasado: "stank", participio: "stunk" },
  { infinitivo: "strike", pasado: "struck", participio: "struck" },
  { infinitivo: "swear", pasado: "swore", participio: "sworn" },
  { infinitivo: "sweep", pasado: "swept", participio: "swept" },
  { infinitivo: "swim", pasado: "swam", participio: "swum" },
  { infinitivo: "swing", pasado: "swung", participio: "swung" },
  { infinitivo: "take", pasado: "took", participio: "taken" },
  { infinitivo: "teach", pasado: "taught", participio: "taught" },
  { infinitivo: "tear", pasado: "tore", participio: "torn" },
  { infinitivo: "tell", pasado: "told", participio: "told" },
  { infinitivo: "think", pasado: "thought", participio: "thought" },
  { infinitivo: "throw", pasado: "threw", participio: "thrown" },
  { infinitivo: "understand", pasado: "understood", participio: "understood" },
  { infinitivo: "wake", pasado: "woke", participio: "woken" },
  { infinitivo: "wear", pasado: "wore", participio: "worn" },
  { infinitivo: "win", pasado: "won", participio: "won" },
  { infinitivo: "write", pasado: "wrote", participio: "written" },
]

function renderizarVerbos() {
  const tbody = document.getElementById("verbs-table-body")
  if (!tbody) return

  tbody.innerHTML = ""
  verbosIrregulares.forEach((v) => {
    const tr = document.createElement("tr")
    tr.innerHTML = `<td>${v.infinitivo}</td><td>${v.pasado}</td><td>${v.participio}</td>`
    tbody.appendChild(tr)
  })
}

// Agregar función de búsqueda para verbos irregulares
function buscarVerbosIrregulares() {
  const input = document.getElementById("verbs-search-input")
  const tbody = document.getElementById("verbs-table-body")
  const contador = document.getElementById("verbs-count")

  if (!input || !tbody) return

  const termino = input.value.trim().toLowerCase()

  // Limpiar tabla
  tbody.innerHTML = ""

  // Filtrar verbos
  const verbosEncontrados = verbosIrregulares.filter(
    (v) =>
      v.infinitivo.toLowerCase().includes(termino) ||
      v.pasado.toLowerCase().includes(termino) ||
      v.participio.toLowerCase().includes(termino),
  )

  // Mostrar resultados
  verbosEncontrados.forEach((v) => {
    const tr = document.createElement("tr")

    // Resaltar coincidencias
    const infinitivoResaltado = resaltarCoincidencia(v.infinitivo, termino)
    const pasadoResaltado = resaltarCoincidencia(v.pasado, termino)
    const participioResaltado = resaltarCoincidencia(v.participio, termino)

    tr.innerHTML = `<td>${infinitivoResaltado}</td><td>${pasadoResaltado}</td><td>${participioResaltado}</td>`
    tbody.appendChild(tr)
  })

  // Actualizar contador
  if (contador) {
    contador.textContent = `${verbosEncontrados.length} verbo(s) encontrado(s)`
  }

  // Si no hay término de búsqueda, mostrar todos
  if (termino === "") {
    renderizarVerbos()
    if (contador) {
      contador.textContent = `${verbosIrregulares.length} verbos en total`
    }
  }
}

// Función para resaltar coincidencias en el texto
function resaltarCoincidencia(texto, termino) {
  if (!termino) return texto

  const regex = new RegExp(`(${termino})`, "gi")
  return texto.replace(regex, "<mark>$1</mark>")
}

// Función para limpiar búsqueda de verbos
function limpiarBusquedaVerbos() {
  const input = document.getElementById("verbs-search-input")
  const contador = document.getElementById("verbs-count")

  if (input) {
    input.value = ""
  }

  renderizarVerbos()

  if (contador) {
    contador.textContent = `${verbosIrregulares.length} verbos en total`
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarVerbos()

  // Event listener para búsqueda de verbos irregulares
  const verbsSearchInput = document.getElementById("verbs-search-input")
  if (verbsSearchInput) {
    verbsSearchInput.addEventListener("input", buscarVerbosIrregulares)
  }

  const clearVerbsButton = document.getElementById("clear-verbs-search")
  if (clearVerbsButton) {
    clearVerbsButton.addEventListener("click", limpiarBusquedaVerbos)
  }

  // Inicializar contador de verbos
  const contador = document.getElementById("verbs-count")
  if (contador) {
    contador.textContent = `${verbosIrregulares.length} verbos en total`
  }
})

function activarTab(tabId, opciones = {}) {
  if (!tabId) return
  document.querySelectorAll(".tab-content").forEach((sec) => sec.classList.remove("active"))

  const targetSection = document.getElementById(tabId)
  if (targetSection) {
    targetSection.classList.add("active")
    if (opciones.scroll !== false) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const link = document.querySelector(`nav a[data-tab="${tabId}"]`)
  document.querySelectorAll("nav a[data-tab]").forEach((a) => a.classList.remove("active"))
  if (link) {
    link.classList.add("active")
  }

  if (tabId === "favorites") {
    mostrarFavoritos()
  }
}

// Manejo de pestañas del menú de navegación
document.querySelectorAll("nav a[data-tab]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const tabId = link.getAttribute("data-tab")
    activarTab(tabId)
  })
})

// Función para actualizar todas las estadísticas
function actualizarEstadisticas() {
  const glosario = obtenerGlosario()
  const favoritos = obtenerFavoritos()

  // Actualizar contadores
  document.getElementById("total-terms").textContent = glosario.length
  document.getElementById("favorite-terms").textContent = favoritos.length

  // Otros contadores se pueden agregar aquí
  const busquedas = localStorage.getItem("total-searches") || "0"
  document.getElementById("total-searches").textContent = busquedas

  // Términos añadidos hoy (simplificado)
  const hoy = new Date().toDateString()
  const terminosHoy = glosario.filter((t) => {
    const fechaTermino = t.dateAdded ? new Date(t.dateAdded).toDateString() : null
    return fechaTermino === hoy
  }).length
  document.getElementById("terms-today").textContent = terminosHoy
}

function obtenerFavoritos() {
  return JSON.parse(localStorage.getItem("favoritos")) || []
}

function mostrarFavoritos() {
  const favoritos = obtenerFavoritos()
  const lista = document.getElementById("favorites-list")
  const noFavoritos = document.getElementById("no-favorites")

  if (favoritos.length === 0) {
    lista.style.display = "none"
    noFavoritos.style.display = "block"
    return
  }

  lista.style.display = "grid"
  noFavoritos.style.display = "none"
  lista.innerHTML = ""

  favoritos.forEach((fav) => {
    const item = document.createElement("li")
    item.className = "favorite-item"
    item.innerHTML = `
      <button class="favorite-remove" onclick="removerFavorito('${fav.term}')" title="Remover de favoritos">
        &times;
      </button>
      <div class="favorite-term">${fav.term}</div>
      <div class="favorite-translation">${fav.translation}</div>
      <div class="favorite-category">${fav.category || "otros"}</div>
    `

    // Hacer clic en el favorito para buscarlo
    item.addEventListener("click", (e) => {
      if (!e.target.classList.contains("favorite-remove")) {
        document.getElementById("search-input").value = fav.term
        // Cambiar a la pestana de busqueda
        document.querySelector('nav a[data-tab="search"]').click()
        buscarTérmino()
      }
    })

    lista.appendChild(item)
  })
}

function removerFavorito(termino) {
  const favoritos = obtenerFavoritos()
  const nuevosFavoritos = favoritos.filter((fav) => fav.term.toLowerCase() !== termino.toLowerCase())
  localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos))
  mostrarNotificacion(`"${termino}" removido de favoritos`, "info", { tabId: "favorites" })
  mostrarFavoritos()
  actualizarEstadisticas()
}

function exportarFavoritos() {
  const favoritos = obtenerFavoritos()

  if (favoritos.length === 0) {
    mostrarNotificacion("No hay favoritos para exportar", "warning", { tabId: "favorites" })
    return
  }

  const dataStr = JSON.stringify(favoritos, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = "favoritos.json"
  link.click()
  URL.revokeObjectURL(url)

  mostrarNotificacion("Favoritos exportados correctamente", "success", { tabId: "favorites" })
}

// Agregar event listener para mostrar favoritos cuando se active la pestaña
document.addEventListener("DOMContentLoaded", () => {
  // Agregar listener para la pestaña de favoritos
  const favoritosTab = document.querySelector('nav a[data-tab="favorites"]')
  if (favoritosTab) {
    favoritosTab.addEventListener("click", () => {
      setTimeout(mostrarFavoritos, 100) // Pequeño delay para asegurar que la pestaña se active
    })
  }
})

// ==================== Búsqueda TIPO GOOGLE ====================

// Funciones para historial de búsquedas
function obtenerHistorialBusquedas() {
  return JSON.parse(localStorage.getItem("historialBusquedas")) || []
}

function guardarBusqueda(termino) {
  if (!termino || termino.trim() === "") return
  
  const historial = obtenerHistorialBusquedas()
  const terminoLower = termino.toLowerCase().trim()
  
  // Remover si ya existe
  const index = historial.findIndex(h => h.toLowerCase() === terminoLower)
  if (index !== -1) {
    historial.splice(index, 1)
  }
  
  // Agregar al inicio
  historial.unshift(terminoLower)
  
  // Limitar a 20 búsquedas
  if (historial.length > 20) {
    historial.pop()
  }
  
  localStorage.setItem("historialBusquedas", JSON.stringify(historial))
}

// Función para generar sugerencias organizadas por secciones
function generarSugerencias(query) {
  const queryLower = query.toLowerCase().trim()
  const sugerencias = {
    terminos: [],
    verbosIrregulares: [],
    tiemposVerbales: []
  }
  
  // Si no hay query, mostrar historial y sugerencias populares
  if (queryLower === "") {
    const historial = obtenerHistorialBusquedas()
    return {
      historial: historial.slice(0, 5),
      terminos: [],
      verbosIrregulares: [],
      tiemposVerbales: []
    }
  }
  
  // Buscar en términos
  const glosario = obtenerGlosario()
  sugerencias.terminos = glosario
    .filter(t => 
      t.term.toLowerCase().includes(queryLower) ||
      t.translation.toLowerCase().includes(queryLower)
    )
    .slice(0, 5)
    .map(t => ({
      tipo: "termino",
      termino: t.term,
      traduccion: t.translation,
      datos: t
    }))
  
  // Buscar en verbos irregulares
  sugerencias.verbosIrregulares = verbosIrregulares
    .filter(v => 
      v.infinitivo.toLowerCase().includes(queryLower) ||
      v.pasado.toLowerCase().includes(queryLower)
    )
    .slice(0, 5)
    .map(v => ({
      tipo: "verboIrregular",
      termino: v.infinitivo,
      traduccion: v.pasado,
      datos: v
    }))
  
  // Buscar en tiempos verbales (verbos comunes)
  const verbosComunes = [
    "work", "play", "open", "close", "listen", "watch", "learn", "fix", "build",
    "start", "stop", "study", "help", "like", "love", "need", "want", "use", "try", "call", "talk"
  ]
  sugerencias.tiemposVerbales = verbosComunes
    .filter(v => v.toLowerCase().includes(queryLower))
    .slice(0, 5)
    .map(v => ({
      tipo: "tiempoVerbal",
      termino: v,
      traduccion: `Verbo: ${v}`,
      datos: { verbo: v }
    }))
  
  return sugerencias
}

// Función para renderizar sugerencias
function renderizarSugerencias(query) {
  const container = document.getElementById("search-suggestions")
  if (!container) return
  
  const sugerencias = generarSugerencias(query)
  
  container.innerHTML = ""
  
  // Si no hay query, mostrar historial
  if (query === "") {
    if (sugerencias.historial && sugerencias.historial.length > 0) {
      const historialSection = document.createElement("div")
      historialSection.className = "suggestion-section"
      historialSection.innerHTML = `
        <div class="suggestion-section-header">
          <i class="fas fa-clock"></i>
          <span>Búsquedas recientes</span>
        </div>
        <div class="suggestion-list">
          ${sugerencias.historial.map(term => `
            <div class="suggestion-item" data-query="${term}">
              <i class="fas fa-history"></i>
              <span>${term}</span>
            </div>
          `).join("")}
        </div>
      `
      container.appendChild(historialSection)
    }
    
    // Mostrar sugerencias populares si no hay historial
    if (!sugerencias.historial || sugerencias.historial.length === 0) {
      const popularSection = document.createElement("div")
      popularSection.className = "suggestion-section"
      popularSection.innerHTML = `
        <div class="suggestion-section-header">
          <i class="fas fa-fire"></i>
          <span>Sugerencias</span>
        </div>
        <div class="suggestion-list">
          <div class="suggestion-item" data-query="work">
            <i class="fas fa-search"></i>
            <span>work</span>
          </div>
          <div class="suggestion-item" data-query="be">
            <i class="fas fa-search"></i>
            <span>be</span>
          </div>
          <div class="suggestion-item" data-query="have">
            <i class="fas fa-search"></i>
            <span>have</span>
          </div>
        </div>
      `
      container.appendChild(popularSection)
    }
    return
  }
  
  // Mostrar sugerencias por sección
  if (sugerencias.terminos.length > 0) {
    const terminosSection = document.createElement("div")
    terminosSection.className = "suggestion-section"
    terminosSection.innerHTML = `
      <div class="suggestion-section-header">
        <i class="fas fa-book"></i>
        <span>Términos</span>
      </div>
      <div class="suggestion-list">
        ${sugerencias.terminos.map(item => `
          <div class="suggestion-item" data-tipo="${item.tipo}" data-datos='${JSON.stringify(item.datos)}'>
            <i class="fas fa-bookmark"></i>
            <div class="suggestion-content">
              <span class="suggestion-term">${resaltarTexto(item.termino, query)}</span>
              <span class="suggestion-translation">${item.traduccion}</span>
            </div>
          </div>
        `).join("")}
      </div>
    `
    container.appendChild(terminosSection)
  }
  
  if (sugerencias.verbosIrregulares.length > 0) {
    const verbosSection = document.createElement("div")
    verbosSection.className = "suggestion-section"
    verbosSection.innerHTML = `
      <div class="suggestion-section-header">
        <i class="fas fa-language"></i>
        <span>Verbos Irregulares</span>
      </div>
      <div class="suggestion-list">
        ${sugerencias.verbosIrregulares.map(item => `
          <div class="suggestion-item" data-tipo="${item.tipo}" data-datos='${JSON.stringify(item.datos)}'>
            <i class="fas fa-language"></i>
            <div class="suggestion-content">
              <span class="suggestion-term">${resaltarTexto(item.termino, query)}</span>
              <span class="suggestion-translation">Pasado: ${item.traduccion}</span>
            </div>
          </div>
        `).join("")}
      </div>
    `
    container.appendChild(verbosSection)
  }
  
  if (sugerencias.tiemposVerbales.length > 0) {
    const tiemposSection = document.createElement("div")
    tiemposSection.className = "suggestion-section"
    tiemposSection.innerHTML = `
      <div class="suggestion-section-header">
        <i class="fas fa-clock"></i>
        <span>Tiempos Verbales</span>
      </div>
      <div class="suggestion-list">
        ${sugerencias.tiemposVerbales.map(item => `
          <div class="suggestion-item" data-tipo="${item.tipo}" data-datos='${JSON.stringify(item.datos)}'>
            <i class="fas fa-clock"></i>
            <div class="suggestion-content">
              <span class="suggestion-term">${resaltarTexto(item.termino, query)}</span>
              <span class="suggestion-translation">Verbo para tiempos verbales</span>
            </div>
          </div>
        `).join("")}
      </div>
    `
    container.appendChild(tiemposSection)
  }
  
  // Si no hay sugerencias
  if (sugerencias.terminos.length === 0 && 
      sugerencias.verbosIrregulares.length === 0 && 
      sugerencias.tiemposVerbales.length === 0) {
    container.innerHTML = `
      <div class="no-suggestions">
        <i class="fas fa-search"></i>
        <p>No se encontraron resultados para "${query}"</p>
      </div>
    `
  }
  
  // Agregar event listeners a las sugerencias
  container.querySelectorAll(".suggestion-item").forEach(item => {
    item.addEventListener("click", () => {
      const tipo = item.getAttribute("data-tipo")
      const datosStr = item.getAttribute("data-datos")
      const queryAttr = item.getAttribute("data-query")
      
      if (queryAttr) {
        // Es una búsqueda del historial
        document.getElementById("search-input-modal").value = queryAttr
        renderizarSugerencias(queryAttr)
        return
      }
      
      if (tipo && datosStr) {
        const datos = JSON.parse(datosStr)
        mostrarResultadoSeleccionado(tipo, datos)
        guardarBusqueda(datos.term || datos.infinitivo || datos.verbo || "")
      }
    })
  })
}

// Función para resaltar texto
function resaltarTexto(texto, query) {
  if (!query) return texto
  const regex = new RegExp(`(${query})`, "gi")
  return texto.replace(regex, "<mark>$1</mark>")
}

// Función para mostrar resultado seleccionado
function mostrarResultadoSeleccionado(tipo, datos) {
  const suggestionsView = document.getElementById("search-suggestions")
  const resultView = document.getElementById("search-result-view")
  const resultContent = document.getElementById("search-result-content")
  
  if (!suggestionsView || !resultView || !resultContent) return
  
  suggestionsView.classList.add("hidden")
  resultView.classList.remove("hidden")
  
  let html = ""
  
  if (tipo === "termino") {
    const favoritos = obtenerFavoritos()
    const esFavorito = favoritos.some(f => f.term.toLowerCase() === datos.term.toLowerCase())
    
    const termEscaped = datos.term.replace(/'/g, "&#39;").replace(/"/g, "&quot;")
    const translationEscaped = (datos.translation || "N/A").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const definitionEscaped = (datos.definition || "N/A").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    
    html = `
      <div class="result-detail-card">
        <div class="result-detail-header">
          <h2>${datos.term}</h2>
          <div class="result-detail-actions">
            <button class="icon-button" onclick="pronunciar('${termEscaped}')" title="Pronunciar">
              <i class="fas fa-volume-up"></i>
            </button>
            <button class="icon-button ${esFavorito ? 'favorited' : ''}" onclick="toggleFavoritoDesdeModal('${termEscaped}')" title="${esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
              <i class="fas fa-star"></i>
            </button>
          </div>
        </div>
        <div class="result-detail-pronunciation">
          <span>/${datos.pronunciation || ""}/</span>
        </div>
        <div class="result-detail-section">
          <h3>Traducción</h3>
          <p>${translationEscaped}</p>
        </div>
        <div class="result-detail-section">
          <h3>Definición</h3>
          <p>${definitionEscaped}</p>
        </div>
        ${datos.examples && datos.examples.length > 0 ? `
          <div class="result-detail-section">
            <h3>Ejemplos</h3>
            <ul>
              ${datos.examples.map(e => `<li>${e.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
        <div class="result-detail-category">
          <span class="category-tag">${datos.category || "otros"}</span>
        </div>
      </div>
    `
  } else if (tipo === "verboIrregular") {
    html = `
      <div class="result-detail-card">
        <div class="result-detail-header">
          <h2>Verbo Irregular: ${datos.infinitivo}</h2>
        </div>
        <div class="verb-table-container">
          <table class="verb-table">
            <thead>
              <tr>
                <th>Infinitivo</th>
                <th>Pasado Simple</th>
                <th>Participio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${datos.infinitivo}</td>
                <td>${datos.pasado}</td>
                <td>${datos.participio}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="result-detail-section">
          <h3>Información</h3>
          <p>Este es un verbo irregular en inglés. Su forma en pasado simple es <strong>${datos.pasado}</strong> y su participio es <strong>${datos.participio}</strong>.</p>
        </div>
      </div>
    `
  } else if (tipo === "tiempoVerbal") {
    const verbo = datos.verbo
    const forms = conjugateAll(verbo)
    const subject = "I"
    
    html = `
      <div class="result-detail-card">
        <div class="result-detail-header">
          <h2>Tiempos Verbales: ${verbo}</h2>
        </div>
        <div class="tenses-display-modal">
          ${TENSES.map(t => {
            const example = generateExampleText(t, forms, subject)
            return `
              <div class="tense-card-modal">
                <h4>${t.name}</h4>
                <div class="tense-structure">${t.structure}</div>
                <div class="tense-example">${example}</div>
              </div>
            `
          }).join("")}
        </div>
      </div>
    `
  }
  
  resultContent.innerHTML = html
}

// Función para volver a sugerencias
function volverASugerencias() {
  const suggestionsView = document.getElementById("search-suggestions")
  const resultView = document.getElementById("search-result-view")
  
  if (!suggestionsView || !resultView) return
  
  suggestionsView.classList.remove("hidden")
  resultView.classList.add("hidden")
  
  const input = document.getElementById("search-input-modal")
  if (input) {
    renderizarSugerencias(input.value)
  }
}

// Función para toggle favorito desde el modal
function toggleFavoritoDesdeModal(termino) {
  toggleFavorito(termino)
  
  // Actualizar el botón de favorito en el modal
  const favoritos = obtenerFavoritos()
  const esFavorito = favoritos.some(f => f.term.toLowerCase() === termino.toLowerCase())
  const button = document.querySelector(`button[onclick="toggleFavoritoDesdeModal('${termino}')"]`)
  if (button) {
    if (esFavorito) {
      button.classList.add("favorited")
      button.setAttribute("title", "Quitar de favoritos")
    } else {
      button.classList.remove("favorited")
      button.setAttribute("title", "Agregar a favoritos")
    }
  }
}

// Inicializar búsqueda tipo Google
function inicializarBusquedaGoogle() {
  const searchButton = document.getElementById("search-button")
  const searchModal = document.getElementById("search-modal")
  const closeButton = document.getElementById("close-search-modal")
  const clearButton = document.getElementById("clear-search-modal")
  const searchInput = document.getElementById("search-input-modal")
  const backButton = document.getElementById("back-to-suggestions")
  const overlay = document.querySelector(".search-modal-overlay")
  
  if (!searchButton || !searchModal || !searchInput) return
  
  // Abrir modal
  searchButton.addEventListener("click", (e) => {
    e.preventDefault()
    searchModal.classList.remove("hidden")
    searchModal.classList.add("visible")
    setTimeout(() => {
      searchInput.focus()
      renderizarSugerencias("")
    }, 100)
  })
  
  // Cerrar modal
  const cerrarModal = () => {
    searchModal.classList.remove("visible")
    searchModal.classList.add("hidden")
    volverASugerencias()
    if (searchInput) searchInput.value = ""
  }
  
  if (closeButton) {
    closeButton.addEventListener("click", cerrarModal)
  }
  
  if (overlay) {
    overlay.addEventListener("click", cerrarModal)
  }
  
  // Limpiar búsqueda
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      searchInput.value = ""
      clearButton.style.display = "none"
      renderizarSugerencias("")
      volverASugerencias()
    })
  }
  
  // Búsqueda en tiempo real
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value
      if (query.length > 0) {
        if (clearButton) clearButton.style.display = "block"
      } else {
        if (clearButton) clearButton.style.display = "none"
      }
      renderizarSugerencias(query)
    })
    
    // Guardar búsqueda al presionar Enter
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && searchInput.value.trim()) {
        guardarBusqueda(searchInput.value.trim())
      }
    })
  }
  
  // Volver a sugerencias
  if (backButton) {
    backButton.addEventListener("click", volverASugerencias)
  }
  
  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchModal.classList.contains("visible")) {
      cerrarModal()
    }
  })
}



