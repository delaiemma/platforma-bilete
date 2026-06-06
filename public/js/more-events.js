let allEvents = [];
let filteredEvents = [];

document.addEventListener('DOMContentLoaded', function () {
    loadAllEvents();
    setupFilters();
    setupNavigation();
});

async function loadAllEvents() {
    try {
        const response = await fetch('/api/all-events');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allEvents = await response.json();
        console.log('✅ Events loaded from API:', allEvents.length);

        allEvents = allEvents.map(event => ({
            ...event,
            formatted_date: formatDate(event.date),
            formatted_time: formatTime(event.time)
        }));

        filteredEvents = [...allEvents];
        displayEvents(filteredEvents);

    } catch (error) {
        console.error('❌ API Error:', error);
        document.getElementById('allEventsGrid').innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1; border: 2px solid red;">
                <h3 style="color: red;">Cannot load events</h3>
                <p>Error: ${error.message}</p>
                <p>Make sure your backend server is running on port 3000</p>
            </div>
        `;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    if (!timeString) return '';

    if (timeString.includes(':') && !timeString.includes('T')) {
        return timeString.substring(0, 5);
    }

    const date = new Date(timeString);
    return date.toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function displayEvents(events) {
    const eventsGrid = document.getElementById('allEventsGrid');

    if (events.length === 0) {
        eventsGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <h3>Nu s-au găsit evenimente</h3>
                <p>Încearcă să modifici filtrele.</p>
            </div>
        `;
        return;
    }

    eventsGrid.innerHTML = events.map(event => createEventCard(event)).join('');

    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            const eventId = card.dataset.eventId;
            window.location.href = `/event-details.html?id=${eventId}`;
        });
    });
}

function createEventCard(event) {
    const imagePath = event.image_path ? `/images/${event.image_path}` : '/images/banner1.jpg';
    const price = parseFloat(event.price) === 0 ? 'Free' : `$${event.price}`;
    const priceClass = parseFloat(event.price) === 0 ? 'free' : '';

    return `
        <div class="event-card" data-event-id="${event.event_id}">
            <img src="${imagePath}" alt="${event.title}" class="event-image">
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-date">${event.formatted_date} • ${event.formatted_time}</div>
                <div class="event-location">${event.location}, ${event.city}</div>
                <div class="event-price ${priceClass}">${price}</div>
                <span class="event-type">${event.type}</span>
            </div>
        </div>
    `;
}

function setupFilters() {
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const minPriceValue = document.getElementById('minPriceValue');
    const maxPriceValue = document.getElementById('maxPriceValue');

    minPrice.addEventListener('input', function () {
        minPriceValue.textContent = this.value;
        applyFilters();
    });

    maxPrice.addEventListener('input', function () {
        maxPriceValue.textContent = this.value;
        applyFilters();
    });

    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    document.getElementById('dateFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);
}

function applyFilters() {

    const minPrice = parseInt(document.getElementById('minPrice').value);
    const maxPrice = parseInt(document.getElementById('maxPrice').value);
    const selectedDate = document.getElementById('dateFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    const typeMapping = {
        'concert': 'Concert',
        'conference': 'Seminar',
        'festival': 'Event',
        'teatru': 'Theater',
        'comedy': 'Cinema',
        'sport': 'Exhibition'
    };

    const checkedCategories = [];
    Object.entries(typeMapping).forEach(([checkboxValue, dbType]) => {
        if (document.querySelector(`input[value="${checkboxValue}"]:checked`)) {
            checkedCategories.push(dbType);
        }
    });

    const locationMapping = {
        'bucuresti': ['bran castle'],
        'cluj': ['plavia romania'],
        'timisoara': ['madrid'],
        'iasi': ['new york'],
        'constanta': ['jakarta', 'cannes']
    };

    const checkedLocations = [];
    Object.entries(locationMapping).forEach(([checkboxValue, cities]) => {
        if (document.querySelector(`input[value="${checkboxValue}"]:checked`)) {
            checkedLocations.push(...cities);
        }
    });

    filteredEvents = allEvents.filter(event => {
        const eventPrice = parseFloat(event.price);
        if (eventPrice < minPrice || eventPrice > maxPrice) {
            return false;
        }

        if (checkedCategories.length > 0 && !checkedCategories.includes(event.type)) {
            return false;
        }

        if (checkedLocations.length > 0) {
            const cityLower = event.city.toLowerCase();
            const locationMatch = checkedLocations.some(loc =>
                cityLower.includes(loc.toLowerCase())
            );
            if (!locationMatch) {
                return false;
            }
        }

        if (selectedDate) {
            console.log(`📅 Checking date for: ${event.title}`);
            console.log(`   Raw event date: "${event.date}"`);

            let eventDateOnly;
            if (typeof event.date === 'string' && event.date.includes('T')) {
                eventDateOnly = event.date.split('T')[0];
            } else if (typeof event.date === 'string') {
                eventDateOnly = event.date;
            } else {
                eventDateOnly = new Date(event.date).toISOString().split('T')[0];
            }

            if (eventDateOnly !== selectedDate) {
                return false;
            }
        }

        if (searchTerm) {
            const title = event.title.toLowerCase();
            const location = event.location.toLowerCase();
            const city = event.city.toLowerCase();
            if (!title.includes(searchTerm) && !location.includes(searchTerm) && !city.includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    if (selectedDate && filteredEvents.length > 0) {
    }

    displayEvents(filteredEvents);
}

function clearAllFilters() {
    document.getElementById('minPrice').value = 0;
    document.getElementById('maxPrice').value = 1000;
    document.getElementById('minPriceValue').textContent = '0';
    document.getElementById('maxPriceValue').textContent = '1000';
    document.getElementById('dateFilter').value = '';
    document.getElementById('searchInput').value = '';

    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });

    filteredEvents = [...allEvents];
    displayEvents(filteredEvents);
}

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const btnText = this.textContent.trim();

            switch (btnText) {
                case 'About us':
                    window.location.href = '/about.html';
                    break;
                case 'Contact':
                    window.location.href = '/contact.html';
                    break;
                case 'Favourites':
                    window.location.href = '/favourites.html';
                    break;
                case 'Cart':
                    window.location.href = '/cart.html';
                    break;
                case 'Sign in':
                    window.location.href = '/login.html';
                    break;
            }
        });
    });
}