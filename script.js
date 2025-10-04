  let draggedElement = null;
  let currentViewDate = new Date();
  let timeSlots = JSON.parse(localStorage.getItem('timeSlots')) || [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('darkModeIcon');
    const text = document.getElementById('darkModeText');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
      icon.textContent = '☀️';
      text.textContent = 'Hellmodus';
      localStorage.setItem('darkMode', 'enabled');
    } else {
      icon.textContent = '🌙';
      text.textContent = 'Dunkelmodus';
      localStorage.setItem('darkMode', 'disabled');
    }
  }

  function initDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    const icon = document.getElementById('darkModeIcon');
    const text = document.getElementById('darkModeText');

    if (darkMode === 'enabled') {
      document.body.classList.add('dark-mode');
      icon.textContent = '☀️';
      text.textContent = 'Hellmodus';
    }
  }

  function toggleDevMode() {
    const body = document.body;
    const button = document.querySelector('.dev-mode-toggle');

    body.classList.toggle('dev-mode');

    if (body.classList.contains('dev-mode')) {
      button.classList.add('active');
      localStorage.setItem('devMode', 'enabled');
    } else {
      button.classList.remove('active');
      localStorage.setItem('devMode', 'disabled');
    }

    updateWochenplan();
  }

  function initDevMode() {
    const devMode = localStorage.getItem('devMode');
    const button = document.querySelector('.dev-mode-toggle');

    if (devMode === 'enabled') {
      document.body.classList.add('dev-mode');
      button.classList.add('active');
    }
  }

  function saveTimeSlots() {
    localStorage.setItem('timeSlots', JSON.stringify(timeSlots));
  }

  function formatTime(hour) {
    const h = Math.floor(hour);
    const m = Math.round((hour % 1) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function addColumn(afterIndex) {
    const currentTime = timeSlots[afterIndex];
    const nextTime = timeSlots[afterIndex + 1];

    let newTime;
    if (nextTime && nextTime === currentTime + 1) {
      newTime = currentTime + 0.5;
    } else if (nextTime) {
      newTime = currentTime + 0.5;
    } else {
      newTime = currentTime + 1;
    }

    timeSlots.splice(afterIndex + 1, 0, newTime);
    saveTimeSlots();
    updateWochenplan();
  }

  function deleteColumn(index) {
    if (timeSlots.length <= 2) {
      alert('Sie müssen mindestens 2 Zeitslots behalten!');
      return;
    }

    if (confirm(`Möchten Sie die Spalte ${formatTime(timeSlots[index])} wirklich löschen?`)) {
      timeSlots.splice(index, 1);
      saveTimeSlots();
      updateWochenplan();
    }
  }

  function initDragAndDrop(tableId) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');

    tbody.addEventListener('dragstart', function(e) {
      if (e.target.tagName === 'TR' || e.target.closest('tr')) {
        draggedElement = e.target.tagName === 'TR' ? e.target : e.target.closest('tr');
        draggedElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      }
    });

    tbody.addEventListener('dragend', function(e) {
      if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
      }
      tbody.querySelectorAll('tr').forEach(row => {
        row.classList.remove('drag-over');
      });
    });

    tbody.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const afterElement = getDragAfterElement(tbody, e.clientY);
      const dragOverElement = afterElement ? afterElement : tbody.lastElementChild;

      tbody.querySelectorAll('tr').forEach(row => {
        row.classList.remove('drag-over');
      });

      if (dragOverElement && dragOverElement !== draggedElement) {
        dragOverElement.classList.add('drag-over');
      }
    });

    tbody.addEventListener('drop', function(e) {
      e.preventDefault();

      if (!draggedElement) return;

      const afterElement = getDragAfterElement(tbody, e.clientY);

      if (afterElement == null) {
        tbody.appendChild(draggedElement);
      } else {
        tbody.insertBefore(draggedElement, afterElement);
      }

      tbody.querySelectorAll('tr').forEach(row => {
        row.classList.remove('drag-over');
      });

      berechnen();
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('tr:not(.dragging)')];

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
    const poolRows = document.querySelectorAll('#poolsTable tbody tr');
    poolRows.forEach(row => {
      const pool = parseFloat(row.dataset.pool);
      const dauer = parseFloat(row.dataset.dauer);
      const proStunde = parseFloat(row.dataset.prostunde);

      if (pool && dauer && proStunde) {
        const bedarf = Math.round((pool / (dauer * proStunde)) * 100) / 100;
        const bedarfCell = row.querySelector('.bedarf');
        if (bedarfCell) {
          bedarfCell.textContent = bedarf % 1 === 0 ? bedarf : bedarf;
        }
      }
    });

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
    updateWochenplan();
  }

  function goToToday() {
    const today = new Date();
    currentViewDate.setFullYear(today.getFullYear());
    currentViewDate.setMonth(today.getMonth());
    currentViewDate.setDate(today.getDate());
    updateDateDisplay();
    updateWochenplan();
  }

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function parseTimeString(timeStr) {
    const parts = timeStr.trim().split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return hours + (minutes / 60);
      }
    }
    return null;
  }

  function updateWochenplan() {
    const monday = getMonday(currentViewDate);
    const thead = document.querySelector('#wochenplanTable thead tr');
    const tbody = document.getElementById('wochenplanBody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    timeSlots.forEach((time, index) => {
      const th = document.createElement('th');
      th.className = 'time-header';
      
      if (document.body.classList.contains('dev-mode')) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'time-edit-input';
        input.value = formatTime(time);
        input.placeholder = 'HH:MM';
        input.maxLength = 5;
        
        input.addEventListener('change', function() {
          const newTime = parseTimeString(this.value);
          
          if (newTime !== null) {
            timeSlots[index] = newTime;
            saveTimeSlots();
            updateWochenplan();
          } else {
            alert('Ungültige Zeit! Format: HH:MM (z.B. 06:00 oder 14:30)');
            this.value = formatTime(time);
          }
        });
        
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
          }
        });
        
        th.appendChild(input);
      } else {
        th.textContent = formatTime(time);
      }
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-column-btn';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = () => deleteColumn(index);
      th.appendChild(deleteBtn);

      if (index < timeSlots.length - 1) {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-column-btn';
        addBtn.textContent = '+';
        addBtn.onclick = () => addColumn(index);
        th.appendChild(addBtn);
      }

      thead.appendChild(th);
    });

    const daysOfWeek = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const row = document.createElement('tr');

      timeSlots.forEach(() => {
        const cell = document.createElement('td');
        cell.innerHTML = '<div class="cell-content"></div>';
        setupCellDropZone(cell);
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    }

    loadWochenplanData();
    populatePoolsGrid();
  }

  function populatePoolsGrid() {
    const poolsGrid = document.getElementById('poolsGrid');
    poolsGrid.innerHTML = '';

    const poolRows = document.querySelectorAll('#poolsTable tbody tr');
    poolRows.forEach(row => {
      const poolBadge = row.querySelector('.pool-badge:nth-of-type(2)');
      const poolName = row.querySelector('td:first-child');

      if (poolBadge && poolName) {
        const poolNumber = poolBadge.textContent.trim();
        const fullText = poolName.textContent.replace(/⋮⋮/g, '').trim();
        const parts = fullText.split('\n').filter(p => p.trim());
        const poolLabel = parts.length > 1 ? parts[1].trim() : fullText.split(poolNumber)[1]?.trim() || poolNumber;

        const dragItem = document.createElement('div');
        dragItem.className = 'drag-item pool-item';
        dragItem.draggable = true;
        dragItem.setAttribute('data-type', 'pool');
        dragItem.setAttribute('data-value', poolLabel);
        dragItem.textContent = poolLabel;

        setupDragItem(dragItem);
        poolsGrid.appendChild(dragItem);
      }
    });
  }

  function setupDragItem(item) {
    item.addEventListener('dragstart', function(e) {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', item.getAttribute('data-value'));
      e.dataTransfer.setData('item-type', item.getAttribute('data-type'));
      e.dataTransfer.setData('item-color', item.style.background || '#f39c12');
    });
  }

  function setupCellDropZone(cell) {
    cell.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      cell.classList.add('drop-target');
    });

    cell.addEventListener('dragleave', function(e) {
      cell.classList.remove('drop-target');
    });

    cell.addEventListener('drop', function(e) {
      e.preventDefault();
      cell.classList.remove('drop-target');

      const value = e.dataTransfer.getData('text/plain');
      const type = e.dataTransfer.getData('item-type');
      const color = e.dataTransfer.getData('item-color');

      if (value) {
        const cellContent = cell.querySelector('.cell-content');
        const badge = document.createElement('div');
        badge.className = 'item-badge';
        badge.textContent = value;
        badge.style.background = color;

        badge.addEventListener('click', function() {
          badge.remove();
          saveWochenplanData();
        });

        cellContent.appendChild(badge);
        saveWochenplanData();
      }
    });
  }

  function getWeekKey() {
    const monday = getMonday(currentViewDate);
    return `week_${monday.getFullYear()}_${monday.getMonth()}_${monday.getDate()}`;
  }

  function saveWochenplanData() {
    const weekKey = getWeekKey();
    const tbody = document.getElementById('wochenplanBody');
    const rows = tbody.querySelectorAll('tr');
    const data = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const rowData = [];

      cells.forEach(cell => {
        const cellContent = cell.querySelector('.cell-content');
        if (cellContent) {
          const badges = cellContent.querySelectorAll('.item-badge');
          const cellItems = Array.from(badges).map(badge => ({
            text: badge.textContent,
            color: badge.style.background
          }));
          rowData.push(cellItems);
        }
      });

      data.push(rowData);
    });

    localStorage.setItem(weekKey, JSON.stringify(data));
  }

  function loadWochenplanData() {
    const weekKey = getWeekKey();
    const savedData = localStorage.getItem(weekKey);

    if (savedData) {
      const data = JSON.parse(savedData);
      const tbody = document.getElementById('wochenplanBody');
      const rows = tbody.querySelectorAll('tr');

      rows.forEach((row, rowIndex) => {
        if (data[rowIndex]) {
          const cells = row.querySelectorAll('td');
          cells.forEach((cell, cellIndex) => {
            if (data[rowIndex][cellIndex]) {
              const cellContent = cell.querySelector('.cell-content');
              if (cellContent) {
                data[rowIndex][cellIndex].forEach(item => {
                  const badge = document.createElement('div');
                  badge.className = 'item-badge';
                  badge.textContent = item.text;
                  badge.style.background = item.color;

                  badge.addEventListener('click', function() {
                    badge.remove();
                    saveWochenplanData();
                  });

                  cellContent.appendChild(badge);
                });
              }
            }
          });
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    initDragAndDrop('einsatzplanTable');
    initDragAndDrop('poolsTable');

    berechnen();
    startClock();
    updateDateDisplay();
    updateWochenplan();
    initDarkMode();
    initDevMode();

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
