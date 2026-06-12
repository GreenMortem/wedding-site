function $(sel) {
  return document.querySelector(sel);
}

function setNote(sel, text, variant) {
  const el = $(sel);
  if (!el) return;
  el.textContent = text || "";
  el.dataset.variant = variant || "";
}

function getCode() {
  return sessionStorage.getItem("adminCode") || "";
}

function setCode(code) {
  sessionStorage.setItem("adminCode", code);
}

function clearCode() {
  sessionStorage.removeItem("adminCode");
}

async function apiFetch(path, options) {
  const code = getCode();
  const headers = new Headers(options?.headers || {});
  if (code) headers.set("x-admin-code", code);

  const res = await fetch(path, { ...options, headers });

  if (res.status === 204) return null;

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const msg = body?.error || (typeof body === "string" && body) || "Ошибка запроса.";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return body;
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso || "";
  }
}

function statusLabel(status) {
  return status === "yes" ? "придут" : "не придут";
}

function alcoholLabel(code) {
  const map = {
    wine_red: "красное",
    wine_white: "белое",
    champagne: "игристое",
    vodka: "водка",
    whiskey: "виски",
    cognac: "коньяк",
    beer: "пиво",
    non_alcohol: "без алкоголя",
  };
  return map[code] || code;
}

function filterRows(rows, query, status) {
  const q = (query || "").trim().toLowerCase();
  return rows.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (!q) return true;
    const hay = [
      r.fullName,
      r.phoneOrTelegram,
      r.plusOneName,
      r.foodNotes,
      r.comment,
      (r.alcoholChoices || []).join(","),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

function renderTable(rows) {
  const tbody = $("#rows");
  if (!tbody) return;
  tbody.innerHTML = "";

  for (const r of rows) {
    const tr = document.createElement("tr");

    const tdDate = document.createElement("td");
    tdDate.textContent = formatDate(r.createdAt);

    const tdName = document.createElement("td");
    tdName.textContent = r.fullName || "";

    const tdContact = document.createElement("td");
    tdContact.textContent = r.phoneOrTelegram || "";

    const tdStatus = document.createElement("td");
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.dataset.variant = r.status;
    pill.textContent = statusLabel(r.status);
    tdStatus.appendChild(pill);

    const tdGuests = document.createElement("td");
    tdGuests.textContent = String(r.guestsCount || 1);

    const tdPlus = document.createElement("td");
    tdPlus.textContent = r.plusOneName || "";

    const tdAlcohol = document.createElement("td");
    tdAlcohol.textContent = (r.alcoholChoices || []).map(alcoholLabel).join(", ");

    const tdFood = document.createElement("td");
    tdFood.textContent = r.foodNotes || "";

    const tdComment = document.createElement("td");
    tdComment.textContent = r.comment || "";

    const tdActions = document.createElement("td");
    const del = document.createElement("button");
    del.type = "button";
    del.className = "icon-btn";
    del.textContent = "удалить";
    del.addEventListener("click", () => onDelete(r.id));
    tdActions.appendChild(del);

    tr.appendChild(tdDate);
    tr.appendChild(tdName);
    tr.appendChild(tdContact);
    tr.appendChild(tdStatus);
    tr.appendChild(tdGuests);
    tr.appendChild(tdPlus);
    tr.appendChild(tdAlcohol);
    tr.appendChild(tdFood);
    tr.appendChild(tdComment);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  }
}

let allRows = [];

async function loadRows() {
  setNote("#panelNote", "Загрузка…", "");
  try {
    const body = await apiFetch("/api/admin/rsvps", { method: "GET" });
    allRows = Array.isArray(body?.items) ? body.items : [];
    applyFilters();
    setNote("#panelNote", `Ответов: ${allRows.length}`, "ok");
  } catch (err) {
    setNote("#panelNote", err?.message || "Не удалось загрузить ответы.", "error");
    if (err?.status === 401 || err?.status === 403) {
      clearCode();
      showLogin();
    }
  }
}

function applyFilters() {
  const q = $("#searchInput")?.value || "";
  const s = $("#statusFilter")?.value || "all";
  renderTable(filterRows(allRows, q, s));
}

async function onDelete(id) {
  if (!id) return;
  const ok = window.confirm("Удалить запись?");
  if (!ok) return;

  try {
    await apiFetch(`/api/admin/rsvps/${encodeURIComponent(id)}`, { method: "DELETE" });
    allRows = allRows.filter((r) => r.id !== id);
    applyFilters();
    setNote("#panelNote", "Запись удалена.", "ok");
  } catch (err) {
    setNote("#panelNote", err?.message || "Не удалось удалить.", "error");
  }
}

async function downloadCsv() {
  setNote("#panelNote", "Готовлю CSV…", "");
  try {
    const code = getCode();
    const res = await fetch("/api/admin/rsvps.csv", { headers: { "x-admin-code": code } });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || "Не удалось скачать CSV.");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNote("#panelNote", "CSV скачан.", "ok");
  } catch (err) {
    setNote("#panelNote", err?.message || "Не удалось скачать CSV.", "error");
  }
}

function showPanel() {
  const login = $("#loginSection");
  const panel = $("#panelSection");
  if (login) login.hidden = true;
  if (panel) panel.hidden = false;
}

function showLogin() {
  const login = $("#loginSection");
  const panel = $("#panelSection");
  if (login) login.hidden = false;
  if (panel) panel.hidden = true;
  setNote("#loginNote", "", "");
}

function wire() {
  const loginForm = $("#loginForm");
  const loginBtn = $("#loginBtn");
  const refreshBtn = $("#refreshBtn");
  const csvBtn = $("#csvBtn");
  const logoutBtn = $("#logoutBtn");

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setNote("#loginNote", "", "");
    loginBtn.disabled = true;

    try {
      const fd = new FormData(loginForm);
      const code = String(fd.get("code") || "").trim();
      if (!code) {
        setNote("#loginNote", "Введите код доступа.", "error");
        return;
      }
      setCode(code);
      showPanel();
      await loadRows();
    } catch (err) {
      clearCode();
      showLogin();
      setNote("#loginNote", err?.message || "Не удалось войти.", "error");
    } finally {
      loginBtn.disabled = false;
    }
  });

  $("#searchInput")?.addEventListener("input", applyFilters);
  $("#statusFilter")?.addEventListener("change", applyFilters);

  refreshBtn?.addEventListener("click", loadRows);
  csvBtn?.addEventListener("click", downloadCsv);
  logoutBtn?.addEventListener("click", () => {
    clearCode();
    allRows = [];
    showLogin();
  });

  if (getCode()) {
    showPanel();
    loadRows();
  } else {
    showLogin();
  }
}

wire();

