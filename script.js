// Einsatzplanung - JavaScript

let currentViewDate = new Date();

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
  document.getElementById('darkModeIcon').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('darkModeText').textContent = isDark ? 'Hellmodus' : 'Dunkelmodus';
}

function initDarkMode() {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeIcon').textContent = '☀️';
    document.getElementById('darkModeText').textContent = 'Hellmodus';
  }
}

function toggleDevMode() {
  document.body.classList.toggle('dev-mode');
  const isActive = document.body.classList.contains('dev-mode');
  document.querySelector('.dev-mode-toggle').classList.toggle('active', isActive);
  localStorage.setItem('devMode', isActive ? 'enabled' : 'disabled');
}

function initDevMode() {
  const devMode = localStorage.getItem('devMode');
  if (devMode === 'enabled') {
    document.body.classList.add('dev-mode');
    document.querySelector('.dev-mode-toggle').classList.add('active');
  }
}

function initDragAndDrop(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const tbody = table.querySelector('tbody');
  let draggedRow = null;

  tbody.querySelectorAll('tr[draggable="true"]').forEach(row => {
    row.addEventListener('dragstart', function(e) {
      draggedRow = row;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', function() {
      row.classList.remove('dragging');
      tbody.querySelectorAll('tr').forEach(r => r.classList.remove('drag-over'));
    });

    row.addEventListener('dragover', function(e) {
      e.preventDefault();
      const afterElement = getDragAfterElement(tbody, e.clientY);
      if (afterElement == null) {
        tbody.appendChild(draggedRow);
      } else {
        tbody.insertBefore(draggedRow, afterElement);
      }
    });

    row.addEventListener('dragenter', function(e) {
      e.preventDefault();
      if (row !== draggedRow) {
        row.classList.add('drag-over');
      }
    });

    row.addEventListener('dragleave', function() {
      row.classList.remove('drag-over');
    });

    row.addEventListener('drop', function(e) {
      e.preventDefault();
      row.classList.remove('drag-over');
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('tr[draggable="true"]:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function berechnen() {
  const fruehName = document.getElementById('fruehName').textContent.trim();
  const spatName = document.getElementById('spatName').textContent.trim();
  const taetiName = document.getElementById('taetiName').textContent.trim();
  const nachtName = document.getElementById('nachtName').textContent.trim();
  const extraName = document.getElementById('extraName').textContent.trim();

  document.querySelectorAll('.schicht-frueh').forEach(element => {
    element.textContent = fruehName;
  });

  document.querySelectorAll('.schicht-spat').forEach(element => {
    element.textContent = spatName;
  });

  document.querySelectorAll('.schicht-taeti').forEach(element => {
    element.textContent = taetiName;
  });

  document.querySelectorAll('.schicht-nacht').forEach(element => {
    element.textContent = nachtName;
  });

  document.querySelectorAll('.schicht-extra').forEach(element => {
    element.textContent = extraName;
  });

  updateDashboard();
}

function updateDashboard() {
  let frueh = parseInt(document.getElementById('maFrueh').value, 10) || 0;
  let spat = parseInt(document.getElementById('maSpat').value, 10) || 0;
  let taeti = parseInt(document.getElementById('maTaeti').value, 10) || 0;
  let nacht = parseInt(document.getElementById('maNacht').value, 10) || 0;
  let extra = parseInt(document.getElementById('maExtra').value, 10) || 0;
  let gesamt = frueh + spat + taeti + nacht + extra;
  document.getElementById('gesamtMA').textContent = gesamt;

  let poolRows = document.querySelectorAll('#poolsTable tbody tr');
  let benoetigteMA = 0;
  poolRows.forEach(row => {
    let wert = parseFloat(row.querySelector('.bedarf').textContent.replace(",", "."));
    benoetigteMA += isNaN(wert) ? 0 : wert;
  });

  let status = benoetigteMA ? Math.round(gesamt / benoetigteMA * 100) : 0;
  document.getElementById('statusValue').textContent = status + "%";

  const ampelGreen = document.getElementById('ampelGreen');
  const ampelOrange = document.getElementById('ampelOrange');
  const ampelRed = document.getElementById('ampelRed');

  ampelGreen.classList.remove('active');
  ampelOrange.classList.remove('active');
  ampelRed.classList.remove('active');

  if (status >= 100) {
    ampelGreen.classList.add('active');
  } else if (status >= 80) {
    ampelOrange.classList.add('active');
  } else {
    ampelRed.classList.add('active');
  }
}

function startClock() {
  function tick() {
    let now = new Date();
    let h = String(now.getHours()).padStart(2, '0');
    let m = String(now.getMinutes()).padStart(2, '0');
    let s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('liveClock').textContent = h + ":" + m + ":" + s;
    setTimeout(tick, 1000);
  }
  tick();
}

function updateDateDisplay() {
  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  const dayName = days[currentViewDate.getDay()];
  const day = String(currentViewDate.getDate()).padStart(2, '0');
  const monthName = months[currentViewDate.getMonth()];
  const year = currentViewDate.getFullYear();

  document.getElementById('currentDate').textContent = `${dayName}, ${day}. ${monthName} ${year}`;
}

function changeDate(days) {
  currentViewDate.setDate(currentViewDate.getDate() + days);
  updateDateDisplay();
}

function goToToday() {
  const today = new Date();
  currentViewDate.setFullYear(today.getFullYear());
  currentViewDate.setMonth(today.getMonth());
  currentViewDate.setDate(today.getDate());
  updateDateDisplay();
}

let timelineBoxes = JSON.parse(localStorage.getItem('timelineBoxes')) || [];
let boxIdCounter = parseInt(localStorage.getItem('boxIdCounter')) || 0;
let isDraggingTimeline = false;
let isResizing = false;
let currentDragBox = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function initPoolsGrid() {
  const poolsGrid = document.getElementById('poolsGrid');
  if (!poolsGrid) return;

  const poolRows = document.querySelectorAll('#poolsTable tbody tr');
  const pools = new Set();

  poolRows.forEach(row => {
    const poolBadges = row.querySelectorAll('.pool-badge');
    if (poolBadges.length >= 2) {
      const poolName = poolBadges[1].textContent.trim();
      const descCell = row.querySelector('td:first-child');
      const fullText = descCell ? descCell.textContent.trim() : poolName;

      const parts = fullText.split(poolName);
      const description = parts.length > 1 ? parts[1].trim() : poolName;

      pools.add(JSON.stringify({ name: poolName, desc: description }));
    }
  });

  pools.forEach(poolJson => {
    const pool = JSON.parse(poolJson);
    const dragItem = document.createElement('div');
    dragItem.className = 'drag-item pool-item';
    dragItem.draggable = true;
    dragItem.dataset.type = 'pool';
    dragItem.dataset.value = pool.desc || pool.name;
    dragItem.textContent = pool.name;
    dragItem.title = pool.desc;

    setupDragItem(dragItem);
    poolsGrid.appendChild(dragItem);
  });
}

function setupDragItem(item) {
  item.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: item.dataset.type,
      value: item.dataset.value,
      style: item.style.background || item.style.backgroundColor
    }));
  });
}

function initTimeline() {
  const canvas = document.getElementById('timelineCanvas');
  if (!canvas) return;

  setupTimelineDragItems();
  renderTimelineBoxes();
}

function setupTimelineDragItems() {
  const dragItems = document.querySelectorAll('.drag-item');

  dragItems.forEach(item => {
    setupDragItem(item);
  });

  const canvas = document.getElementById('timelineCanvas');
  if (!canvas) return;

  canvas.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  canvas.addEventListener('drop', function(e) {
    e.preventDefault();

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      createTimelineBox(data.value, x, y, data.type);
    } catch (err) {
      console.error('Drop error:', err);
    }
  });
}

function createTimelineBox(text, x, y, type) {
  boxIdCounter++;

  const canvas = document.getElementById('timelineCanvas');
  const canvasWidth = canvas.offsetWidth;
  const canvasHeight = canvas.offsetHeight;
  const paddingLeft = 5;
  const paddingTop = 5;
  const paddingRight = 25;
  const paddingBottom = 15;

  const boxX = Math.max(paddingLeft, Math.min(x, canvasWidth - 140 - paddingRight));
  const boxY = Math.max(paddingTop, Math.min(y, canvasHeight - 50 - paddingBottom));

  const box = {
    id: boxIdCounter,
    text: text,
    x: boxX,
    y: boxY,
    width: 140,
    type: type,
    className: getBoxClassName(text)
  };

  timelineBoxes.push(box);
  saveTimelineData();
  renderTimelineBoxes();
}

function getBoxClassName(text) {
  const textUpper = text.toUpperCase();
  if (textUpper.includes('FRÜH')) return 'schicht-frueh';
  if (textUpper.includes('SPÄT')) return 'schicht-spat';
  if (textUpper.includes('TÄTI')) return 'schicht-taeti';
  if (textUpper.includes('NACHT')) return 'schicht-nacht';
  if (textUpper.includes('EXTRA')) return 'schicht-extra';
  return 'pool-box';
}

function renderTimelineBoxes() {
  const canvas = document.getElementById('timelineCanvas');
  if (!canvas) return;

  canvas.querySelectorAll('.timeline-box').forEach(box => box.remove());

  timelineBoxes.forEach(boxData => {
    const boxEl = document.createElement('div');
    boxEl.className = `timeline-box ${boxData.className}`;
    boxEl.style.left = boxData.x + 'px';
    boxEl.style.top = boxData.y + 'px';
    boxEl.style.width = boxData.width + 'px';
    boxEl.dataset.id = boxData.id;

    const canvasWidth = canvas.offsetWidth;
    const slotWidth = canvasWidth / 14;
    const startSlot = Math.round(boxData.x / slotWidth);
    const durationSlots = Math.round(boxData.width / slotWidth);
    const startHour = 6 + startSlot;
    const endHour = startHour + durationSlots;

    const textEl = document.createElement('div');
    textEl.className = 'timeline-box-text';
    textEl.textContent = boxData.text;
    boxEl.appendChild(textEl);

    const timeEl = document.createElement('div');
    timeEl.className = 'timeline-box-time';
    timeEl.textContent = `${formatHour(startHour)} - ${formatHour(endHour)}`;
    boxEl.appendChild(timeEl);

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    boxEl.appendChild(resizeHandle);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = function(e) {
      e.stopPropagation();
      deleteTimelineBox(boxData.id);
    };
    boxEl.appendChild(deleteBtn);

    boxEl.addEventListener('mousedown', function(e) {
      if (e.target.classList.contains('resize-handle')) {
        startResize(e, boxData);
      } else if (!e.target.classList.contains('delete-btn')) {
        startDragBox(e, boxData, boxEl);
      }
    });

    canvas.appendChild(boxEl);
  });
}

function formatHour(hour) {
  const h = Math.floor(hour);
  const m = Math.round((hour % 1) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function startDragBox(e, boxData, boxEl) {
  e.preventDefault();
  isDraggingTimeline = true;
  currentDragBox = boxData;
  boxEl.classList.add('dragging');

  const rect = boxEl.getBoundingClientRect();
  const canvas = document.getElementById('timelineCanvas');
  const canvasRect = canvas.getBoundingClientRect();

  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  function onMouseMove(e) {
    if (!isDraggingTimeline) return;

    const x = e.clientX - canvasRect.left - dragOffsetX;
    const y = e.clientY - canvasRect.top - dragOffsetY;

    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    const paddingLeft = 5;
    const paddingTop = 5;
    const paddingRight = 25;
    const paddingBottom = 15;
    
    const freeX = Math.max(paddingLeft, Math.min(x, canvasWidth - currentDragBox.width - paddingRight));
    const freeY = Math.max(paddingTop, Math.min(y, canvasHeight - 40 - paddingBottom));

    boxEl.style.left = freeX + 'px';
    boxEl.style.top = freeY + 'px';

    currentDragBox.x = freeX;
    currentDragBox.y = freeY;

    const slotWidth = canvasWidth / 14;
    const startSlot = freeX / slotWidth;
    const durationSlots = currentDragBox.width / slotWidth;
    const startHour = 6 + startSlot;
    const endHour = startHour + durationSlots;
    const timeEl = boxEl.querySelector('.timeline-box-time');
    if (timeEl) {
      timeEl.textContent = `${formatHour(startHour)} - ${formatHour(endHour)}`;
    }
  }

  function onMouseUp() {
    if (isDraggingTimeline) {
      isDraggingTimeline = false;
      boxEl.classList.remove('dragging');
      saveTimelineData();
    }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function startResize(e, boxData) {
  e.preventDefault();
  e.stopPropagation();
  isResizing = true;

  const canvas = document.getElementById('timelineCanvas');
  const canvasRect = canvas.getBoundingClientRect();
  const startX = e.clientX;
  const startWidth = boxData.width;

  function onMouseMove(e) {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const newWidth = Math.max(45, startWidth + deltaX);

    boxData.width = newWidth;
    renderTimelineBoxes();
  }

  function onMouseUp() {
    if (isResizing) {
      isResizing = false;
      saveTimelineData();
    }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function deleteTimelineBox(id) {
  timelineBoxes = timelineBoxes.filter(box => box.id !== id);
  saveTimelineData();
  renderTimelineBoxes();
}

function saveTimelineData() {
  localStorage.setItem('timelineBoxes', JSON.stringify(timelineBoxes));
  localStorage.setItem('boxIdCounter', boxIdCounter.toString());
}

document.addEventListener('DOMContentLoaded', function() {
  initDragAndDrop('einsatzplanTable');
  initDragAndDrop('poolsTable');

  berechnen();
  startClock();
  updateDateDisplay();
  initDarkMode();
  initDevMode();
  initTimeline();
  initPoolsGrid();

  document.querySelectorAll('#schichtenGrid .drag-item').forEach(item => {
    setupDragItem(item);
  });

  ['fruehName', 'spatName', 'taetiName', 'nachtName', 'extraName'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', berechnen);
      element.addEventListener('blur', berechnen);
    }
  });

  ['maFrueh', 'maSpat', 'maTaeti', 'maNacht', 'maExtra'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', berechnen);
    }
  });
});
