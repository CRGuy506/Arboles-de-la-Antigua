/**
 * calendar.js - Custom volunteer booking board for calendario.html
 *
 * Frontend-first adapter:
 * - Uses Google Calendar public ICS data for shift options by default.
 * - Can switch to API mode by setting window.ADLA_BOOKING_API = 'https://...'.
 */
(function initCalendarioBookingBoard() {
  const bookingListEl = document.getElementById('bookingList');
  if (!bookingListEl) {
    return;
  }

  const crewFilterEl = document.getElementById('bookingCrewFilter');
  const dateFilterEl = document.getElementById('bookingDateFilter');
  const clearFiltersBtn = document.getElementById('bookingClearFilters');
  const bookingStatusEl = document.getElementById('bookingStatus');
  const calendarGridEl = document.getElementById('calendarGrid');
  const calendarWeekdayHeadEl = document.getElementById('calendarWeekdayHead');
  const calendarMonthLabelEl = document.getElementById('calendarMonthLabel');
  const calendarPrevMonthBtn = document.getElementById('calendarPrevMonth');
  const calendarNextMonthBtn = document.getElementById('calendarNextMonth');
  const calendarTodayBtn = document.getElementById('calendarTodayBtn');
  const calendarViewMonthBtn = document.getElementById('calendarViewMonth');
  const calendarViewYearBtn = document.getElementById('calendarViewYear');
  const calendarYearGridEl = document.getElementById('calendarYearGrid');
  const calendarYearOverviewEl = document.getElementById('calendarYearOverview');

  const API_BASE = window.ADLA_BOOKING_API || '';
  const LOCAL_BOOKINGS_KEY = 'adla-local-bookings-v1';
  const GOOGLE_CALENDAR_ID = window.ADLA_GOOGLE_CALENDAR_ID || 'mumosfam@gmail.com';
  const GOOGLE_ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/public/full.ics`;
  let googleIcsCachePromise = null;

  const LOCAL_IMPORTANT_DATES = buildImportantDates();
  const state = {
    shifts: [],
    filteredShifts: [],
    locale: getCurrentLocale(),
    selectedDate: '',
    monthCursor: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    viewMode: 'month',
    importantDates: LOCAL_IMPORTANT_DATES,
  };

  function getCurrentLocale() {
    const lang = (document.documentElement.lang || 'es').toLowerCase();
    if (lang.startsWith('fr')) return 'fr';
    if (lang.startsWith('en')) return 'en';
    return 'es';
  }

  function getDictionary(locale) {
    const all = window.ADLA_TRANSLATIONS || {};
    const fallback = all.es || {};
    return all[locale] || fallback;
  }

  function t(key, fallback) {
    const dict = getDictionary(state.locale);
    const fallbackDict = getDictionary('es');
    return dict[key] || fallbackDict[key] || fallback;
  }

  function setStatus(messageKey, fallback) {
    if (!bookingStatusEl) return;
    bookingStatusEl.textContent = t(messageKey, fallback);
  }

  function buildImportantDates() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    function day(dayOffset) {
      const d = new Date(start);
      d.setDate(d.getDate() + dayOffset);
      return d.toISOString().slice(0, 10);
    }

    return [
      { date: day(1), key: 'importantPrep', fallback: 'Revisión previa de herramientas' },
      { date: day(7), key: 'importantCommunityMeet', fallback: 'Reunión vecinal de coordinación' },
      { date: day(14), key: 'importantSupplyCutoff', fallback: 'Cierre de recepción de insumos' },
    ];
  }

  function dateKey(value) {
    return value.slice(0, 10);
  }

  function parseDateKey(value) {
    const [year, month, day] = value.split('-').map((part) => Number(part));
    return new Date(year, month - 1, day);
  }

  function readLocalBookings() {
    try {
      const raw = localStorage.getItem(LOCAL_BOOKINGS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function writeLocalBookings(bookings) {
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
  }

  function getLocalReservedCount(shiftId) {
    return readLocalBookings().reduce((acc, item) => {
      if (item.shiftId !== shiftId) return acc;
      return acc + (Number(item.participants) || 1);
    }, 0);
  }

  async function loadShifts() {
    if (API_BASE) {
      const response = await fetch(`${API_BASE}/shifts`, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }
      const payload = await response.json();
      return Array.isArray(payload) ? payload : payload.shifts || [];
    }

    try {
      const icsText = await fetchGoogleCalendarIcs();
      const shifts = parseShiftsFromIcs(icsText);
      return shifts.map((shift) => {
        const additional = getLocalReservedCount(shift.id);
        return {
          ...shift,
          reserved: Math.min(shift.capacity, shift.reserved + additional),
        };
      });
    } catch (_err) {
      // If Google feed is unavailable, return no shifts instead of random placeholders.
      return [];
    }
  }

  async function fetchGoogleCalendarIcs() {
    if (!googleIcsCachePromise) {
      googleIcsCachePromise = fetch(GOOGLE_ICS_URL, { method: 'GET' })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`calendar_feed_${response.status}`);
          }
          return response.text();
        });
    }
    return googleIcsCachePromise;
  }

  function unfoldIcsLines(text) {
    return String(text || '')
      .replace(/\r\n[ \t]/g, '')
      .replace(/\n[ \t]/g, '');
  }

  function decodeIcsText(value) {
    return String(value || '')
      .replace(/\\n/gi, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\')
      .trim();
  }

  function getIcsProp(block, propName) {
    const regex = new RegExp(`(?:^|\\n)${propName}(?:;[^:]+)?:([^\\n]+)`);
    const match = block.match(regex);
    return match ? decodeIcsText(match[1]) : '';
  }

  function parseIcsDateTime(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;

    const dateOnly = raw.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (dateOnly) {
      return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 8, 0, 0, 0);
    }

    const dateTime = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
    if (!dateTime) return null;

    const year = Number(dateTime[1]);
    const month = Number(dateTime[2]) - 1;
    const day = Number(dateTime[3]);
    const hour = Number(dateTime[4]);
    const minute = Number(dateTime[5]);
    const second = Number(dateTime[6] || '0');
    const isUtc = Boolean(dateTime[7]);

    if (isUtc) {
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    return new Date(year, month, day, hour, minute, second);
  }

  function inferCrewType(summary, description) {
    const text = `${summary} ${description}`.toLowerCase();
    if (/(siembra|planting|reforest)/.test(text)) return 'planting';
    if (/(mantenimiento|maintenance|poda|riego)/.test(text)) return 'maintenance';
    return 'logistics';
  }

  function eventLooksBookable(summary, description, categories) {
    const text = `${summary} ${description} ${categories}`.toLowerCase();
    return /(book|booking|reserva|cuadrilla|turno|volunteer|voluntariado|siembra|mantenimiento|logistica|logistics)/.test(text);
  }

  function extractCount(description, labels, fallback) {
    const escapedLabels = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(?:${escapedLabels})\\s*[:=]\\s*(\\d{1,3})`, 'i');
    const match = String(description || '').match(regex);
    return match ? Number(match[1]) : fallback;
  }

  function parseShiftsFromIcs(icsText) {
    const text = unfoldIcsLines(icsText);
    const chunks = text.split('BEGIN:VEVENT');
    const parsed = [];

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      if (!chunk.includes('END:VEVENT')) continue;

      const uid = getIcsProp(chunk, 'UID') || `event-${i}`;
      const summary = getIcsProp(chunk, 'SUMMARY') || t('calExternalEventFallback', 'Evento');
      const description = getIcsProp(chunk, 'DESCRIPTION');
      const categories = getIcsProp(chunk, 'CATEGORIES');
      const location = getIcsProp(chunk, 'LOCATION') || t('calShiftLocationLabel', 'Punto por definir');
      const dtStartRaw = getIcsProp(chunk, 'DTSTART');
      const dtEndRaw = getIcsProp(chunk, 'DTEND');

      if (!dtStartRaw) continue;

      const startDate = parseIcsDateTime(dtStartRaw);
      if (!startDate || Number.isNaN(startDate.getTime())) continue;

      // Signup shifts are expected to be timed slots; skip all-day informational entries.
      const hasTimeComponent = /T\d{4,6}/.test(dtStartRaw);
      if (!hasTimeComponent) continue;

      let endDate = parseIcsDateTime(dtEndRaw);
      if (!endDate || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
        endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
      }

      const capacity = Math.max(1, extractCount(description, ['cupos', 'capacidad', 'capacity', 'slots'], 10));
      const reserved = Math.min(capacity, Math.max(0, extractCount(description, ['reservados', 'inscritos', 'booked'], 0)));

      parsed.push({
        id: `gc-${uid}`,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        location,
        capacity,
        reserved,
        crewType: inferCrewType(summary, description),
        isBookable: eventLooksBookable(summary, description, categories),
      });
    }

    const explicitBookable = parsed.filter((item) => item.isBookable);
    const shifts = explicitBookable.length ? explicitBookable : parsed;

    return shifts
      .map((item) => ({
        id: item.id,
        startAt: item.startAt,
        endAt: item.endAt,
        location: item.location,
        capacity: item.capacity,
        reserved: item.reserved,
        crewType: item.crewType,
      }))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  function parseIcsDate(icsValue) {
    const match = String(icsValue || '').match(/(\d{4})(\d{2})(\d{2})/);
    if (!match) return null;
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  function parseImportantDatesFromIcs(icsText) {
    const events = [];
    const chunks = String(icsText || '').split('BEGIN:VEVENT');
    for (const chunk of chunks) {
      if (!chunk.includes('END:VEVENT')) continue;
      const summaryMatch = chunk.match(/\nSUMMARY:(.+)\r?\n/);
      const dtStartMatch = chunk.match(/\nDTSTART(?:;[^:]+)?:([^\r\n]+)/);
      const date = dtStartMatch ? parseIcsDate(dtStartMatch[1]) : null;
      if (!date) continue;
      const summary = summaryMatch ? summaryMatch[1].replace(/\\,/g, ',').trim() : t('calExternalEventFallback', 'Evento');
      events.push({ date, key: null, fallback: summary });
    }

    const byDate = new Map();
    events.forEach((evt) => {
      if (!byDate.has(evt.date)) {
        byDate.set(evt.date, evt);
      }
    });
    return Array.from(byDate.values());
  }

  async function loadImportantDates() {
    try {
      const text = await fetchGoogleCalendarIcs();
      return parseImportantDatesFromIcs(text);
    } catch (_err) {
      // Fall through to local fallback when feed is unavailable.
    }
    return LOCAL_IMPORTANT_DATES;
  }

  async function createBooking(shift, bookingData) {
    if (API_BASE) {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          shiftId: shift.id,
          ...bookingData,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.errorCode || 'booking_failed');
      }

      return response.json();
    }

    const participants = Number(bookingData.participants) || 1;
    const remaining = shift.capacity - shift.reserved;
    if (participants > remaining) {
      throw new Error('shift_full');
    }

    const bookings = readLocalBookings();
    bookings.push({
      id: `local-${Date.now()}`,
      shiftId: shift.id,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      participants,
      notes: bookingData.notes,
      createdAt: new Date().toISOString(),
    });
    writeLocalBookings(bookings);

    return { ok: true, bookingId: `local-${Date.now()}` };
  }

  function formatDateRange(startAt, endAt) {
    const start = new Date(startAt);
    const end = new Date(endAt);

    const dateText = new Intl.DateTimeFormat(state.locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(start);

    const timeText = `${new Intl.DateTimeFormat(state.locale, { hour: '2-digit', minute: '2-digit' }).format(start)} - ${new Intl.DateTimeFormat(state.locale, { hour: '2-digit', minute: '2-digit' }).format(end)}`;

    return { dateText, timeText };
  }

  function getCrewLabel(crewType) {
    const map = {
      planting: t('crewPlanting', 'Siembra'),
      maintenance: t('crewMaintenance', 'Mantenimiento'),
      logistics: t('crewLogistics', 'Logística'),
    };
    return map[crewType] || crewType;
  }

  function getShiftBadge(available) {
    if (available <= 0) {
      return {
        className: 'booking-badge booking-badge-full',
        text: t('calBadgeFull', 'Completo'),
      };
    }
    if (available <= 2) {
      return {
        className: 'booking-badge booking-badge-limited',
        text: t('calBadgeLimited', 'Pocos cupos'),
      };
    }
    return {
      className: 'booking-badge booking-badge-open',
      text: t('calBadgeOpen', 'Disponible'),
    };
  }

  function wasBookedLocally(shiftId) {
    return readLocalBookings().some((item) => item.shiftId === shiftId);
  }

  function getFilteredShifts() {
    const crewValue = crewFilterEl ? crewFilterEl.value : 'all';
    const dateValue = dateFilterEl ? dateFilterEl.value : '';

    return state.shifts.filter((shift) => {
      const shiftDate = shift.startAt.slice(0, 10);
      if (crewValue && crewValue !== 'all' && shift.crewType !== crewValue) {
        return false;
      }
      if (dateValue && shiftDate !== dateValue) {
        return false;
      }
      return true;
    });
  }

  function getShiftCountByDate() {
    const count = new Map();
    state.shifts.forEach((shift) => {
      const key = dateKey(shift.startAt);
      count.set(key, (count.get(key) || 0) + 1);
    });
    return count;
  }

  function getImportantDateMap() {
    const map = new Map();
    state.importantDates.forEach((item) => {
      map.set(item.date, item);
    });
    return map;
  }

  function getYearMonthStats(year) {
    const stats = Array.from({ length: 12 }, () => ({
      shiftCount: 0,
      plantingCount: 0,
      importantCount: 0,
    }));

    state.shifts.forEach((shift) => {
      const start = new Date(shift.startAt);
      if (start.getFullYear() !== year) return;
      const month = start.getMonth();
      stats[month].shiftCount += 1;
      if (shift.crewType === 'planting') {
        stats[month].plantingCount += 1;
      }
    });

    state.importantDates.forEach((item) => {
      const d = parseDateKey(item.date);
      if (d.getFullYear() !== year) return;
      const month = d.getMonth();
      stats[month].importantCount += 1;
    });

    return stats;
  }

  function renderYearOverview(year, yearStats) {
    if (!calendarYearOverviewEl) return;

    const totalImportant = yearStats.reduce((acc, s) => acc + s.importantCount, 0);
    const totalPlanting = yearStats.reduce((acc, s) => acc + s.plantingCount, 0);
    const totalShifts = yearStats.reduce((acc, s) => acc + s.shiftCount, 0);

    const busiestMonthIndex = yearStats.reduce((bestIndex, current, index, all) => {
      const currentScore = current.shiftCount + current.importantCount;
      const bestScore = all[bestIndex].shiftCount + all[bestIndex].importantCount;
      return currentScore > bestScore ? index : bestIndex;
    }, 0);

    const plantingMonths = yearStats
      .map((item, index) => (item.plantingCount > 0 ? index : -1))
      .filter((index) => index >= 0);

    let seasonText = t('calYearSeasonNone', 'Sin temporada de siembra registrada');
    if (plantingMonths.length > 0) {
      const seasonStart = new Date(year, plantingMonths[0], 1);
      const seasonEnd = new Date(year, plantingMonths[plantingMonths.length - 1], 1);
      const startText = new Intl.DateTimeFormat(state.locale, { month: 'short' }).format(seasonStart);
      const endText = new Intl.DateTimeFormat(state.locale, { month: 'short' }).format(seasonEnd);
      seasonText = `${startText} - ${endText}`;
    }

    const busiestMonthText = new Intl.DateTimeFormat(state.locale, { month: 'long' }).format(new Date(year, busiestMonthIndex, 1));

    calendarYearOverviewEl.innerHTML = `
      <div class="year-overview-head">
        <h4 class="year-overview-title">${t('calYearOverviewTitle', 'Panorama anual')}</h4>
        <p class="year-overview-season"><strong>${t('calYearSeasonLabel', 'Ventana de siembra')}:</strong> ${seasonText}</p>
      </div>
      <div class="year-overview-stats">
        <p class="year-overview-stat"><strong>${totalImportant}</strong> ${t('calYearImportantCount', 'fechas importantes')}</p>
        <p class="year-overview-stat"><strong>${totalPlanting}</strong> ${t('calYearPlantingCount', 'turnos de siembra')}</p>
        <p class="year-overview-stat"><strong>${totalShifts}</strong> ${t('calYearShiftCount', 'turnos')}</p>
        <p class="year-overview-stat"><strong>${busiestMonthText}</strong> ${t('calYearPeakMonthLabel', 'mes con más actividad')}</p>
      </div>
      <div class="year-overview-strip" role="img" aria-label="${t('calYearStripAria', 'Intensidad mensual de actividad')}">
        ${yearStats.map((item, index) => {
          const score = item.shiftCount + item.importantCount;
          const level = score >= 4 ? 4 : score >= 2 ? 3 : score >= 1 ? 2 : 1;
          const monthText = new Intl.DateTimeFormat(state.locale, { month: 'short' }).format(new Date(year, index, 1));
          const tooltip = `${monthText}: ${item.shiftCount} ${t('calYearShiftCount', 'turnos')}, ${item.importantCount} ${t('calYearImportantCount', 'fechas importantes')}`;
          return `<span class="year-overview-cell level-${level}" title="${tooltip}">${monthText}</span>`;
        }).join('')}
      </div>
    `;
  }

  function renderWeekdayHead() {
    if (!calendarWeekdayHeadEl) return;
    calendarWeekdayHeadEl.innerHTML = '';

    const base = new Date(Date.UTC(2026, 0, 4)); // Sunday base
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(base);
      day.setUTCDate(base.getUTCDate() + i);
      const label = new Intl.DateTimeFormat(state.locale, { weekday: 'short' }).format(day);
      const span = document.createElement('span');
      span.textContent = label;
      calendarWeekdayHeadEl.appendChild(span);
    }
  }

  function renderMonthCalendar() {
    if (!calendarGridEl || !calendarMonthLabelEl) return;

    const monthStart = new Date(state.monthCursor.getFullYear(), state.monthCursor.getMonth(), 1);
    const monthEnd = new Date(state.monthCursor.getFullYear(), state.monthCursor.getMonth() + 1, 0);
    const shiftCountByDate = getShiftCountByDate();
    const importantByDate = getImportantDateMap();

    calendarMonthLabelEl.textContent = new Intl.DateTimeFormat(state.locale, {
      month: 'long',
      year: 'numeric',
    }).format(monthStart);

    calendarGridEl.innerHTML = '';

    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    const todayKey = dateKey(new Date().toISOString());

    for (let i = 0; i < 42; i += 1) {
      const current = new Date(gridStart);
      current.setDate(gridStart.getDate() + i);
      const key = current.toISOString().slice(0, 10);
      const isCurrentMonth = current >= monthStart && current <= monthEnd;
      const isSelected = state.selectedDate === key;
      const isToday = key === todayKey;
      const shiftCount = shiftCountByDate.get(key) || 0;
      const important = importantByDate.get(key);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'month-day';
      btn.setAttribute('role', 'gridcell');
      btn.dataset.date = key;
      btn.setAttribute('aria-label', new Intl.DateTimeFormat(state.locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(current));

      if (!isCurrentMonth) btn.classList.add('month-day-muted');
      if (isSelected) btn.classList.add('month-day-selected');
      if (isToday) btn.classList.add('month-day-today');

      const markers = [];
      if (shiftCount > 0) {
        markers.push('<span class="month-marker month-marker-shift" aria-hidden="true"></span>');
      }
      if (important) {
        markers.push('<span class="month-marker month-marker-important" aria-hidden="true"></span>');
      }

      btn.innerHTML = `
        <span class="month-day-daynum">${current.getDate()}</span>
        <span class="month-day-markers">${markers.join('')}</span>
      `;

      if (important) {
        const title = t(important.key, important.fallback);
        btn.title = title;
      }

      calendarGridEl.appendChild(btn);
    }

    renderWeekdayHead();
  }

  function renderYearCalendar() {
    if (!calendarYearGridEl || !calendarMonthLabelEl) return;

    const year = state.monthCursor.getFullYear();
    const yearStats = getYearMonthStats(year);

    calendarMonthLabelEl.textContent = String(year);
    calendarYearGridEl.innerHTML = '';
    renderYearOverview(year, yearStats);

    for (let month = 0; month < 12; month += 1) {
      const monthStart = new Date(year, month, 1);
      const monthStats = yearStats[month];
      const shiftCount = monthStats.shiftCount;
      const importantCount = monthStats.importantCount;
      const plantingCount = monthStats.plantingCount;

      const btn = document.createElement('button');
      btn.type = 'button';
      const hasActivity = shiftCount > 0 || importantCount > 0;
      const hasPlanting = plantingCount > 0;
      btn.className = `year-month-card ${hasActivity ? 'year-month-has-data' : 'year-month-empty'} ${hasPlanting ? 'year-month-planting' : ''}`;
      btn.dataset.month = String(month);
      btn.innerHTML = `
        <h4 class="year-month-title">${new Intl.DateTimeFormat(state.locale, { month: 'long', year: 'numeric' }).format(monthStart)}</h4>
        <p class="year-month-meta">${shiftCount} ${t('calYearShiftCount', 'turnos')}</p>
        <p class="year-month-meta">${importantCount} ${t('calYearImportantCount', 'fechas importantes')}</p>
        <p class="year-month-meta">${plantingCount} ${t('calYearPlantingCount', 'turnos de siembra')}</p>
        <p class="year-month-pill">${hasActivity ? t('calYearHasActivity', 'Con actividad') : t('calYearNoActivity', 'Sin actividad')}</p>
      `;

      calendarYearGridEl.appendChild(btn);
    }
  }

  function renderCalendarView() {
    const isYear = state.viewMode === 'year';

    if (calendarWeekdayHeadEl) {
      calendarWeekdayHeadEl.hidden = isYear;
    }
    if (calendarGridEl) {
      calendarGridEl.hidden = isYear;
    }
    if (calendarYearGridEl) {
      calendarYearGridEl.hidden = !isYear;
    }
    if (calendarYearOverviewEl) {
      calendarYearOverviewEl.hidden = !isYear;
    }

    if (calendarViewMonthBtn) {
      calendarViewMonthBtn.classList.toggle('is-active', !isYear);
    }
    if (calendarViewYearBtn) {
      calendarViewYearBtn.classList.toggle('is-active', isYear);
    }

    if (isYear) {
      renderYearCalendar();
    } else {
      renderMonthCalendar();
    }
  }

  function renderShiftCard(shift) {
    const available = Math.max(shift.capacity - shift.reserved, 0);
    const badge = getShiftBadge(available);
    const when = formatDateRange(shift.startAt, shift.endAt);
    const alreadyBooked = wasBookedLocally(shift.id);

    const card = document.createElement('article');
    card.className = 'booking-shift';
    card.setAttribute('role', 'listitem');

    const reserveDisabled = available <= 0;

    card.innerHTML = `
      <div class="booking-shift-head">
        <h3>${when.dateText}</h3>
        <span class="${badge.className}">${badge.text}</span>
      </div>
      <p class="booking-meta"><strong>${t('calShiftTimeLabel', 'Horario')}:</strong> ${when.timeText}</p>
      <p class="booking-meta"><strong>${t('calShiftCrewLabel', 'Cuadrilla')}:</strong> ${getCrewLabel(shift.crewType)}</p>
      <p class="booking-meta"><strong>${t('calShiftLocationLabel', 'Punto')}:</strong> ${shift.location}</p>
      <div class="booking-action-row">
        <p class="booking-meta"><strong>${t('calShiftSlotsLabel', 'Cupos')}:</strong> ${shift.reserved}/${shift.capacity} (${available} ${t('calShiftSpotsLeft', 'libres')})</p>
        <button type="button" class="btn-cta-sm" data-book-shift="${shift.id}" ${reserveDisabled ? 'disabled' : ''}>
          ${reserveDisabled ? t('calShiftFull', 'Completo') : t('calShiftReserve', 'Reservar')}
        </button>
      </div>
      ${alreadyBooked ? `<span class="booking-booked-mark">${t('calShiftBooked', 'Ya tienes una reserva en este turno')}</span>` : ''}
    `;

    return card;
  }

  function renderList() {
    if (!bookingListEl) return;

    state.filteredShifts = getFilteredShifts();
    bookingListEl.innerHTML = '';

    if (!state.filteredShifts.length) {
      setStatus('calStatusEmpty', 'No hay turnos para los filtros seleccionados.');
      renderCalendarView();
      return;
    }

    setStatus('calStatusReady', 'Seleccione un turno para reservar.');
    state.filteredShifts.forEach((shift) => {
      bookingListEl.appendChild(renderShiftCard(shift));
    });

    renderCalendarView();
  }

  function openBookingModal(shift) {
    if (!window.ADLA_MODAL || typeof window.ADLA_MODAL.openModal !== 'function') {
      return;
    }

    const available = Math.max(shift.capacity - shift.reserved, 0);
    const when = formatDateRange(shift.startAt, shift.endAt);

    const body = `
      <p><strong>${t('calShiftTimeLabel', 'Horario')}:</strong> ${when.dateText}, ${when.timeText}</p>
      <p><strong>${t('calShiftCrewLabel', 'Cuadrilla')}:</strong> ${getCrewLabel(shift.crewType)}</p>
      <p><strong>${t('calShiftLocationLabel', 'Punto')}:</strong> ${shift.location}</p>
      <p><strong>${t('calShiftSlotsLabel', 'Cupos')}:</strong> ${shift.reserved}/${shift.capacity}</p>
      <form id="bookingForm" class="booking-form">
        <div>
          <label for="bookingName">${t('calFormNameLabel', 'Nombre')}</label>
          <input id="bookingName" name="name" type="text" required maxlength="80" />
        </div>
        <div>
          <label for="bookingEmail">${t('calFormEmailLabel', 'Correo')}</label>
          <input id="bookingEmail" name="email" type="email" required maxlength="120" />
        </div>
        <div>
          <label for="bookingPhone">${t('calFormPhoneLabel', 'Teléfono')}</label>
          <input id="bookingPhone" name="phone" type="tel" maxlength="25" />
        </div>
        <div>
          <label for="bookingParticipants">${t('calFormParticipantsLabel', 'Personas')}</label>
          <select id="bookingParticipants" name="participants" required>
            <option value="1">1</option>
            <option value="2" ${available < 2 ? 'disabled' : ''}>2</option>
            <option value="3" ${available < 3 ? 'disabled' : ''}>3</option>
            <option value="4" ${available < 4 ? 'disabled' : ''}>4</option>
          </select>
        </div>
        <div>
          <label for="bookingNotes">${t('calFormNotesLabel', 'Notas')}</label>
          <textarea id="bookingNotes" name="notes" maxlength="300"></textarea>
        </div>
        <button class="btn-cta-sm" type="submit">${t('calFormSubmit', 'Confirmar reserva')}</button>
      </form>
    `;

    window.ADLA_MODAL.openModal({
      title: t('calBookingModalTitle', 'Reserva de voluntariado'),
      body,
    });

    const form = document.getElementById('bookingForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const payload = {
        name: String(data.get('name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        participants: Number(data.get('participants') || 1),
        notes: String(data.get('notes') || '').trim(),
      };

      if (!payload.name || !payload.email || payload.participants < 1) {
        window.ADLA_MODAL.openModal({
          title: t('calBookingErrorTitle', 'No fue posible reservar'),
          body: `<p>${t('calBookingErrorValidation', 'Por favor complete los campos obligatorios correctamente.')}</p>`,
        });
        return;
      }

      try {
        await createBooking(shift, payload);
        await refreshAndRender();

        window.ADLA_MODAL.openModal({
          title: t('calBookingSuccessTitle', 'Reserva confirmada'),
          body: `<p>${t('calBookingSuccessBody', 'Su espacio quedó reservado. Nos vemos en la jornada.')}</p>`,
        });
      } catch (err) {
        const code = err instanceof Error ? err.message : 'booking_failed';
        const message = code === 'shift_full'
          ? t('calBookingErrorFull', 'Este turno ya no tiene cupos disponibles.')
          : t('calBookingErrorGeneric', 'No se pudo procesar la reserva. Intente nuevamente.');

        window.ADLA_MODAL.openModal({
          title: t('calBookingErrorTitle', 'No fue posible reservar'),
          body: `<p>${message}</p>`,
        });
      }
    });
  }

  async function refreshAndRender() {
    setStatus('calStatusLoading', 'Cargando turnos...');
    try {
      const [loadedShifts, loadedImportantDates] = await Promise.all([
        loadShifts(),
        loadImportantDates(),
      ]);
      state.shifts = loadedShifts;
      state.importantDates = loadedImportantDates;
      renderList();
    } catch (_err) {
      if (bookingStatusEl) {
        bookingStatusEl.textContent = t('calStatusLoadError', 'No se pudieron cargar los turnos en este momento.');
      }
      bookingListEl.innerHTML = '';
    }
  }

  function bindInteractions() {
    if (crewFilterEl) {
      crewFilterEl.addEventListener('change', renderList);
    }
    if (dateFilterEl) {
      dateFilterEl.addEventListener('change', () => {
        state.selectedDate = dateFilterEl.value || '';
        if (state.selectedDate) {
          const selected = parseDateKey(state.selectedDate);
          state.monthCursor = new Date(selected.getFullYear(), selected.getMonth(), 1);
        }
        renderList();
      });
    }
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        if (crewFilterEl) crewFilterEl.value = 'all';
        if (dateFilterEl) dateFilterEl.value = '';
        state.selectedDate = '';
        renderList();
      });
    }

    if (calendarPrevMonthBtn) {
      calendarPrevMonthBtn.addEventListener('click', () => {
        if (state.viewMode === 'year') {
          state.monthCursor = new Date(state.monthCursor.getFullYear() - 1, 0, 1);
        } else {
          state.monthCursor = new Date(state.monthCursor.getFullYear(), state.monthCursor.getMonth() - 1, 1);
        }
        renderCalendarView();
      });
    }

    if (calendarNextMonthBtn) {
      calendarNextMonthBtn.addEventListener('click', () => {
        if (state.viewMode === 'year') {
          state.monthCursor = new Date(state.monthCursor.getFullYear() + 1, 0, 1);
        } else {
          state.monthCursor = new Date(state.monthCursor.getFullYear(), state.monthCursor.getMonth() + 1, 1);
        }
        renderCalendarView();
      });
    }

    if (calendarTodayBtn) {
      calendarTodayBtn.addEventListener('click', () => {
        const now = new Date();
        const key = now.toISOString().slice(0, 10);
        state.monthCursor = new Date(now.getFullYear(), now.getMonth(), 1);
        state.selectedDate = key;
        if (dateFilterEl) {
          dateFilterEl.value = key;
        }
        renderList();
      });
    }

    if (calendarViewMonthBtn) {
      calendarViewMonthBtn.addEventListener('click', () => {
        state.viewMode = 'month';
        renderCalendarView();
      });
    }

    if (calendarViewYearBtn) {
      calendarViewYearBtn.addEventListener('click', () => {
        state.viewMode = 'year';
        renderCalendarView();
      });
    }

    if (calendarGridEl) {
      calendarGridEl.addEventListener('click', (event) => {
        if (!(event.target instanceof HTMLElement)) return;
        const dayBtn = event.target.closest('.month-day');
        if (!dayBtn) return;

        const date = dayBtn.dataset.date || '';
        if (!date) return;
        state.selectedDate = date;
        state.monthCursor = new Date(parseDateKey(date).getFullYear(), parseDateKey(date).getMonth(), 1);
        if (dateFilterEl) {
          dateFilterEl.value = date;
        }
        renderList();
      });
    }

    if (calendarYearGridEl) {
      calendarYearGridEl.addEventListener('click', (event) => {
        if (!(event.target instanceof HTMLElement)) return;
        const monthCard = event.target.closest('.year-month-card');
        if (!monthCard) return;
        const monthIndex = Number(monthCard.dataset.month || '0');
        state.monthCursor = new Date(state.monthCursor.getFullYear(), monthIndex, 1);
        state.viewMode = 'month';
        renderCalendarView();
      });
    }

    bookingListEl.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      const button = event.target.closest('button[data-book-shift]');
      if (!button) return;

      const shiftId = button.getAttribute('data-book-shift');
      const shift = state.shifts.find((item) => item.id === shiftId);
      if (!shift) return;

      const available = Math.max(shift.capacity - shift.reserved, 0);
      if (available <= 0) {
        return;
      }

      openBookingModal(shift);
    });

    document.addEventListener('adla-language-changed', () => {
      state.locale = getCurrentLocale();
      renderList();
    });
  }

  bindInteractions();
  refreshAndRender();
})();
