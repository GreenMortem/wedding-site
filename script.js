
const DRESSCODE_IMAGES = [
  "assets/dres1.jpg",
  "assets/dres2.jpg",
  "assets/dres3.jpg",
  "assets/dres4.jpg",
  "assets/dres5.jpg",
  "assets/dres6.jpg",
  "assets/dres7.jpg",
  "assets/dres8.jpg",
  "assets/dres9.jpg",
  "assets/dres10.jpg",
];

function createDresscodeSwatch(src) {
  const sw = document.createElement("div");
  sw.className = "swatch";
  sw.title = "дресс-код";

  const img = document.createElement("img");
  img.className = "swatch__image";
  img.src = src;
  img.alt = "";
  img.loading = "lazy";           // важно для производительности
  img.decoding = "async";

  sw.appendChild(img);
  return sw;
}

async function renderPalette() {
  const root = $("#palette");
  if (!root) return;
  root.innerHTML = "";

  // Пробуем загрузить отдельные картинки
  for (const src of DRESSCODE_IMAGES) {
    const sw = createDresscodeSwatch(src);
    root.appendChild(sw);
  }
}

// Настройки сайта — заполните под вашу свадьбу
const CONFIG = {
  names: "МАКСИМ & КСЕНИЯ",
  footerNames: "Максим и Ксения",
  dateText: "19.09.2026",
  rsvpDeadline: "17.08.2026",

  places: {
    registration: {
      time: "11:20",
      title: "Дворец бракосочетания",
      address: "пр. Ленина, 11, Барнаул, Алтайский край, Россия, 656049",
      mapUrl: "https://yandex.ru/maps/?text=%D0%BF%D1%80.%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B0%2C%2011%2C%20%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
    },
    banquet: {
      time: "16:30",
      title: "Ресторан «Мишель»",
      address: "г. Барнаул, проспект Ленина, 154а, к7 (ТК Геомаркет), 656037",
      mapUrl:
        "https://yandex.ru/maps/?text=%D0%BF%D1%80.%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B0%2C%20154%D0%B0%20%D0%BA7%2C%20%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
    },
  },

  timeline: [
    { time: "11:00", title: "Сбор гостей", icon: "guests", text: "Время собраться и начать праздник вместе." },
    { time: "11:20", title: "Церемония бракосочетания", icon: "rings", text: "После церемонии пройдет фотосессия, вы можете насладиться свободным временем." },
    { time: "16:30", title: "Сбор гостей", icon: "glasses", text: "Приглашаем всех в банкетный зал на праздничный стол." },
    { time: "17:00", title: "Наш особенный вечер", icon: "music", text: "Если у вас не получится присутствовать на церемонии, мы будем рады видеть вас сразу в банкетном зале." },
    { time: "22:00", title: "Завершение торжества", icon: "cake", text: "Закрытие вечера и улыбки, которые останутся с нами на всю жизнь." },
  ],

  contacts: {
    contact1: {
      label: "По всем вопросам вы можете связаться с нашим координатором",
      name: "Карина",
      phoneText: "+7 (913) 244‑48‑48",
      phoneHref: "+79132444848",
    },
  },

  dressCodePalette: [
    "#2f3a26",
    "#435436",
    "#5b6b40",
    "#7a7f48",
    "#9b8d53",
    "#d8c36a",
    "#eadfae",
    "#f3efe2",
    "#c7b7a0",
    "#7a5a3a",
  ],

  rsvp: {
    apiUrl: "/api/rsvp",
  },
};

function $(sel) {
  return document.querySelector(sel);
}

function setText(sel, text) {
  const el = $(sel);
  if (el) el.textContent = text;
}

function setLinkPhone(sel, { phoneText, phoneHref }) {
  const el = $(sel);
  if (!el) return;
  el.textContent = phoneText;
  el.href = `tel:${phoneHref}`;
}

function getTimelineIcon(type) {
  const icons = {
    guests: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="24" r="8" fill="none"/><circle cx="42" cy="24" r="8" fill="none"/><path d="M12 48c0-8 8-14 18-14s18 6 18 14" fill="none"/><path d="M30 42c0-4 4-6 8-6s8 2 8 6" fill="none"/></svg>',
    rings: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="32" r="10" fill="none"/><circle cx="36" cy="28" r="10" fill="none"/><path d="M28 32l-6-6" fill="none"/><path d="M30 28l8-8" fill="none"/></svg>',
    glasses: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 22h12v12H16zM36 22h12v12H36z" fill="none"/><path d="M28 28h8" fill="none"/><path d="M12 32l4 14h32l4-14" fill="none"/></svg>',
    music: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M24 20v24" fill="none"/><path d="M24 20l20-6v24" fill="none"/><circle cx="44" cy="42" r="8" fill="none"/><circle cx="24" cy="44" r="8" fill="none"/></svg>',
    cake: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 40h32v12H16z" fill="none"/><path d="M12 40h40v-8a6 6 0 0 0-6-6H18a6 6 0 0 0-6 6z" fill="none"/><path d="M24 22c0-4 4-6 8-6s8 2 8 6" fill="none"/><path d="M28 18v-6M36 18v-6" fill="none"/></svg>',
  };

  return icons[type] || icons.guests;
}

function renderTimeline() {
  const root = $("#timeline");
  if (!root) return;
  root.innerHTML = "";

  for (const item of CONFIG.timeline) {
    const li = document.createElement("li");
    li.className = "timeline__item";

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "timeline__icon";
    iconWrapper.innerHTML = getTimelineIcon(item.icon);
    li.appendChild(iconWrapper);

    const body = document.createElement("div");
    body.className = "timeline__body";

    const time = document.createElement("div");
    time.className = "timeline__time";
    time.textContent = item.time;
    body.appendChild(time);

    const title = document.createElement("div");
    title.className = "timeline__title";
    title.textContent = item.title;
    body.appendChild(title);

    if (item.text) {
      const text = document.createElement("div");
      text.className = "timeline__text";
      text.textContent = item.text;
      body.appendChild(text);
    }

    li.appendChild(body);
    root.appendChild(li);
  }
}

function getCountdownParts(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000) % 24;
  const days = Math.floor(ms / 86400000);
  return { days, hours, minutes, seconds };
}

function updateCountdown() {
  const daysNode = $("#countdownDays");
  const hoursNode = $("#countdownHours");
  const minutesNode = $("#countdownMinutes");
  const secondsNode = $("#countdownSeconds");
  if (!daysNode || !hoursNode || !minutesNode || !secondsNode) return;

  const target = new Date(2026, 8, 19, 11, 20, 0);
  const diff = target.getTime() - Date.now();

  if (diff <= 0) {
    daysNode.textContent = "00";
    hoursNode.textContent = "00";
    minutesNode.textContent = "00";
    secondsNode.textContent = "00";
    return;
  }

  const { days, hours, minutes, seconds } = getCountdownParts(diff);
  daysNode.textContent = String(days).padStart(2, "0");
  hoursNode.textContent = String(hours).padStart(2, "0");
  minutesNode.textContent = String(minutes).padStart(2, "0");
  secondsNode.textContent = String(seconds).padStart(2, "0");
}

function startCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function setButtonState(btn, isBusy) {
  if (!btn) return;
  btn.disabled = !!isBusy;
  btn.setAttribute("aria-busy", isBusy ? "true" : "false");
}

function setNote(text, variant) {
  const note = $("#rsvpNote");
  if (!note) return;
  note.textContent = text || "";
  note.dataset.variant = variant || "";
}

function getMultiValue(fd, name) {
  const out = [];
  for (const [k, v] of fd.entries()) {
    if (k === name) out.push(String(v));
  }
  return out;
}

function toggleConditionalFields() {
  const status = $("#rsvpForm select[name='status']")?.value || "";
  const isYes = status === "yes";

  const alcoholField = $("#alcoholField");
  const foodField = $("#foodField");
  const commentField = $("#commentField");

  if (alcoholField) alcoholField.style.display = isYes ? "" : "none";
  if (foodField) foodField.style.display = isYes ? "" : "none";
  if (commentField) commentField.style.display = isYes ? "" : "none";
}

async function submitRsvp(payload) {
  const res = await fetch(CONFIG.rsvp.apiUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const msg = body?.error || "Не удалось отправить анкету. Попробуйте ещё раз.";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return body;
}

function wireRSVP() {
  const form = $("#rsvpForm");
  const submit = $("#rsvpSubmit");
  const statusSelect = $("#rsvpForm select[name='status']");

  statusSelect?.addEventListener("change", toggleConditionalFields);
  toggleConditionalFields();

  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setNote("", "");
    setButtonState(submit, true);

    try {
      const fd = new FormData(form);
      const payload = {
        fullName: String(fd.get("fullName") || "").trim(),
        phoneOrTelegram: String(fd.get("phoneOrTelegram") || "").trim(),
        status: String(fd.get("status") || ""),
        guestsCount: 1,
        alcoholChoices: getMultiValue(fd, "alcoholChoices"),
        foodNotes: String(fd.get("foodNotes") || "").trim() || undefined,
        comment: String(fd.get("comment") || "").trim() || undefined,
      };

      if (!payload.fullName || !payload.phoneOrTelegram || !payload.status) {
        setNote("Пожалуйста, заполните обязательные поля.", "error");
        return;
      }

      if (payload.status === "no") {
        payload.alcoholChoices = [];
      }

      await submitRsvp(payload);
      form.reset();
      toggleConditionalFields();
      setNote("Спасибо! Ваш ответ сохранён.", "ok");
    } catch (err) {
      setNote(err?.message || "Не удалось отправить анкету. Попробуйте ещё раз.", "error");
    } finally {
      setButtonState(submit, false);
    }
  });
}

function init() {
  setText("#namesTitle", CONFIG.names);
  setText("#footerNames", CONFIG.footerNames);
  const dateBadge = $("#dateBadge");
  if (dateBadge) {
    dateBadge.innerHTML = `<span class="hero__date-icon" aria-hidden="true">📅</span>${CONFIG.dateText}`;
  }
  setText("#rsvpDeadline", CONFIG.rsvpDeadline);

  setText("#regTime", CONFIG.places.registration.time);
  setText("#regTitle", CONFIG.places.registration.title);
  setText("#regAddress", CONFIG.places.registration.address);
  const regMapBtn = $("#regMapBtn");
  if (regMapBtn) regMapBtn.href = CONFIG.places.registration.mapUrl || "#";

  setText("#banquetTime", CONFIG.places.banquet.time);
  setText("#banquetTitle", CONFIG.places.banquet.title);
  setText("#banquetAddress", CONFIG.places.banquet.address);
  const banquetMapBtn = $("#banquetMapBtn");
  if (banquetMapBtn) banquetMapBtn.href = CONFIG.places.banquet.mapUrl || "#";

  setText("#contactLabel", CONFIG.contacts.contact1.label);
  setText("#contactName", CONFIG.contacts.contact1.name);
  setLinkPhone("#contact1", CONFIG.contacts.contact1);

  renderPalette();
  startCountdown();
  wireRSVP();
}

init();
