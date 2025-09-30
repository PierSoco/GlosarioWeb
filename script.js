// Variables globales para configuración
let currentSettings = {
  fontSize: 100,
  speechRate: 1,
  selectedVoice: null,
  voices: [],
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarTodosLosTerminos()
  inicializarTema()
  inicializarConfiguracion()
  cargarVoces()

  // Búsqueda en tiempo real
  document.getElementById("search-input").addEventListener("input", buscarEnTiempoReal)

  // Manejadores del botón de tema (ambos botones)
  document.getElementById("theme-switch").addEventListener("click", cambiarTema)
  document.getElementById("theme-switch-setting").addEventListener("click", cambiarTema)

  // Manejadores de configuración
  document.getElementById("font-size").addEventListener("input", cambiarTamañoFuente)
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

  document.getElementById("category-filter").addEventListener("change", buscarEnTiempoReal);
  document.getElementById("exact-match").addEventListener("change", buscarEnTiempoReal);
  document.getElementById("search-description").addEventListener("change", buscarEnTiempoReal);
  document.getElementById("only-favorites").addEventListener("change", buscarEnTiempoReal);
  document.getElementById("sort-filter").addEventListener("change", buscarEnTiempoReal);



    // Mostrar el modal al tocar la lupa
  document.getElementById("search-button").addEventListener("click", (e) => {
    e.preventDefault()
    document.getElementById("search-modal").classList.add("visible")
    document.getElementById("search-modal").classList.remove("hidden")
    document.getElementById("search-input").focus()
  })

  // Cerrar el modal
  document.getElementById("close-search-modal").addEventListener("click", () => {
    document.getElementById("search-modal").classList.remove("visible")
    document.getElementById("search-modal").classList.add("hidden")
  })






  document.getElementById("search-button").addEventListener("click", (e) => {
    e.preventDefault()
    const modal = document.getElementById("search-modal")
    modal.classList.remove("hidden")
    modal.classList.add("visible")
    document.getElementById("search-input").focus()
  })

  document.getElementById("close-search-modal").addEventListener("click", () => {
    const modal = document.getElementById("search-modal")
    modal.classList.remove("visible")
    modal.classList.add("hidden")
  })

  document.getElementById("search-input").addEventListener("input", buscarEnTiempoReal)
  document.getElementById("category-filter").addEventListener("change", buscarEnTiempoReal)
  document.getElementById("sort-filter").addEventListener("change", buscarEnTiempoReal)
  document.getElementById("only-favorites").addEventListener("change", buscarEnTiempoReal)

})

function mostrarTodosLosTerminos() {
  const nuevosTerminos = [
    {
      term: "however",
      pronunciation: "hau·we·r",
      translation: "sin embargo",
      definition: "Conjunción usada para contrastar ideas.",
      examples: ["I wanted to go; however, it rained."],
      category: "other",
    },
    {
      term: "hold",
      pronunciation: "həʊld",
      translation: "mantener",
      definition: "Sujetar o mantener algo en posición.",
      examples: ["Please hold this for a moment."],
      category: "programming",
    },
    {
      term: "between",
      pronunciation: "bɪˈtwiːn",
      translation: "entre",
      definition: "En el espacio o intervalo que separa dos cosas.",
      examples: ["The keys are between the books."],
      category: "other",
    },
    {
      term: "breadcrumbs",
      pronunciation: "ˈbrɛdˌkrʌmz",
      translation: "migas de pan",
      definition: "Atajos o enlaces de navegación para volver a una sección anterior.",
      examples: ["Click the breadcrumbs to go back to the homepage."],
      category: "software",
    },
    {
      term: "up to",
      pronunciation: "ʌp tuː",
      translation: "hasta (en lugares)",
      definition: "Indica el límite superior de algo.",
      examples: ["Walk up to the door."],
      category: "other",
    },
    {
      term: "dropdown",
      pronunciation: "drɒp.daʊn",
      translation: "menú desplegable",
      definition: "Elemento de interfaz que muestra opciones al hacer clic.",
      examples: ["Choose a value from the dropdown."],
      category: "software",
    },
    {
      term: "siblings",
      pronunciation: "ˈsɪblɪŋz",
      translation: "etiqueta hermana de un mismo padre",
      definition: "Etiquetas que comparten el mismo elemento padre.",
      examples: ["Use .siblings() to select them."],
      category: "programming",
    },
    {
      term: "path",
      pronunciation: "pæθ",
      translation: "camino",
      definition: "Ruta que indica la ubicación de un archivo o recurso.",
      examples: ["The path to the file is C:/docs/file.txt."],
      category: "software",
    },
    {
      term: "below",
      pronunciation: "bɪˈləʊ",
      translation: "debajo",
      definition: "En una posición más baja.",
      examples: ["Scroll down to see what's below."],
      category: "other",
    },
    {
      term: "toggle",
      pronunciation: "ˈtɒɡəl",
      translation: "alternar",
      definition: "Cambiar entre dos estados.",
      examples: ["Click the button to toggle the menu."],
      category: "software",
    },
    {
      term: "both",
      pronunciation: "bəʊθ",
      translation: "ambos",
      definition: "Dos elementos a la vez.",
      examples: ["Both files are corrupted."],
      category: "other",
    },
    {
      term: "shortcuts",
      pronunciation: "ˈʃɔːt.kʌts",
      translation: "atajos",
      definition: "Combinaciones de teclas para ejecutar acciones rápidamente.",
      examples: ["Ctrl+C is a common shortcut."],
      category: "software",
    },
    {
      term: "matching",
      pronunciation: "ˈmætʃɪŋ",
      translation: "coincidir",
      definition: "Cuando dos elementos tienen características iguales.",
      examples: ["Use matching brackets."],
      category: "programming",
    },
    {
      term: "hover over",
      pronunciation: "ˈhʌvər ˈəʊvər",
      translation: "posicionarse sobre",
      definition: "Mover el cursor sobre un elemento sin hacer clic.",
      examples: ["Hover over the image to zoom."],
      category: "software",
    },
    {
      term: "keybinding",
      pronunciation: "kiːˌbaɪndɪŋ",
      translation: "vinculación de teclas",
      definition: "Asignación de una tecla o combinación a una acción.",
      examples: ["You can customize keybindings."],
      category: "software",
    },
    {
      term: "peek",
      pronunciation: "piːk",
      translation: "pispiar / echar un vistazo",
      definition: "Ver rápidamente algo.",
      examples: ["Let's peek at the result."],
      category: "other",
    },
    {
      term: "embed",
      pronunciation: "ɪmˈbɛd",
      translation: "incluir",
      definition: "Insertar contenido dentro de otro.",
      examples: ["Embed the video on the page."],
      category: "software",
    },
    {
      term: "bracket",
      pronunciation: "ˈbrækɪt",
      translation: "corchete",
      definition: "Símbolo utilizado en programación o escritura.",
      examples: ["Use square brackets in arrays."],
      category: "programming",
    },
    {
      term: "bracket matching",
      pronunciation: "ˈbrækɪt ˈmætʃɪŋ",
      translation: "corchetes coincidentes",
      definition: "Resaltar o verificar pares de corchetes.",
      examples: ["The editor has bracket matching."],
      category: "programming",
    },
    {
      term: "as soon as",
      pronunciation: "æz suːn æz",
      translation: "tan pronto como",
      definition: "Indica inmediatez de acción.",
      examples: ["I'll call you as soon as I arrive."],
      category: "other",
    },
    {
      term: "throughout",
      pronunciation: "θruːˈaʊt",
      translation: "a lo largo de",
      definition: "Durante todo el periodo o lugar.",
      examples: ["Throughout the day."],
      category: "other",
    },
    {
      term: "invoke",
      pronunciation: "ɪnˈvəʊk",
      translation: "usar",
      definition: "Llamar a una función o comando.",
      examples: ["Invoke the method directly."],
      category: "programming",
    },
    {
      term: "across",
      pronunciation: "əˈkrɒs",
      translation: "a lo largo de",
      definition: "De un lado a otro.",
      examples: ["Spread across regions."],
      category: "other",
    },
    {
      term: "the loop",
      pronunciation: "ðə luːp",
      translation: "el bucle",
      definition: "Secuencia que se repite en programación.",
      examples: ["Inside the loop, add 1."],
      category: "programming",
    },
    {
      term: "fix",
      pronunciation: "fɪks",
      translation: "arreglar/reparar",
      definition: "Corregir un error.",
      examples: ["Fix the bug in the code."],
      category: "programming",
    },
    {
      term: "inlay hints",
      pronunciation: "ˈɪn.leɪ hɪnts",
      translation: "pistas incrustadas",
      definition: "Sugerencias visuales dentro del código.",
      examples: ["Enable inlay hints in the editor."],
      category: "software",
    },
    {
      term: "brings up",
      pronunciation: "brɪŋz ʌp",
      translation: "trae",
      definition: "Mostrar o presentar algo.",
      examples: ["This brings up a menu."],
      category: "software",
    },
    {
      term: "printout",
      pronunciation: "ˈprɪnt.aʊt",
      translation: "copia impresa",
      definition: "Documento físico impreso.",
      examples: ["The report is in the printout."],
      category: "hardware",
    },
    {
      term: "wipe out",
      pronunciation: "waɪp aʊt",
      translation: "borrar",
      definition: "Eliminar completamente.",
      examples: ["Wipe out all user data."],
      category: "security",
    },
    {
      term: "annoying",
      pronunciation: "əˈnɔɪ.ɪŋ",
      translation: "molesto",
      definition: "Algo que causa molestia.",
      examples: ["That popup is very annoying."],
      category: "other",
    },
    {
      term: "hook up",
      pronunciation: "hʊk ʌp",
      translation: "conectar",
      definition: "Conectar un dispositivo o componente.",
      examples: ["Hook up the speakers to the PC."],
      category: "hardware",
    },
    {
      term: "opt in",
      pronunciation: "ɒpt ɪn",
      translation: "optar / decidir",
      definition: "Elegir participar en algo.",
      examples: ["You must opt in to receive emails."],
      category: "security",
    },
    {
      term: "wrapper",
      pronunciation: "ˈræpər",
      translation: "encapsulador",
      definition: "Objeto que encapsula otro para agregar funcionalidad.",
      examples: ["Use a wrapper for the API."],
      category: "programming",
    },
    {
      term: "which",
      pronunciation: "wɪtʃ",
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

  // Aplicar tamaño de fuente
  document.documentElement.style.fontSize = currentSettings.fontSize / 100 + "rem"
}

function cambiarTamañoFuente(event) {
  const nuevoTamaño = Number.parseInt(event.target.value)
  currentSettings.fontSize = nuevoTamaño
  document.getElementById("font-size-value").textContent = nuevoTamaño + "%"
  document.documentElement.style.fontSize = nuevoTamaño / 100 + "rem"
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

  mostrarNotificacion("Copia de seguridad creada correctamente", "success")
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

      mostrarNotificacion("Datos restaurados correctamente", "success")

      // Actualizar vista actual
      const inputActual = document.getElementById("search-input").value.trim()
      if (inputActual) {
        buscarEnTiempoReal()
      } else {
        mostrarResultados(obtenerGlosario())
      }

      actualizarEstadisticas()
    } catch (error) {
      mostrarNotificacion("Error al restaurar los datos. Archivo inválido.", "error")
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
  }
  inicializarConfiguracion()

  // Limpiar vista
  mostrarResultados([])
  actualizarEstadisticas()

  mostrarNotificacion("Todos los datos han sido borrados", "info")
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

    // Verificar si el término está en favoritos
    const favoritos = obtenerFavoritos()
    const esFavorito = favoritos.some((fav) => fav.term.toLowerCase() === t.term.toLowerCase())
    const iconoFavorito = esFavorito ? "⭐" : "☆"
    const claseFavorito = esFavorito ? "favorited" : ""

    item.innerHTML = `
            <button class="favorite-button ${claseFavorito}" onclick="toggleFavorito('${t.term}')" title="${esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}">
                ${iconoFavorito}
            </button>
            <div class="result-header">
                <span class="result-term">${t.term}</span>
            </div>
            <div class="result-pronunciation">/${t.pronunciation || ""}/ <button onclick="pronunciar('${t.term}')">🔊</button></div>
            <div class="result-translation"><strong>Traducción:</strong> ${t.translation || "N/A"}</div>
            <div class="result-definition"><strong>Definición:</strong> ${t.definition || "N/A"}</div>
            <div class="result-definition"><strong>Ejemplos:</strong><br> ${t.examples?.map((e) => `• ${e}`).join("<br>") || "No hay ejemplos"}</div>
            <div class="result-category">${t.category || "otros"}</div>
        `
    lista.appendChild(item)
  })
}

function toggleFavorito(termino) {
  const glosario = obtenerGlosario()
  const terminoCompleto = glosario.find((t) => t.term.toLowerCase() === termino.toLowerCase())

  if (!terminoCompleto) {
    mostrarNotificacion("Término no encontrado", "error")
    return
  }

  const favoritos = obtenerFavoritos()
  const indiceExistente = favoritos.findIndex((fav) => fav.term.toLowerCase() === termino.toLowerCase())

  if (indiceExistente !== -1) {
    // Remover de favoritos
    favoritos.splice(indiceExistente, 1)
    localStorage.setItem("favoritos", JSON.stringify(favoritos))
    mostrarNotificacion(`"${termino}" removido de favoritos`, "info")
  } else {
    // Agregar a favoritos
    const nuevoFavorito = {
      ...terminoCompleto,
      fechaFavorito: new Date().toISOString(),
    }
    favoritos.push(nuevoFavorito)
    localStorage.setItem("favoritos", JSON.stringify(favoritos))
    mostrarNotificacion(`"${termino}" agregado a favoritos`, "success")
  }

  // Actualizar la vista actual
  const inputActual = document.getElementById("search-input").value.trim()
  if (inputActual) {
    buscarEnTiempoReal()
  } else {
    mostrarResultados(obtenerGlosario())
  }

  // Actualizar estadísticas y favoritos si están visibles
  actualizarEstadisticas()
  if (document.getElementById("favorites").classList.contains("active")) {
    mostrarFavoritos()
  }
}

function obtenerGlosario() {
  return JSON.parse(localStorage.getItem("glosario")) || []
}

function mostrarNotificacion(mensaje, tipo = "info") {
  const n = document.getElementById("notification")
  n.textContent = mensaje
  n.className = `notification show ${tipo}`
  setTimeout(() => {
    n.className = "notification"
  }, 4000)
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
    mostrarNotificacion("Por favor completa todos los campos obligatorios", "error")
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
    mostrarNotificacion("Este término ya existe en el glosario", "warning")
    return
  }

  glosario.push(nuevoTermino)
  localStorage.setItem("glosario", JSON.stringify(glosario))

  mostrarNotificacion(`Término "${termino}" agregado correctamente`, "success")

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
    mostrarNotificacion("No hay términos para exportar", "warning")
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

  mostrarNotificacion(`Glosario exportado como ${formato.toUpperCase()}`, "success")
}

const verbosIrregulares = [
  { infinitivo: "arise", pasado: "arose" },
  { infinitivo: "awake", pasado: "awoke" },
  { infinitivo: "be", pasado: "was / were" },
  { infinitivo: "bear", pasado: "bore" },
  { infinitivo: "beat", pasado: "beat" },
  { infinitivo: "become", pasado: "became" },
  { infinitivo: "begin", pasado: "began" },
  { infinitivo: "bend", pasado: "bent" },
  { infinitivo: "bet", pasado: "bet" },
  { infinitivo: "bid", pasado: "bid" },
  { infinitivo: "bite", pasado: "bit" },
  { infinitivo: "bleed", pasado: "bled" },
  { infinitivo: "blow", pasado: "blew" },
  { infinitivo: "break", pasado: "broke" },
  { infinitivo: "bring", pasado: "brought" },
  { infinitivo: "broadcast", pasado: "broadcast" },
  { infinitivo: "build", pasado: "built" },
  { infinitivo: "burn", pasado: "burnt / burned" },
  { infinitivo: "burst", pasado: "burst" },
  { infinitivo: "buy", pasado: "bought" },
  { infinitivo: "catch", pasado: "caught" },
  { infinitivo: "choose", pasado: "chose" },
  { infinitivo: "come", pasado: "came" },
  { infinitivo: "cost", pasado: "cost" },
  { infinitivo: "creep", pasado: "crept" },
  { infinitivo: "cut", pasado: "cut" },
  { infinitivo: "deal", pasado: "dealt" },
  { infinitivo: "dig", pasado: "dug" },
  { infinitivo: "do", pasado: "did" },
  { infinitivo: "draw", pasado: "drew" },
  { infinitivo: "dream", pasado: "dreamt / dreamed" },
  { infinitivo: "drink", pasado: "drank" },
  { infinitivo: "drive", pasado: "drove" },
  { infinitivo: "eat", pasado: "ate" },
  { infinitivo: "fall", pasado: "fell" },
  { infinitivo: "feed", pasado: "fed" },
  { infinitivo: "feel", pasado: "felt" },
  { infinitivo: "fight", pasado: "fought" },
  { infinitivo: "find", pasado: "found" },
  { infinitivo: "fly", pasado: "flew" },
  { infinitivo: "forbid", pasado: "forbade" },
  { infinitivo: "forget", pasado: "forgot" },
  { infinitivo: "forgive", pasado: "forgave" },
  { infinitivo: "freeze", pasado: "froze" },
  { infinitivo: "get", pasado: "got" },
  { infinitivo: "give", pasado: "gave" },
  { infinitivo: "go", pasado: "went" },
  { infinitivo: "grow", pasado: "grew" },
  { infinitivo: "hang", pasado: "hung" },
  { infinitivo: "have", pasado: "had" },
  { infinitivo: "hear", pasado: "heard" },
  { infinitivo: "hide", pasado: "hid" },
  { infinitivo: "hit", pasado: "hit" },
  { infinitivo: "hold", pasado: "held" },
  { infinitivo: "hurt", pasado: "hurt" },
  { infinitivo: "keep", pasado: "kept" },
  { infinitivo: "kneel", pasado: "knelt / kneeled" },
  { infinitivo: "know", pasado: "knew" },
  { infinitivo: "lay", pasado: "laid" },
  { infinitivo: "lead", pasado: "led" },
  { infinitivo: "leave", pasado: "left" },
  { infinitivo: "lend", pasado: "lent" },
  { infinitivo: "let", pasado: "let" },
  { infinitivo: "lie", pasado: "lay" },
  { infinitivo: "light", pasado: "lit / lighted" },
  { infinitivo: "lose", pasado: "lost" },
  { infinitivo: "make", pasado: "made" },
  { infinitivo: "mean", pasado: "meant" },
  { infinitivo: "meet", pasado: "met" },
  { infinitivo: "pay", pasado: "paid" },
  { infinitivo: "put", pasado: "put" },
  { infinitivo: "read", pasado: "read" },
  { infinitivo: "ride", pasado: "rode" },
  { infinitivo: "ring", pasado: "rang" },
  { infinitivo: "rise", pasado: "rose" },
  { infinitivo: "run", pasado: "ran" },
  { infinitivo: "say", pasado: "said" },
  { infinitivo: "see", pasado: "saw" },
  { infinitivo: "seek", pasado: "sought" },
  { infinitivo: "sell", pasado: "sold" },
  { infinitivo: "send", pasado: "sent" },
  { infinitivo: "set", pasado: "set" },
  { infinitivo: "shake", pasado: "shook" },
  { infinitivo: "shine", pasado: "shone" },
  { infinitivo: "shoot", pasado: "shot" },
  { infinitivo: "show", pasado: "showed" },
  { infinitivo: "shut", pasado: "shut" },
  { infinitivo: "sing", pasado: "sang" },
  { infinitivo: "sink", pasado: "sank" },
  { infinitivo: "sit", pasado: "sat" },
  { infinitivo: "sleep", pasado: "slept" },
  { infinitivo: "slide", pasado: "slid" },
  { infinitivo: "speak", pasado: "spoke" },
  { infinitivo: "spend", pasado: "spent" },
  { infinitivo: "spill", pasado: "spilt / spilled" },
  { infinitivo: "spin", pasado: "spun" },
  { infinitivo: "spit", pasado: "spat" },
  { infinitivo: "split", pasado: "split" },
  { infinitivo: "spread", pasado: "spread" },
  { infinitivo: "stand", pasado: "stood" },
  { infinitivo: "steal", pasado: "stole" },
  { infinitivo: "stick", pasado: "stuck" },
  { infinitivo: "sting", pasado: "stung" },
  { infinitivo: "stink", pasado: "stank" },
  { infinitivo: "strike", pasado: "struck" },
  { infinitivo: "swear", pasado: "swore" },
  { infinitivo: "sweep", pasado: "swept" },
  { infinitivo: "swim", pasado: "swam" },
  { infinitivo: "swing", pasado: "swung" },
  { infinitivo: "take", pasado: "took" },
  { infinitivo: "teach", pasado: "taught" },
  { infinitivo: "tear", pasado: "tore" },
  { infinitivo: "tell", pasado: "told" },
  { infinitivo: "think", pasado: "thought" },
  { infinitivo: "throw", pasado: "threw" },
  { infinitivo: "understand", pasado: "understood" },
  { infinitivo: "wake", pasado: "woke" },
  { infinitivo: "wear", pasado: "wore" },
  { infinitivo: "win", pasado: "won" },
  { infinitivo: "write", pasado: "wrote" },
]

function renderizarVerbos() {
  const tbody = document.getElementById("verbs-table-body")
  if (!tbody) return

  tbody.innerHTML = ""
  verbosIrregulares.forEach((v) => {
    const tr = document.createElement("tr")
    tr.innerHTML = `<td>${v.infinitivo}</td><td>${v.pasado}</td>`
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
    (v) => v.infinitivo.toLowerCase().includes(termino) || v.pasado.toLowerCase().includes(termino),
  )

  // Mostrar resultados
  verbosEncontrados.forEach((v) => {
    const tr = document.createElement("tr")

    // Resaltar coincidencias
    const infinitivoResaltado = resaltarCoincidencia(v.infinitivo, termino)
    const pasadoResaltado = resaltarCoincidencia(v.pasado, termino)

    tr.innerHTML = `<td>${infinitivoResaltado}</td><td>${pasadoResaltado}</td>`
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

// Manejo de pestañas del menú de navegación
document.querySelectorAll("nav a[data-tab]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault()

    const tabId = link.getAttribute("data-tab")

    // Activar la sección correspondiente
    document.querySelectorAll(".tab-content").forEach((sec) => {
      sec.classList.remove("active")
    })

    const targetSection = document.getElementById(tabId)
    if (targetSection) {
      targetSection.classList.add("active")
    }

    // Cambiar clase activa en el nav
    document.querySelectorAll("nav a[data-tab]").forEach((a) => {
      a.classList.remove("active")
    })
    link.classList.add("active")
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
        ×
      </button>
      <div class="favorite-term">${fav.term}</div>
      <div class="favorite-translation">${fav.translation}</div>
      <div class="favorite-category">${fav.category || "otros"}</div>
    `

    // Hacer clic en el favorito para buscarlo
    item.addEventListener("click", (e) => {
      if (!e.target.classList.contains("favorite-remove")) {
        document.getElementById("search-input").value = fav.term
        // Cambiar a la pestaña de búsqueda
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
  mostrarNotificacion(`"${termino}" removido de favoritos`, "info")
  mostrarFavoritos()
  actualizarEstadisticas()
}

function exportarFavoritos() {
  const favoritos = obtenerFavoritos()

  if (favoritos.length === 0) {
    mostrarNotificacion("No hay favoritos para exportar", "warning")
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

  mostrarNotificacion("Favoritos exportados correctamente", "success")
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
