"use strict";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const collator = new Intl.Collator("fr", { sensitivity: "base" });
const numberFormat = new Intl.NumberFormat("fr-FR");
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const VOWEL_LETTERS = new Set(["A", "E", "I", "O", "U", "Y"]);
const MAX_LENGTH_BIN = 15;
const MAX_MAP_WORDS = 48;

const demoWords = `
abeille abricot absence académie accord accueil achat aigle aile ajouter alphabet amande amitié analyse ancre ancien ange angle année appareil araignée arbre arôme artisan atelier attention aventure azur
balade balcon banane bateau beauté bibliothèque bijou biscuit blé bonheur bouche boussole branche bruit bureau brûler bâtir bélier brique
cabane cadeau café calme camion campagne canard canyon capable caractère cascade ceinture cercle cerveau chaise chaleur chemin cheval chocolat ciel cinéma clair cloche couleur courage cuisine curiosité cycle cygne cœur
danse date dé décision dentelle désert dessin détail devise diamant dictionnaire dimanche distance douceur dragon drôle durée détour
eau école éclat écrire église éléphant émotion énergie enfant enquête ensemble entretien épice époque étoile étincelle étude événement
fabrique facile facteur famille farine fenêtre fête feuille fièvre flamme fleur flocon forêt formule fromage frontière fruit fumée
gagner galerie garage gâteau gazelle géant génie geste girafe glace globe goûter grain grand grange guitare guide guirlande
habitude hamac harmonie hasard haut herbe hérisson histoire hiver horloge hôtel huître humain humble
ici idée image immense incendie indice industrie infini insecte instant intention intérieur intrigue invitation île ivoire
jardin jaune jet jeu joie journal journée joyau juge jument jumelle jupe juste
kayak kebab képi ketchup kilogramme kiosque kiwi koala krach
lac laine lampe langage lapin largeur légende lentille lettre liberté lumière limite livre logique lueur lune lustre
machine magie maison maladie mammifère manière marbre marché matière mémoire message métal métier miroir minute montagne mouvement musique mystère mythe
nage naissance nappe nature navire neige nerf niveau noble nocturne noix nom nombre nuage nuit nuance
oasis obéir objet occasion océan odeur œil œuvre oiseau ombre onde opéra option orange ordinateur oreille organe orage ordre orgueil outil ouvrir ouvrage
page peinture palais panier papier parfum parole partage patience patte pêche pensée personne phénomène phare pierre planète plaisir plante poisson poésie pont porte pouce prairie progrès promesse printemps plume poème
quai qualité quantité quartier quatre question quête queue qui quille quitter quotient
racine radio raisin raison recette reine reflet région règle relation rêve richesse rivière robe roche roman ronde rosée route royaume ruche rythme
sable saison salade science sculpture seconde secret silence soleil sourire son source spectacle sport statue style succès sœur symbole système
tableau talent tapis tasse température temple terrain texte théâtre temps tendresse terre tigre titre toit tomate tour travail trésor triangle tribu tunnel
ultrason uniforme union unité univers urgence usine usager usage ustensile utile
vacance vague vallée valeur vapeur variété veine vélo vent verdure vérité verre victoire village visage vitesse vitre vivant voyage vue
wagon walkman wallaby wapiti watt web week-end western wifi wok wolfram whisky
xénon xérès xérophyte xylophone xylème xylographie xiphoïde xérostomie
yaourt yacht yack yéti yeux yoga yogourt yo-yo yen yiddish
zèbre zénith zéro zest zigzag zinc zone zoo zoom zèle zodiaque zombie
`;

const elements = {
  analyzeButton: document.querySelector("#analyze-list"),
  averageLength: document.querySelector("#average-length"),
  chart: document.querySelector("#alphabet-chart"),
  clearSearchButton: document.querySelector("#clear-search"),
  circleMap: document.querySelector("#circle-map"),
  closeImportButton: document.querySelector("#close-import"),
  consonantArc: document.querySelector("#donut-consonants"),
  consonantSummary: document.querySelector("#consonant-summary"),
  donutTitle: document.querySelector("#donut-title"),
  donutTotal: document.querySelector("#donut-total"),
  emptyState: document.querySelector("#empty-state"),
  fileInput: document.querySelector("#file-input"),
  importPanel: document.querySelector("#import-panel"),
  importStatus: document.querySelector("#import-status"),
  importToggle: document.querySelector("#import-toggle"),
  lengthChart: document.querySelector("#length-chart"),
  letterFrequencyChart: document.querySelector("#letter-frequency-chart"),
  letterOccurrenceTotal: document.querySelector("#letter-occurrence-total"),
  letterCount: document.querySelector("#letter-count"),
  lexiconInput: document.querySelector("#lexicon-input"),
  mapBackButton: document.querySelector("#map-back"),
  mapBackLabel: document.querySelector("#map-back-label"),
  mapEmpty: document.querySelector("#map-empty"),
  mapHelp: document.querySelector("#map-help"),
  mapLegendLabel: document.querySelector("#map-legend-label"),
  mapStatus: document.querySelector("#map-status"),
  medianLength: document.querySelector("#median-length"),
  moreWordsButton: document.querySelector("#more-words"),
  mostCommonLetters: document.querySelector("#most-common-letters"),
  resetDemoButton: document.querySelector("#reset-demo"),
  searchInput: document.querySelector("#search-input"),
  searchStatus: document.querySelector("#search-status"),
  selectedBadge: document.querySelector("#selected-badge"),
  selectedCount: document.querySelector("#selected-count"),
  selectedLetter: document.querySelector("#selected-letter"),
  shareBar: document.querySelector("#share-bar"),
  shareLabel: document.querySelector("#share-label"),
  sortOrder: document.querySelector("#sort-order"),
  sourceLabel: document.querySelector("#source-label"),
  topCount: document.querySelector("#top-count"),
  topLetters: document.querySelector("#top-letters"),
  totalCount: document.querySelector("#total-count"),
  vowelArc: document.querySelector("#donut-vowels"),
  vowelSummary: document.querySelector("#vowel-summary"),
  wordList: document.querySelector("#word-list"),
  wordListCaption: document.querySelector("#word-list-caption"),
};

let words = [];
let selectedLetter = "A";
let sourceName = "Jeu de démonstration";
let showAllWords = false;
let mapPrefix = "";
let mapShowWords = false;

function foldForSearch(value) {
  return value
    .toLocaleLowerCase("fr-FR")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getInitial(word) {
  const firstLetter = word
    .trim()
    .charAt(0)
    .toLocaleLowerCase("fr-FR")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .charAt(0)
    .toLocaleUpperCase("fr-FR");

  return LETTERS.includes(firstLetter) ? firstLetter : null;
}

function getLetterAt(word, index) {
  const character = (word.normalize("NFC").match(/\p{L}/gu) ?? [])[index];
  if (!character) {
    return null;
  }

  const letter = character
    .toLocaleLowerCase("fr-FR")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .charAt(0)
    .toLocaleUpperCase("fr-FR");

  return LETTERS.includes(letter) ? letter : null;
}

function wordsForPrefix(prefix) {
  return words.filter((word) => {
    for (let index = 0; index < prefix.length; index += 1) {
      if (getLetterAt(word, index) !== prefix[index]) {
        return false;
      }
    }

    return true;
  });
}

function parseWords(text) {
  const tokens = text.match(/\p{L}+(?:[-'’]\p{L}+)*/gu) ?? [];
  const uniqueWords = new Map();

  for (const token of tokens) {
    if (!getInitial(token)) {
      continue;
    }

    const normalized = token.normalize("NFC");
    const key = normalized.toLocaleLowerCase("fr-FR");

    if (!uniqueWords.has(key)) {
      uniqueWords.set(key, normalized);
    }
  }

  return [...uniqueWords.values()].sort(collator.compare);
}

function countByLetter() {
  const counts = new Map(LETTERS.map((letter) => [letter, 0]));

  for (const word of words) {
    const initial = getInitial(word);
    if (initial) {
      counts.set(initial, counts.get(initial) + 1);
    }
  }

  return counts;
}

function countLetterOccurrences() {
  const counts = new Map(LETTERS.map((letter) => [letter, 0]));

  for (const word of words) {
    for (const character of foldForSearch(word)) {
      const letter = character.toLocaleUpperCase("fr-FR");
      if (counts.has(letter)) {
        counts.set(letter, counts.get(letter) + 1);
      }
    }
  }

  return counts;
}

function getWordLength(word) {
  return (word.match(/\p{L}/gu) ?? []).length;
}

function formatPercent(part, total) {
  const percentage = total ? (part / total) * 100 : 0;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(percentage)} %`;
}

function renderLengthChart() {
  const buckets = Array.from({ length: MAX_LENGTH_BIN }, (_, index) => ({
    count: 0,
    label: index === MAX_LENGTH_BIN - 1 ? `${MAX_LENGTH_BIN}+` : String(index + 1),
  }));
  const lengths = [];

  for (const word of words) {
    const length = getWordLength(word);
    if (!length) {
      continue;
    }

    buckets[Math.min(length, MAX_LENGTH_BIN) - 1].count += 1;
    lengths.push(length);
  }

  const maximum = Math.max(1, ...buckets.map((bucket) => bucket.count));
  elements.lengthChart.replaceChildren();

  for (const bucket of buckets) {
    const column = document.createElement("div");
    const count = document.createElement("span");
    const track = document.createElement("span");
    const fill = document.createElement("span");
    const label = document.createElement("span");

    column.className = "length-column";
    column.title = `${bucket.label} lettre${bucket.label === "1" ? "" : "s"} : ${numberFormat.format(bucket.count)} mot${bucket.count === 1 ? "" : "s"}`;
    count.className = "length-count";
    count.textContent = bucket.count ? numberFormat.format(bucket.count) : "";
    track.className = "length-track";
    fill.className = "length-fill";
    fill.style.height = `${bucket.count ? Math.max(3, (bucket.count / maximum) * 100) : 0}%`;
    label.className = "length-label";
    label.textContent = bucket.label;

    if (!bucket.count) {
      column.classList.add("is-empty");
    }

    track.append(fill);
    column.append(count, track, label);
    elements.lengthChart.append(column);
  }

  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  const average = lengths.length ? totalLength / lengths.length : 0;
  const orderedLengths = [...lengths].sort((first, second) => first - second);
  const middle = Math.floor(orderedLengths.length / 2);
  const median = orderedLengths.length
    ? orderedLengths.length % 2
      ? orderedLengths[middle]
      : (orderedLengths[middle - 1] + orderedLengths[middle]) / 2
    : 0;
  const lengthFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

  elements.averageLength.textContent = lengthFormat.format(average);
  elements.medianLength.textContent = `Médiane : ${lengthFormat.format(median)} lettre${median > 1 ? "s" : ""}`;
  elements.lengthChart.setAttribute(
    "aria-label",
    `Répartition des ${numberFormat.format(lengths.length)} mots par longueur, de 1 à ${MAX_LENGTH_BIN} lettres ou plus.`,
  );
}

function renderOnsetChart(counts) {
  const vowelCount = LETTERS.reduce(
    (total, letter) => total + (VOWEL_LETTERS.has(letter) ? counts.get(letter) : 0),
    0,
  );
  const consonantCount = words.length - vowelCount;
  const circumference = 2 * Math.PI * 70;
  const vowelLength = words.length ? (vowelCount / words.length) * circumference : 0;
  const consonantLength = words.length ? (consonantCount / words.length) * circumference : 0;

  elements.vowelArc.setAttribute("stroke-dasharray", `${vowelLength} ${circumference - vowelLength}`);
  elements.vowelArc.setAttribute("stroke-dashoffset", "0");
  elements.consonantArc.setAttribute("stroke-dasharray", `${consonantLength} ${circumference - consonantLength}`);
  elements.consonantArc.setAttribute("stroke-dashoffset", `${-vowelLength}`);
  elements.donutTotal.textContent = numberFormat.format(words.length);
  elements.donutTitle.textContent =
    `${numberFormat.format(vowelCount)} mots commencent par une voyelle et ${numberFormat.format(consonantCount)} par une consonne.`;
  elements.vowelSummary.textContent = `${numberFormat.format(vowelCount)} · ${formatPercent(vowelCount, words.length)}`;
  elements.consonantSummary.textContent = `${numberFormat.format(consonantCount)} · ${formatPercent(consonantCount, words.length)}`;
}

function renderLetterFrequencyChart() {
  const counts = countLetterOccurrences();
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const maximum = Math.max(...counts.values());
  const mostCommon = LETTERS.filter((letter) => counts.get(letter) === maximum && maximum > 0);

  elements.letterFrequencyChart.replaceChildren();
  elements.letterOccurrenceTotal.textContent = numberFormat.format(total);
  elements.mostCommonLetters.textContent = mostCommon.length
    ? `${mostCommon.length > 1 ? "Plus fréquentes" : "Plus fréquente"} : ${mostCommon.join(" · ")} · ` +
      `${numberFormat.format(maximum)} occurrence${maximum === 1 ? "" : "s"}${mostCommon.length > 1 ? " chacune" : ""}`
    : "Aucune occurrence";

  for (const letter of LETTERS) {
    const count = counts.get(letter);
    const column = document.createElement("div");
    const number = document.createElement("span");
    const track = document.createElement("span");
    const fill = document.createElement("span");
    const label = document.createElement("span");

    column.className = "frequency-column";
    column.title = `${letter} : ${numberFormat.format(count)} occurrence${count === 1 ? "" : "s"}`;
    column.setAttribute("role", "img");
    column.setAttribute("aria-label", `${letter} : ${numberFormat.format(count)} occurrence${count === 1 ? "" : "s"}`);
    number.className = "frequency-count";
    number.textContent = count ? numberFormat.format(count) : "";
    track.className = "frequency-track";
    fill.className = "frequency-fill";
    fill.style.height = `${maximum ? Math.max(3, (count / maximum) * 100) : 0}%`;
    label.className = "frequency-label";
    label.textContent = letter;

    if (maximum > 0 && count === maximum) {
      column.classList.add("is-most-common");
    }
    if (!count) {
      column.classList.add("is-empty");
    }

    track.append(fill);
    column.append(number, track, label);
    elements.letterFrequencyChart.append(column);
  }

  elements.letterFrequencyChart.setAttribute(
    "aria-label",
    `Fréquence des lettres A à Z, ${numberFormat.format(total)} occurrences au total. ` +
      `Lettres les plus fréquentes : ${mostCommon.join(", ")}.`,
  );
}

function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NAMESPACE, name);
  for (const [attribute, value] of Object.entries(attributes)) {
    element.setAttribute(attribute, String(value));
  }
  return element;
}

function addSvgText(parent, textContent, attributes = {}) {
  const text = createSvgElement("text", attributes);
  text.textContent = textContent;
  parent.append(text);
  return text;
}

function addKeyboardActivation(element, action) {
  element.addEventListener("click", action);
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  });
}

function packCircles(items, options) {
  const {
    boundaryRadius = null,
    centerX,
    centerY,
    collisionGap = 4,
    height,
    padding = 28,
    spiralStep = 4.2,
    width,
  } = options;
  const sortedItems = [...items].sort(
    (first, second) => second.baseRadius - first.baseRadius || collator.compare(first.label, second.label),
  );
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let scaleStep = 0; scaleStep <= 10; scaleStep += 1) {
    const scale = 1 - scaleStep * 0.05;
    const placed = [];
    let allPlaced = true;

    for (const item of sortedItems) {
      const radius = item.baseRadius * scale;
      let position = null;

      for (let attempt = 0; attempt < 5000; attempt += 1) {
        const angle = attempt * goldenAngle;
        const distance = attempt === 0 ? 0 : spiralStep * Math.sqrt(attempt);
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        if (boundaryRadius !== null) {
          if (Math.hypot(x - centerX, y - centerY) + radius > boundaryRadius - padding) {
            continue;
          }
        } else if (
          x - radius < padding ||
          x + radius > width - padding ||
          y - radius < padding ||
          y + radius > height - padding
        ) {
          continue;
        }

        const overlaps = placed.some(
          (circle) => Math.hypot(x - circle.x, y - circle.y) < radius + circle.radius + collisionGap,
        );
        if (!overlaps) {
          position = { x, y };
          break;
        }
      }

      if (!position) {
        allPlaced = false;
        break;
      }

      placed.push({ ...item, ...position, radius });
    }

    if (allPlaced) {
      return placed;
    }
  }

  return null;
}

function getLetterHue(letter) {
  return (150 + LETTERS.indexOf(letter) * 47) % 360;
}

function setMapAccessibleDescription(title, description) {
  const svgTitle = createSvgElement("title");
  const svgDescription = createSvgElement("desc");
  svgTitle.textContent = title;
  svgDescription.textContent = description;
  elements.circleMap.setAttribute("aria-label", `${title} ${description}`);
  elements.circleMap.append(svgTitle, svgDescription);
}

function updateMapBackButton() {
  elements.mapBackButton.hidden = !mapPrefix;
  elements.mapBackLabel.textContent = mapShowWords
    ? "Retour à la répartition"
    : mapPrefix.length > 1
      ? "Niveau précédent"
      : "Toutes les lettres";
}

function fitCircleLabels(label, count, x, y, radius) {
  const isLongLabel = label.textContent.length > 1;
  const fontSize = Math.max(4, Math.min(isLongLabel ? 16 : 24, radius * (isLongLabel ? 0.46 : 0.72)));
  const showCount = radius >= 14;

  label.setAttribute("font-size", String(fontSize));
  label.setAttribute("y", showCount ? y - Math.min(3, radius * 0.18) : y + radius * 0.18);
  count.setAttribute("font-size", String(Math.max(4, Math.min(9, radius * 0.22))));
  count.setAttribute("y", y + radius * 0.42);
  count.style.display = showCount ? "" : "none";
}

function setMapUnavailable(message) {
  elements.circleMap.hidden = true;
  elements.mapEmpty.hidden = false;
  elements.mapEmpty.textContent = message;
  elements.mapStatus.textContent = message;
  updateMapBackButton();
}

function renderLetterMap(counts) {
  const activeLetters = LETTERS.filter((letter) => counts.get(letter) > 0);
  const baseRadius = Math.sqrt((1000 * 500 * 0.42) / (Math.PI * Math.max(words.length, 1)));
  const circles = packCircles(
    activeLetters.map((letter) => ({
      baseRadius: Math.max(20, baseRadius * Math.sqrt(counts.get(letter))),
      count: counts.get(letter),
      label: letter,
      letter,
    })),
    { centerX: 500, centerY: 250, height: 500, padding: 30, width: 1000 },
  );

  if (!circles) {
    return false;
  }

  for (const item of circles) {
    const hue = getLetterHue(item.letter);
    const wordCount = `${numberFormat.format(item.count)} mot${item.count === 1 ? "" : "s"}`;
    const node = createSvgElement("g", { class: "map-node map-letter-node" });
    const circle = createSvgElement("circle", {
      cx: item.x,
      cy: item.y,
      r: item.radius,
      fill: `hsl(${hue} 57% 82%)`,
      stroke: `hsl(${hue} 42% 58%)`,
      "stroke-width": 1.5,
    });
    const initial = addSvgText(node, item.letter, {
      x: item.x,
      y: item.y - 3,
      class: "map-letter-initial",
      "text-anchor": "middle",
    });
    const count = addSvgText(node, numberFormat.format(item.count), {
      x: item.x,
      y: item.y + item.radius * 0.34,
      class: "map-letter-count",
      "text-anchor": "middle",
    });
    const title = createSvgElement("title");
    title.textContent = `${item.letter} : ${wordCount} · cliquez pour zoomer`;
    node.prepend(circle);
    node.append(title);
    node.setAttribute(
      "aria-label",
      `${item.letter} : ${wordCount}. Cliquez ou appuyez sur Entrée pour zoomer.`,
    );
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    fitCircleLabels(initial, count, item.x, item.y, item.radius);

    addKeyboardActivation(node, () => {
      mapPrefix = item.letter;
      mapShowWords = false;
      selectedLetter = item.letter;
      showAllWords = false;
      render();
    });
    elements.circleMap.append(node);
  }

  elements.mapStatus.textContent = `${activeLetters.length} lettres · cercle dimensionné selon le nombre de mots.`;
  elements.mapLegendLabel.textContent = "Un cercle par lettre · surface proportionnelle au nombre de mots.";
  elements.mapHelp.textContent = "Cliquez sur une lettre pour zoomer.";
  updateMapBackButton();
  return true;
}

function renderZoomBackdrop(prefix, title) {
  const hue = getLetterHue(prefix.charAt(0));
  const backdrop = createSvgElement("circle", {
    cx: 500,
    cy: 260,
    r: 215,
    class: "map-zoom-backdrop",
    fill: `hsl(${hue} 42% 95%)`,
    stroke: `hsl(${hue} 40% 76%)`,
    "stroke-width": 1.5,
  });
  elements.circleMap.append(backdrop);
  addSvgText(elements.circleMap, title, {
    x: 500,
    y: 28,
    class: "map-zoom-title",
    "text-anchor": "middle",
  });
}

function renderNextLetterMap() {
  const prefixWords = wordsForPrefix(mapPrefix);
  const countsByNextLetter = new Map();

  for (const word of prefixWords) {
    const nextLetter = getLetterAt(word, mapPrefix.length) ?? "FIN";
    countsByNextLetter.set(nextLetter, (countsByNextLetter.get(nextLetter) ?? 0) + 1);
  }

  const groups = [...countsByNextLetter.entries()]
    .map(([nextLetter, count]) => ({
      count,
      label: nextLetter,
      nextLetter: nextLetter === "FIN" ? null : nextLetter,
    }))
    .sort((first, second) => second.count - first.count || collator.compare(first.label, second.label));
  const innerRadius = 206;
  const baseRadius = innerRadius * Math.sqrt(0.48 / Math.max(prefixWords.length, 1));
  const circles = packCircles(
    groups.map((group) => ({
      ...group,
      baseRadius: Math.max(20, baseRadius * Math.sqrt(group.count)),
    })),
    {
      boundaryRadius: 215,
      centerX: 500,
      centerY: 260,
      collisionGap: 4,
      height: 500,
      padding: 9,
      spiralStep: 4.1,
      width: 1000,
    },
  );

  if (!circles) {
    return false;
  }

  const nextOrdinal = `${mapPrefix.length + 1}E LETTRE`;
  renderZoomBackdrop(mapPrefix, `${nextOrdinal} · ${mapPrefix}`);

  for (const item of circles) {
    const isTerminal = item.nextLetter === null;
    const hue = getLetterHue(item.nextLetter ?? mapPrefix.charAt(mapPrefix.length - 1));
    const node = createSvgElement("g", { class: "map-node map-next-letter-node" });
    const circle = createSvgElement("circle", {
      cx: item.x,
      cy: item.y,
      r: item.radius,
      fill: `hsl(${hue} 57% 82%)`,
      stroke: `hsl(${hue} 42% 58%)`,
      "stroke-width": 1.5,
    });
    const label = addSvgText(node, item.label, {
      x: item.x,
      y: item.y - 3,
      class: "map-letter-initial",
      "text-anchor": "middle",
    });
    const count = addSvgText(node, numberFormat.format(item.count), {
      x: item.x,
      y: item.y + item.radius * 0.34,
      class: "map-letter-count",
      "text-anchor": "middle",
    });
    const wordCountLabel = `${numberFormat.format(item.count)} mot${item.count === 1 ? "" : "s"}`;
    const title = createSvgElement("title");
    title.textContent = isTerminal
      ? `${wordCountLabel} termine${item.count === 1 ? "" : "nt"} le préfixe ${mapPrefix}`
      : `${mapPrefix}${item.nextLetter} : ${wordCountLabel} · cliquez pour continuer`;
    node.prepend(circle);
    node.append(title);
    node.setAttribute(
      "aria-label",
      isTerminal
        ? `${wordCountLabel} ${item.count === 1 ? "correspond" : "correspondent"} exactement au préfixe ${mapPrefix}. Cliquez pour voir ces mots.`
        : `${nextOrdinal.toLocaleLowerCase("fr-FR")} ${item.nextLetter} après ${mapPrefix} : ${wordCountLabel}. Cliquez pour explorer.`,
    );
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    fitCircleLabels(label, count, item.x, item.y, item.radius);

    addKeyboardActivation(node, () => {
      if (isTerminal) {
        mapShowWords = true;
      } else {
        mapPrefix += item.nextLetter;
        mapShowWords = false;
      }
      render();
    });
    elements.circleMap.append(node);
  }

  const wordCountLabel = `${numberFormat.format(prefixWords.length)} mot${prefixWords.length === 1 ? "" : "s"}`;
  const groupCountLabel = `${numberFormat.format(groups.length)} groupe${groups.length === 1 ? "" : "s"}`;
  elements.mapStatus.textContent =
    `${mapPrefix} → ${mapPrefix.length + 1}e lettre · ${wordCountLabel} réparti${prefixWords.length === 1 ? "" : "s"} en ${groupCountLabel}`;
  elements.mapLegendLabel.textContent = "Un cercle par lettre suivante · surface proportionnelle au nombre de mots.";
  const hasNextLetter = groups.some((group) => group.nextLetter);
  elements.mapHelp.textContent = countsByNextLetter.has("FIN")
    ? hasNextLetter
      ? "Cliquez sur une lettre pour continuer ou sur FIN pour voir les mots terminés."
      : "Cliquez sur FIN pour voir les mots terminés."
    : "Cliquez sur un cercle pour explorer le niveau de lettre suivant.";
  updateMapBackButton();
  return true;
}

function sampleWordsForMap(prefixWords) {
  if (prefixWords.length <= MAX_MAP_WORDS) {
    return prefixWords;
  }

  return Array.from({ length: MAX_MAP_WORDS }, (_, index) => {
    const sampleIndex = Math.round((index * (prefixWords.length - 1)) / (MAX_MAP_WORDS - 1));
    return prefixWords[sampleIndex];
  });
}

function renderWordLeaves() {
  const prefixWords = wordsForPrefix(mapPrefix).filter((word) => getLetterAt(word, mapPrefix.length) === null);
  const sample = sampleWordsForMap(prefixWords);
  const circles = packCircles(
    sample.map((word) => ({
      baseRadius: sample.length <= 4 ? 36 : 11 + Math.min(getWordLength(word), 20) * 1.15,
      label: word,
      word,
    })),
    {
      boundaryRadius: 215,
      centerX: 500,
      centerY: 260,
      collisionGap: 3,
      height: 500,
      padding: 9,
      spiralStep: 3.7,
      width: 1000,
    },
  );

  if (!circles) {
    return false;
  }

  renderZoomBackdrop(mapPrefix, `MOTS · ${mapPrefix}`);
  const hue = getLetterHue(mapPrefix.charAt(0));

  for (const item of circles) {
    const node = createSvgElement("g", { class: "map-node map-word-node" });
    const circle = createSvgElement("circle", {
      cx: item.x,
      cy: item.y,
      r: item.radius,
      fill: `hsl(${hue} 48% 89%)`,
      stroke: `hsl(${hue} 36% 61%)`,
      "stroke-width": 1,
    });
    const label = addSvgText(node, item.word, {
      x: item.x,
      y: item.y,
      class: "map-word-label",
      "text-anchor": "middle",
      "dominant-baseline": "middle",
    });
    const availableWidth = Math.max(9, item.radius * 1.7);
    const fontSize = Math.max(4, Math.min(11, availableWidth / (item.word.length * 0.58)));
    label.setAttribute("font-size", String(fontSize));
    if (item.word.length * fontSize * 0.58 > availableWidth) {
      label.setAttribute("textLength", String(availableWidth));
      label.setAttribute("lengthAdjust", "spacingAndGlyphs");
    }

    const title = createSvgElement("title");
    title.textContent = `${item.word} · cliquez pour rechercher`;
    node.prepend(circle);
    node.append(title);
    node.setAttribute("aria-label", `${item.word}. Cliquez pour rechercher ce mot.`);
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    addKeyboardActivation(node, () => {
      elements.searchInput.value = item.word;
      elements.searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
    elements.circleMap.append(node);
  }

  const totalWords = `${numberFormat.format(prefixWords.length)} mot${prefixWords.length === 1 ? "" : "s"}`;
  const shownWords = `${numberFormat.format(sample.length)} cercle${sample.length === 1 ? "" : "s"}`;
  elements.mapStatus.textContent = sample.length < prefixWords.length
    ? `${mapPrefix} · ${totalWords} · ${shownWords} affichés`
    : `${mapPrefix} · ${totalWords} termine${prefixWords.length === 1 ? "" : "nt"} le préfixe`;
  elements.mapLegendLabel.textContent = "Un cercle par mot · cliquez pour le retrouver dans le lexique.";
  elements.mapHelp.textContent = "Cliquez sur un mot pour lancer sa recherche.";
  updateMapBackButton();
  return true;
}

function renderCircleMap(counts) {
  elements.circleMap.replaceChildren();
  elements.circleMap.hidden = false;
  elements.mapEmpty.hidden = true;
  updateMapBackButton();
  setMapAccessibleDescription(
    mapShowWords
      ? `Mots qui terminent le préfixe ${mapPrefix}.`
      : mapPrefix
        ? `Carte du préfixe ${mapPrefix}.`
        : "Carte circulaire du lexique par lettre.",
    mapShowWords
      ? "Chaque cercle représente un mot et peut être activé pour lancer sa recherche."
      : mapPrefix
        ? `Chaque cercle correspond à la lettre suivante après ${mapPrefix}. Cliquez pour explorer un niveau supplémentaire.`
        : "La surface de chaque cercle est proportionnelle au nombre de mots qui commencent par cette lettre.",
  );

  const rendered = !mapPrefix
    ? renderLetterMap(counts)
    : mapShowWords
      ? renderWordLeaves()
      : renderNextLetterMap();
  if (!rendered) {
    setMapUnavailable("La carte est trop dense pour être disposée. Essayez un lexique plus petit.");
  }
}

function renderStats(counts) {
  const total = words.length;
  const presentLetters = LETTERS.filter((letter) => counts.get(letter) > 0);
  const maximum = Math.max(...counts.values());
  const topLetters = LETTERS.filter((letter) => counts.get(letter) === maximum);

  elements.totalCount.textContent = numberFormat.format(total);
  elements.letterCount.textContent = String(presentLetters.length);
  elements.topLetters.textContent = topLetters.length ? topLetters.join(" · ") : "—";
  elements.topCount.textContent = maximum
    ? `${numberFormat.format(maximum)} mot${maximum > 1 ? "s" : ""} ${topLetters.length > 1 ? "chacune" : ""}`.trim()
    : "Aucune entrée";
  elements.sourceLabel.textContent = `${sourceName} · ${numberFormat.format(total)} mots`;
}

function getSearchMatches(query) {
  if (!query) {
    return [];
  }

  const foldedQuery = foldForSearch(query);
  return words.filter((word) => foldForSearch(word).includes(foldedQuery));
}

function renderSearchStatus(query, matches) {
  elements.clearSearchButton.hidden = !query;

  if (!query) {
    elements.searchStatus.textContent = "";
    return;
  }

  if (matches.length === 0) {
    elements.searchStatus.textContent = `Aucun mot trouvé pour « ${query} ».`;
    return;
  }

  const matchingLetters = [...new Set(matches.map(getInitial))].sort();
  elements.searchStatus.textContent =
    `${numberFormat.format(matches.length)} résultat${matches.length > 1 ? "s" : ""} · lettre${matchingLetters.length > 1 ? "s" : ""} ` +
    matchingLetters.join(", ");
}

function renderChart(counts, searchMatches) {
  const maxCount = Math.max(...counts.values());
  const matchingLetters = new Set(searchMatches.map(getInitial));
  const sortedLetters = [...LETTERS];

  if (elements.sortOrder.value === "frequency") {
    sortedLetters.sort((first, second) => {
      const difference = counts.get(second) - counts.get(first);
      return difference || first.localeCompare(second, "fr");
    });
  }

  elements.chart.replaceChildren();

  for (const letter of sortedLetters) {
    const count = counts.get(letter);
    const button = document.createElement("button");
    const number = document.createElement("span");
    const track = document.createElement("span");
    const fill = document.createElement("span");
    const label = document.createElement("span");
    const height = maxCount ? Math.max(4, (count / maxCount) * 100) : 0;

    button.type = "button";
    button.className = "letter-bar";
    button.setAttribute("aria-label", `${letter} : ${numberFormat.format(count)} mot${count === 1 ? "" : "s"}`);
    button.setAttribute("aria-pressed", String(letter === selectedLetter));
    button.title = `${letter} : ${numberFormat.format(count)} mot${count === 1 ? "" : "s"}`;

    if (letter === selectedLetter) {
      button.classList.add("is-selected");
    }
    if (matchingLetters.has(letter)) {
      button.classList.add("has-match");
    }
    if (count === 0) {
      button.classList.add("is-empty");
    }

    number.className = "bar-count";
    number.textContent = count ? numberFormat.format(count) : "";
    track.className = "bar-track";
    fill.className = "bar-fill";
    fill.style.height = `${height}%`;
    label.className = "bar-letter";
    label.textContent = letter;

    track.append(fill);
    button.append(number, track, label);
    button.addEventListener("click", () => {
      selectedLetter = letter;
      showAllWords = false;
      mapPrefix = "";
      mapShowWords = false;
      render();
    });
    elements.chart.append(button);
  }
}

function renderSelection(counts, query) {
  const selectedWords = words.filter((word) => getInitial(word) === selectedLetter);
  const visibleWords = query
    ? selectedWords.filter((word) => foldForSearch(word).includes(foldForSearch(query)))
    : selectedWords;
  const displayedWords = showAllWords ? visibleWords : visibleWords.slice(0, 12);
  const total = words.length;
  const count = counts.get(selectedLetter);
  const share = total ? (count / total) * 100 : 0;

  elements.selectedBadge.textContent = selectedLetter;
  elements.selectedLetter.textContent = selectedLetter;
  elements.selectedCount.textContent = numberFormat.format(count);
  elements.shareBar.style.width = `${share}%`;
  elements.shareLabel.textContent = `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(share)} % du lexique`;
  elements.wordListCaption.textContent = query
    ? `${numberFormat.format(visibleWords.length)} résultat${visibleWords.length > 1 ? "s" : ""}`
    : `${numberFormat.format(count)} entrée${count > 1 ? "s" : ""}`;

  elements.wordList.replaceChildren();
  for (const word of displayedWords) {
    const item = document.createElement("li");
    item.textContent = word;
    elements.wordList.append(item);
  }

  const hasNoWords = visibleWords.length === 0;
  elements.emptyState.hidden = !hasNoWords;
  elements.emptyState.textContent = query
    ? `Aucun résultat pour « ${query} » dans la lettre ${selectedLetter}.`
    : `Aucune entrée pour la lettre ${selectedLetter} dans ce lexique.`;
  elements.wordList.hidden = displayedWords.length === 0;
  elements.moreWordsButton.hidden = visibleWords.length <= 12;
  elements.moreWordsButton.textContent = showAllWords ? "Réduire la liste" : `Afficher les ${numberFormat.format(visibleWords.length)} mots`;
}

function render() {
  const counts = countByLetter();
  const query = elements.searchInput.value.trim();
  const matches = getSearchMatches(query);

  renderStats(counts);
  renderSearchStatus(query, matches);
  renderChart(counts, matches);
  renderSelection(counts, query);
  renderLengthChart();
  renderOnsetChart(counts);
  renderLetterFrequencyChart();
  renderCircleMap(counts);
}

function setImportStatus(message, isError = false) {
  elements.importStatus.textContent = message;
  elements.importStatus.classList.toggle("is-error", isError);
}

function loadLexicon(text, name) {
  const parsedWords = parseWords(text);

  if (parsedWords.length === 0) {
    setImportStatus("Aucun mot en français n'a été trouvé. Vérifiez le contenu de la liste.", true);
    return false;
  }

  words = parsedWords;
  sourceName = name;
  selectedLetter = getInitial(words[0]) ?? "A";
  showAllWords = false;
  mapPrefix = "";
  mapShowWords = false;
  elements.searchInput.value = "";
  setImportStatus(`${numberFormat.format(words.length)} mots uniques analysés. Les statistiques sont à jour.`);
  render();
  return true;
}

function setImportPanelOpen(isOpen) {
  elements.importPanel.hidden = !isOpen;
  elements.importToggle.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    elements.lexiconInput.focus();
  }
}

elements.importToggle.addEventListener("click", () => {
  setImportPanelOpen(elements.importPanel.hidden);
});

elements.closeImportButton.addEventListener("click", () => {
  setImportPanelOpen(false);
});

elements.analyzeButton.addEventListener("click", () => {
  loadLexicon(elements.lexiconInput.value, "Liste importée");
});

elements.fileInput.addEventListener("change", async () => {
  const [file] = elements.fileInput.files ?? [];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    elements.lexiconInput.value = text;
    loadLexicon(text, file.name);
  } catch (error) {
    console.error("Impossible de lire le fichier du lexique.", error);
    setImportStatus("Impossible de lire ce fichier. Essayez un fichier .txt ou .csv.", true);
  }
});

elements.resetDemoButton.addEventListener("click", () => {
  words = parseWords(demoWords);
  sourceName = "Jeu de démonstration";
  selectedLetter = "A";
  showAllWords = false;
  mapPrefix = "";
  mapShowWords = false;
  elements.searchInput.value = "";
  elements.lexiconInput.value = "";
  elements.fileInput.value = "";
  setImportStatus("L'exemple de démonstration est de nouveau affiché.");
  render();
});

elements.searchInput.addEventListener("input", () => {
  const query = elements.searchInput.value.trim();
  const matches = getSearchMatches(query);
  if (query && matches.length > 0) {
    selectedLetter = getInitial(matches[0]) ?? selectedLetter;
    if (mapPrefix) {
      mapPrefix = selectedLetter;
      mapShowWords = false;
    }
    showAllWords = false;
  }
  render();
});

elements.clearSearchButton.addEventListener("click", () => {
  elements.searchInput.value = "";
  elements.searchInput.focus();
  showAllWords = false;
  render();
});

elements.sortOrder.addEventListener("change", render);

elements.moreWordsButton.addEventListener("click", () => {
  showAllWords = !showAllWords;
  render();
});

elements.mapBackButton.addEventListener("click", () => {
  if (mapShowWords) {
    mapShowWords = false;
  } else {
    mapPrefix = mapPrefix.slice(0, -1);
  }
  render();
});

words = parseWords(demoWords);
render();
