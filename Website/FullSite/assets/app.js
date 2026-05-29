const translations = {
  es: {
    title: "Árboles de la Antigua",
    login: "Iniciar sesión",
    loveTrees: "La Antigua ama sus árboles",
    sobre: "Sobre",
    plantas: "Plantas",
    cuadrillas: "Cuadrillas",
    recursos: "Recursos",
    noticias: "Noticias",
    inventario: "Inventario",
    galeria: "Galería",
    calendario: "Calendario",
    contacto: "Contacto",
    dark: "Oscuro",
    light: "Claro",
    pageHeadingSobre: "Sobre Nosotros",
    pageHeadingPlantas: "Plantas",
    pageHeadingCuadrillas: "Cuadrillas",
    pageHeadingRecursos: "Recursos",
    pageHeadingNoticias: "Noticias",
    pageHeadingInventario: "Inventario",
    pageHeadingGaleria: "Galería",
    pageHeadingCalendario: "Calendario",
    pageHeadingContacto: "Contacto",
    descripcion: "Descripción",
    comites: "Comités",
    socios: "Socios",
    catalogo: "Catálogo",
    disponiblePedirPlantas: "Disponible: Pedir Plantas",
    donaciones: "Donaciones",
    funciones: "Funciones",
    inscripcion: "Inscripción",
    equipo: "Equipo",
    canalesComunicacion: "Canales de comunicación",
    herramientasPrograma: "Herramientas del programa",
    articulosInformativos: "Artículos informativos",
    leyArboladoUrbano: "Ley de arbolado urbano",
    diaNacionalArbol: "Día Nacional del Árbol",
    baseDatos: "Base de datos",
    resumenDatos: "Resumen de datos",
    fotosAceras: "Fotos de plantas en aceras",
    galeriaCuadrillas: "Cuadrillas",
    galeriaEventos: "Eventos",
    galeriaVecinos: "Vecinos",
    galeriaAceras: "Plantas en las aceras",
    calendarioSolo: "Calendario",
    telefono: "Teléfono",
    correoElectronico: "Correo electrónico",
    chatVecinos: "Chat de vecinos",
    placeholder: "Sección en construcción"
  },
  en: {
    title: "Trees of Antigua",
    login: "Log In",
    loveTrees: "La Antigua loves its trees",
    sobre: "About",
    plantas: "Plants",
    cuadrillas: "Crews",
    recursos: "Resources",
    noticias: "News",
    inventario: "Inventory",
    galeria: "Gallery",
    calendario: "Calendar",
    contacto: "Contact",
    dark: "Dark",
    light: "Light",
    pageHeadingSobre: "About Us",
    pageHeadingPlantas: "Plants",
    pageHeadingCuadrillas: "Crews",
    pageHeadingRecursos: "Resources",
    pageHeadingNoticias: "News",
    pageHeadingInventario: "Inventory",
    pageHeadingGaleria: "Gallery",
    pageHeadingCalendario: "Calendar",
    pageHeadingContacto: "Contact",
    descripcion: "Description",
    comites: "Committees",
    socios: "Partners",
    catalogo: "Catalog",
    disponiblePedirPlantas: "Available: Request Plants",
    donaciones: "Donations",
    funciones: "Functions",
    inscripcion: "Registration",
    equipo: "Team",
    canalesComunicacion: "Communication channels",
    herramientasPrograma: "Program tools",
    articulosInformativos: "Informative articles",
    leyArboladoUrbano: "Urban tree law",
    diaNacionalArbol: "National Tree Day",
    baseDatos: "Database",
    resumenDatos: "Data summary",
    fotosAceras: "Photos of sidewalk plants",
    galeriaCuadrillas: "Crews",
    galeriaEventos: "Events",
    galeriaVecinos: "Neighbors",
    galeriaAceras: "Sidewalk plants",
    calendarioSolo: "Calendar",
    telefono: "Phone",
    correoElectronico: "Email",
    chatVecinos: "Neighborhood chat",
    placeholder: "Section under construction"
  }
};

const root = document.documentElement;
const body = document.body;
const langToggle = document.getElementById("langToggle");
const themeToggle = document.getElementById("themeToggle");

function applyLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      node.textContent = translations[lang][key];
    }
  });
  root.lang = lang;
  if (langToggle) {
    langToggle.textContent = lang === "es" ? "EN" : "ES";
  }
  if (themeToggle) {
    const currentTheme = body.getAttribute("data-theme") === "dark" ? "dark" : "light";
    themeToggle.textContent = currentTheme === "dark" ? translations[lang].light : translations[lang].dark;
  }
  localStorage.setItem("siteLang", lang);
}

function applyTheme(theme) {
  const lang = root.lang === "es" ? "es" : "en";
  body.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? translations[lang].light : translations[lang].dark;
  }
  localStorage.setItem("siteTheme", theme);
}

if (langToggle) {
  langToggle.addEventListener("click", () => {
    const current = root.lang === "es" ? "es" : "en";
    applyLanguage(current === "es" ? "en" : "es");
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

const savedLang = localStorage.getItem("siteLang") || "es";
const savedTheme = localStorage.getItem("siteTheme") || "light";
applyLanguage(savedLang);
applyTheme(savedTheme);
