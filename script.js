// --- Variables Globales ---
const calendarDiv = document.getElementById('calendar');
let selectedDate = new Date(); // La fecha seleccionada por defecto es la actual
let reservations = loadReservations(); // Cargar reservas al inicio

// Referencias a las secciones de la UI
const calendarSection = document.getElementById('calendar-section');
const roomsSection = document.getElementById('rooms-section');
const myReservationsSection = document.getElementById('my-reservations-section');

// Referencias a los botones principales
const showRoomsButton = document.getElementById('showRoomsButton');
const showMyReservationsButton = document.getElementById('showMyReservationsButton');
const goBackButton = document.getElementById('goBackButton'); // Botón para volver desde Rooms
const backToCalendarFromMyReservations = document.getElementById('backToCalendarFromMyReservations'); // Botón para volver desde My Reservations

// Referencias para el contenedor de mensajes
const messageContainer = document.getElementById('messageContainer');
const messageText = document.getElementById('messageText');

// --- Datos de Salas ---
const rooms = [
    { id: 'sala1', name: 'Sala de Juntas Principal (Cap. 10)', capacity: 10 },
    { id: 'sala2', name: 'Sala de Reuniones Pequeña (Cap. 4)', capacity: 4 },
    { id: 'sala3', name: 'Auditorio (Cap. 50)', capacity: 50 },
    { id: 'sala4', name: 'Sala de Proyectos (Cap. 6)', capacity: 6 }
];

// --- Funciones de Utilidad ---

/**
 * Muestra un mensaje temporal en la interfaz de usuario.
 * @param {string} message - El texto del mensaje.
 * @param {string} type - Tipo de mensaje ('success' o 'error').
 */
function showMessage(message, type = 'success') {
    messageText.textContent = message;
    messageContainer.style.display = 'block';
    messageContainer.style.opacity = 1;

    if (type === 'success') {
        messageContainer.style.backgroundColor = '#4CAF50'; // Verde
    } else if (type === 'error') {
        messageContainer.style.backgroundColor = '#f44336'; // Rojo
    }

    // Ocultar el mensaje después de un tiempo
    setTimeout(() => {
        messageContainer.style.opacity = 0;
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 500); // Duración de la transición CSS
    }, 3000); // Muestra el mensaje por 3 segundos
}

/**
 * Carga las reservas desde localStorage.
 * @returns {Array} Un array de objetos de reserva.
 */
function loadReservations() {
    const storedReservations = localStorage.getItem('reservations');
    console.log('DEBUG (script.js): Cargando reservas. Encontrado:', storedReservations ? JSON.parse(storedReservations) : 'ninguna');
    return storedReservations ? JSON.parse(storedReservations) : [];
}

/**
 * Obtiene las reservas actuales (desde la variable global).
 * @returns {Array} Un array de objetos de reserva.
 */
function getReservations() {
    return reservations;
}

/**
 * Guarda las reservas en localStorage.
 * @param {Array} currentReservations - El array de reservas a guardar.
 */
function saveReservations(currentReservations) {
    console.log('DEBUG (script.js): Guardando reservas en localStorage:', currentReservations);
    localStorage.setItem('reservations', JSON.stringify(currentReservations));
    reservations = currentReservations; // Actualiza la variable global también
    console.log('DEBUG (script.js): localStorage actualizado. Valor actual:', localStorage.getItem('reservations'));
}

/**
 * Muestra la sección de la UI especificada y oculta las demás.
 * @param {HTMLElement} sectionToShow - La sección que se debe mostrar.
 */
function showSection(sectionToShow) {
    // Estas variables globales deben estar definidas y no ser null
    // Esto fue depurado en pasos anteriores, pero es clave que estos selectores funcionen.
    if (!calendarSection || !roomsSection || !myReservationsSection) {
        console.error("FATAL ERROR (script.js): No se encontraron todos los elementos de la sección al inicio.");
        return; // Detiene la ejecución para evitar TypeErrors
    }

    calendarSection.style.display = 'none';
    roomsSection.style.display = 'none';
    myReservationsSection.style.display = 'none';
    sectionToShow.style.display = 'block';
    console.log(`DEBUG (script.js): Mostrando sección: ${sectionToShow.id}`);
}

// --- Funciones de Renderizado ---

/**
 * Renderiza el calendario en la interfaz de usuario.
 */
function renderCalendar() {
    if (!calendarDiv) {
        console.error("FATAL ERROR (script.js): Elemento 'calendar' no encontrado.");
        return;
    }
    calendarDiv.innerHTML = '';
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const monthYearHeader = document.createElement('div');
    monthYearHeader.classList.add('month-year-header');
    monthYearHeader.innerHTML = `
        <button id="prevMonth" class="nav-button">&lt;</button>
        <span>${monthNames[currentMonth]} ${currentYear}</span>
        <button id="nextMonth" class="nav-button">&gt;</button>
    `;
    calendarDiv.appendChild(monthYearHeader); 

    const daysGrid = document.createElement('div');
    daysGrid.classList.add('days-grid');

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayNames.forEach(dayName => {
        const dayNameElement = document.createElement('div');
        dayNameElement.classList.add('day-name');
        dayNameElement.textContent = dayName;
        daysGrid.appendChild(dayNameElement);
    });

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('day', 'empty');
        daysGrid.appendChild(emptyDay);
    }

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.textContent = day;
        dayElement.dataset.date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth &&
            selectedDate.getFullYear() === currentYear) {
            dayElement.classList.add('selected');
        }

        if (today.getDate() === day &&
            today.getMonth() === currentMonth &&
            today.getFullYear() === currentYear) {
            dayElement.classList.add('today');
        }

        dayElement.addEventListener('click', () => {
            const previouslySelected = calendarDiv.querySelector('.day.selected');
            if (previouslySelected) {
                previouslySelected.classList.remove('selected');
            }
            dayElement.classList.add('selected');
            selectedDate = new Date(currentYear, currentMonth, day); 
            console.log('DEBUG (script.js): Fecha seleccionada:', dayElement.dataset.date);
        });
        daysGrid.appendChild(dayElement); 
    }

    calendarDiv.appendChild(daysGrid); 

    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');

    if (prevMonthButton) {
        prevMonthButton.onclick = null; 
        prevMonthButton.addEventListener('click', () => {
            selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, selectedDate.getDate());
            renderCalendar();
        });
    }
    if (nextMonthButton) {
        nextMonthButton.onclick = null; 
        nextMonthButton.addEventListener('click', () => {
            selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate());
            renderCalendar();
        });
    }
}

/**
 * Renderiza las salas disponibles para la fecha seleccionada.
 * @param {Date} date - La fecha para la cual se buscan salas.
 */
function renderRooms(date) {
    const roomsList = document.getElementById('roomsList'); 
    
    if (!roomsList) {
        console.error("FATAL ERROR (script.js): Elemento con ID 'roomsList' no encontrado. No se pueden renderizar las salas.");
        return; 
    }

    roomsList.innerHTML = ''; 
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    rooms.forEach(room => {
        const roomItem = document.createElement('div');
        roomItem.classList.add('room-item');
        roomItem.innerHTML = `
            <span>${room.name}</span>
            <button data-room-id="${room.id}">RESERVAR</button>
        `;

        const reserveButton = roomItem.querySelector('button');
        const isReserved = getReservations().some(res => res.date === formattedDate && res.roomId === room.id);

        if (isReserved) {
            reserveButton.textContent = 'OCUPADA';
            reserveButton.disabled = true;
            reserveButton.classList.add('disabled');
        } else {
            reserveButton.addEventListener('click', () => {
                handleReservation(formattedDate, room.id);
            });
        }
        roomsList.appendChild(roomItem);
    });
    showSection(roomsSection); 
}

/**
 * Renderiza la lista de mis reservas.
 */
function renderMyReservations() {
    const myReservationsList = document.getElementById('myReservationsList');
    
    if (!myReservationsList) {
        console.error("FATAL ERROR (script.js): Elemento con ID 'myReservationsList' no encontrado. No se pueden renderizar las reservas.");
        return; 
    }

    myReservationsList.innerHTML = ''; 

    const currentReservations = getReservations();
    if (currentReservations.length === 0) {
        myReservationsList.innerHTML = '<p>No tienes reservas.</p>';
        showSection(myReservationsSection);
        return;
    }

    currentReservations.forEach(res => {
        const roomInfo = rooms.find(room => room.id === res.roomId);
        const reservationItem = document.createElement('div');
        reservationItem.classList.add('my-reservation-item');
        reservationItem.innerHTML = `
            <span>${roomInfo ? roomInfo.name : 'Sala Desconocida'} - ${res.date}</span>
            <button data-reservation-id="${res.id}">Cancelar</button>
        `;
        const cancelButton = reservationItem.querySelector('button');
        cancelButton.addEventListener('click', () => {
            handleCancelReservation(res.id);
        });
        myReservationsList.appendChild(reservationItem);
    });
    showSection(myReservationsSection); 
}

// --- Lógica de Manejo de Reservas ---

/**
 * Maneja la lógica de reservar una sala.
 * @param {string} date - La fecha de la reserva (YYYY-MM-DD).
 * @param {string} roomId - El ID de la sala.
 */
function handleReservation(date, roomId) {
    const roomToReserve = rooms.find(room => room.id === roomId);
    if (!roomToReserve) {
        console.error(`DEBUG (script.js): Sala con ID ${roomId} no encontrada.`);
        showMessage('Error: Sala no encontrada.', 'error');
        return;
    }

    const existingReservation = getReservations().some(res => res.date === date && res.roomId === roomId);

    if (existingReservation) {
        showMessage(`¡Uy! La ${roomToReserve.name} ya está reservada para el ${date}.`, 'error');
        console.log('DEBUG (script.js): Intento de reserva duplicada detectado.');
    } else {
        const newReservation = {
            id: Date.now().toString(), // ID único para la reserva
            date: date,
            roomId: roomId,
            roomName: roomToReserve.name // Guardar el nombre completo de la sala
        };
        const updatedReservations = [...getReservations(), newReservation];
        console.log('DEBUG (script.js): Nueva reserva a guardar:', newReservation);
        saveReservations(updatedReservations);
        showMessage(`¡Genial! Has reservado la ${roomToReserve.name} para el ${date}. 🎉`, 'success');
        console.log('DEBUG (script.js): Reservas actuales después de reservar:', getReservations());
        renderRooms(new Date(date)); 
    }
}

/**
 * Maneja la lógica de cancelar una reserva.
 * @param {string} reservationId - El ID único de la reserva a cancelar.
 */
function handleCancelReservation(reservationId) {
    let allReservations = getReservations();
    const initialLength = allReservations.length;
    allReservations = allReservations.filter(res => res.id !== reservationId);

    if (allReservations.length < initialLength) {
        saveReservations(allReservations);
        showMessage('¡Reserva cancelada con éxito! ✅', 'success');
        renderMyReservations();
        console.log('DEBUG (script.js): Reserva cancelada. Reservas restantes:', getReservations());
    } else {
        showMessage('¡Oops! No se pudo encontrar la reserva para cancelar.', 'error');
        console.log('DEBUG (script.js): Fallo al cancelar. Reserva no encontrada con ID:', reservationId);
    }
}

// --- Event Listeners Globales ---
// ... (Estos listeners no han cambiado, son correctos)
showRoomsButton.addEventListener('click', () => {
    if (!selectedDate) {
        showMessage('Por favor, selecciona una fecha en el calendario primero.', 'error');
        return;
    }
    renderRooms(selectedDate);
});

showMyReservationsButton.addEventListener('click', () => {
    renderMyReservations();
});

goBackButton.addEventListener('click', () => {
    showSection(calendarSection);
    renderCalendar();
});

backToCalendarFromMyReservations.addEventListener('click', () => {
    showSection(calendarSection);
    renderCalendar();
});


// --- Pruebas de Unidad (Lógica) ---
function runUnitTests() {
    console.log("--- Ejecutando Pruebas Unitarias (In-browser) ---");

    saveReservations([]); // Limpia todas las reservas para iniciar las pruebas en un estado limpio

    // Prueba 1 (Reserva Exitosa):
    handleReservation('2025-07-15', 'sala1');
    let currentReservations = getReservations();
    console.assert(currentReservations.some(res => res.date === '2025-07-15' && res.roomId === 'sala1'),
        'Prueba 1 (Reserva Exitosa): Sala se reserva correctamente.');

    // Prueba 2 (Solapamiento): Debería detectar y no añadir la misma reserva
    handleReservation('2025-07-15', 'sala1');
    currentReservations = getReservations();
    console.assert(currentReservations.filter(res => res.date === '2025-07-15' && res.roomId === 'sala1').length === 1,
        'Prueba 2 (Solapamiento): No permite reservar la misma sala dos veces en la misma fecha.');

    // --- Pruebas de Calendario --- (Estas no interactúan con localStorage directamente, son visuales)
    console.log("\n--- Pruebas de Calendario (In-browser) ---");
    let originalSelectedDate = new Date(selectedDate);
    selectedDate = new Date(2025, 6, 12);
    renderCalendar();
    let monthYearHeaderSpan = document.querySelector('.month-year-header span');
    let expectedMonthYear = "Julio 2025";
    console.assert(monthYearHeaderSpan.textContent === expectedMonthYear,
        `Prueba 3 (Mes/Año Inicial): Esperado "${expectedMonthYear}", Obtenido "${monthYearHeaderSpan.textContent}"`);

    simulateClick('nextMonth');
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    let currentMonthName = monthNames[selectedDate.getMonth()];
    let currentYear = selectedDate.getFullYear();
    let expectedNextMonthYear = "Agosto 2025";
    console.assert(`${currentMonthName} ${currentYear}` === expectedNextMonthYear,
        `Prueba 4 (Siguiente Mes - Estado Interno): Esperado "${expectedNextMonthYear}", Obtenido "${currentMonthName} ${currentYear}"`);
    renderCalendar();
    monthYearHeaderSpan = document.querySelector('.month-year-header span');
    console.assert(monthYearHeaderSpan.textContent === expectedNextMonthYear,
        `Prueba 4 (Siguiente Mes - DOM): Esperado "${expectedNextMonthYear}", Obtenido "${monthYearHeaderSpan.textContent}"`);

    simulateClick('prevMonth');
    let prevMonthName = monthNames[selectedDate.getMonth()];
    let prevYear = selectedDate.getFullYear();
    let expectedPrevMonthYear = "Julio 2025";
    console.assert(`${prevMonthName} ${prevYear}` === expectedPrevMonthYear,
        `Prueba 5 (Mes Anterior - Estado Interno): Esperado "${expectedPrevMonthYear}", Obtenido "${prevMonthName} ${prevYear}"`);
    renderCalendar();
    monthYearHeaderSpan = document.querySelector('.month-year-header span');
    console.assert(monthYearHeaderSpan.textContent === expectedPrevMonthYear,
        `Prueba 5 (Mes Anterior - DOM): Esperado "${expectedPrevMonthYear}", Obtenido "${monthYearHeaderSpan.textContent}"`);

    selectedDate = originalSelectedDate;
    renderCalendar();

    // --- Nuevas Pruebas de Navegación de Secciones ---
    console.log("\n--- Pruebas de Navegación (In-browser) ---");

    showSection(calendarSection);

    simulateClick('showRoomsButton');
    console.assert(isSectionVisible(roomsSection), 'Prueba 6 (Ver Salas): Sección de Salas visible');
    console.assert(!isSectionVisible(calendarSection), 'Prueba 6 (Ver Salas): Sección de Calendario oculta');

    simulateClick('goBackButton');
    console.assert(isSectionVisible(calendarSection), 'Prueba 7 (Volver desde Salas): Sección de Calendario visible');
    console.assert(!isSectionVisible(roomsSection), 'Prueba 7 (Volver desde Salas): Sección de Salas oculta');

    simulateClick('showMyReservationsButton');
    console.assert(isSectionVisible(myReservationsSection), 'Prueba 8 (Ver Mis Reservas): Sección de Mis Reservas visible');
    console.assert(!isSectionVisible(calendarSection), 'Prueba 8 (Ver Mis Reservas): Sección de Calendario oculta');
    console.assert(!isSectionVisible(roomsSection), 'Prueba 8 (Ver Mis Reservas): Sección de Salas oculta');

    simulateClick('backToCalendarFromMyReservations');
    console.assert(isSectionVisible(calendarSection), 'Prueba 9 (Volver desde Mis Reservas): Sección de Calendario visible');
    console.assert(!isSectionVisible(myReservationsSection), 'Prueba 9 (Volver desde Mis Reservas): Sección de Mis Reservas oculta');


    console.log("\n--- Todas las Pruebas Unitarias (In-browser) Terminadas ---");
}

// --- Funciones Auxiliares para Pruebas ---
function simulateClick(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.click();
        return true;
    }
    console.error(`ERROR (script.js): Elemento con ID '${elementId}' no encontrado para simular clic.`);
    return false;
}

function isSectionVisible(sectionElement) {
    if (!sectionElement) return false; // Safety check
    return sectionElement.style.display === 'block';
}


// --- Inicialización al Cargar el DOM ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG (script.js): DOMContentLoadet disparado.');
    renderCalendar();
    // Ejecuta las pruebas unitarias en el navegador. Comenta esta línea si no quieres que se ejecuten automáticamente.
    runUnitTests();
});