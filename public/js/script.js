let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    if (slides[index]) slides[index].classList.add('active');
    if (indicators[index]) indicators[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

if (totalSlides > 0) {
    setInterval(nextSlide, 4000);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
}

function isAdmin() {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            return user.role === 'admin';
        } catch (error) {
            console.error('Error parsing user session:', error);
            return false;
        }
    }
    return false;
}

function isLoggedIn() {
    const userSession = localStorage.getItem('userSession');
    return userSession !== null;
}
function toggleAdminControls() {

    const adminElements = document.querySelectorAll('.admin-only');

    if (isLoggedIn() && isAdmin()) {
        console.log('✅ Admin user detected - showing admin controls');
        adminElements.forEach(element => {
            if (element) {
                element.style.display = 'block';
            }
        });
    } else {
        console.log('❌ Non-admin user - hiding admin controls');
        adminElements.forEach(element => {
            if (element) {
                element.style.display = 'none';
            }
        });
    }
    updateSignInButton();
}
function updateSignInButton() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const signInBtn = Array.from(navBtns).find(btn => btn.textContent.trim() === 'Sign in');

    if (signInBtn && isLoggedIn()) {
        const userSession = localStorage.getItem('userSession');
        const user = JSON.parse(userSession);

        signInBtn.textContent = `Sign out`;
        signInBtn.onclick = function (e) {
            e.stopPropagation(); 
            if (confirm('Are you sure you want to sign out?')) {
                localStorage.removeItem('userSession');
                window.location.reload(); 
            }
        };
    } else if (signInBtn && !isLoggedIn()) {
        signInBtn.textContent = 'Sign in';
        signInBtn.onclick = null; 
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
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

function createEventCard(event) {
    const imagePath = event.image_path ? `/images/${event.image_path}` : '/images/banner1.jpg';
    const price = parseFloat(event.price) === 0 ? 'Free' : `$${event.price}`;
    const priceClass = parseFloat(event.price) === 0 ? 'free' : '';
    const formattedDate = formatDate(event.date);
    const formattedTime = formatTime(event.time);

    return `
        <div class="event-card" data-event-id="${event.event_id}">
            <img src="${imagePath}" alt="${event.title}" class="event-image" onerror="this.src='/images/banner1.jpg'">
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-date">${formattedDate} • ${formattedTime}</div>
                <div class="event-location">${event.location}, ${event.city}</div>
                <div class="event-price ${priceClass}">Price: ${price}</div>
                <span class="event-type">${event.type}</span>
            </div>
        </div>
    `;
}

async function loadPastEvents() {
    console.log('📂 Loading past events from API...');

    const pastEventsGrid = document.getElementById('past-events-grid');

    if (!pastEventsGrid) {
        console.error('❌ Past events grid not found in HTML!');
        return;
    }

    pastEventsGrid.innerHTML = '<div class="loading">Loading past events...</div>';

    try {
        console.log('📡 Fetching from /api/events/past...');

        const response = await fetch('/api/events/past');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const events = await response.json();

        if (events.length === 0) {
            pastEventsGrid.innerHTML = '<p class="no-events">No past events.</p>';
            return;
        }

        const eventsHTML = events.map(event => createEventCard(event)).join('');

        pastEventsGrid.innerHTML = eventsHTML;

        const eventCards = pastEventsGrid.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            card.addEventListener('click', () => {
                const eventId = card.dataset.eventId;
                window.location.href = `/event-details.html?id=${eventId}`;
            });
        });

    } catch (error) {
        console.error('❌ Error loading past events:', error);
        pastEventsGrid.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 20px; color: red;">
                <h3>❌ Nu pot încărca evenimentele trecute</h3>
                <p>Eroare: ${error.message}</p>
            </div>
        `;
    }
}

async function loadEventsIntoHTML() {
    console.log('📂 Loading events from API to populate HTML...');

    const eventsGrid = document.getElementById('events-grid');

    if (!eventsGrid) {
        console.error('❌ Events grid not found in HTML!');
        return;
    }

    eventsGrid.innerHTML = '<div class="loading">Loading events...</div>';

    try {
        console.log('📡 Fetching from /api/events/upcoming...');

        const response = await fetch('/api/events/upcoming');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const events = await response.json();

        if (events.length === 0) {
            eventsGrid.innerHTML = '<p class="no-events">Nu sunt evenimente disponibile momentan.</p>';
            return;
        }

        const eventsHTML = events.map(event => createEventCard(event)).join('');

        eventsGrid.innerHTML = eventsHTML;

        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            card.addEventListener('click', () => {
                const eventId = card.dataset.eventId;
                window.location.href = `/event-details.html?id=${eventId}`;
            });
        });

    } catch (error) {
        console.error('❌ Error loading events:', error);

        eventsGrid.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 20px; color: red;">
                <h3>❌ Nu pot încărca evenimentele</h3>
                <p>Eroare: ${error.message}</p>
                <p>Verifică dacă serverul rulează pe localhost:3000</p>
                <button onclick="loadEventsIntoHTML()" style="margin-top: 10px; padding: 8px 16px; border: 1px solid #000; background: white; cursor: pointer;">
                    🔄 Încearcă din nou
                </button>
            </div>
        `;
    }
}

function addNewEvent() {

    if (!isLoggedIn() || !isAdmin()) {
        alert('Only admins can add events. Please log in as admin.');
        window.location.href = '/login.html';
        return;
    }
    window.location.href = '/add-event.html';
}


document.addEventListener('DOMContentLoaded', function () {

    loadEventsIntoHTML();
    loadPastEvents();

    initializeControls();

    setTimeout(initializeControls, 100);

    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    console.log('🔍 Searching for:', searchTerm);

                    const eventCards = document.querySelectorAll('.event-card');
                    let found = false;

                    eventCards.forEach(card => {
                        const title = card.querySelector('.event-title')?.textContent.toLowerCase() || '';
                        const location = card.querySelector('.event-location')?.textContent.toLowerCase() || '';

                        if (title.includes(searchTerm.toLowerCase()) || location.includes(searchTerm.toLowerCase())) {
                            card.style.display = 'block';
                            card.style.border = '2px solid #007bff';
                            found = true;
                        } else {
                            card.style.display = 'none';
                        }
                    });

                    if (!found) {
                        alert(`Nu s-au găsit evenimente pentru: ${searchTerm}`);
                        eventCards.forEach(card => {
                            card.style.display = 'block';
                            card.style.border = '';
                        });
                    }
                }
            }
        });
    }

    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            const btnText = this.textContent.trim();
            console.log(`🖱️ Clicked on: "${btnText}"`);

            if (btnText === 'Sign out') {
                return;
            }

            if (btnText === 'Sign in') {
                window.location.href = '/login.html';
            } else if (btnText === 'About us' || btnText === 'About Us') {
                window.location.href = '/about.html';
            } else if (btnText === 'Contact') {
                window.location.href = '/contact.html';
            } else if (btnText === 'Favourites') {
                window.location.href = '/favourites.html';
            } else if (btnText === 'Cart') {
                window.location.href = '/cart.html';
            }
        });
    });

    const addEventBtn = document.querySelector('.add-event-btn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', addNewEvent);
    }

    const moreEventsBtn = document.querySelector('.more-events-btn');
    if (moreEventsBtn) {
        moreEventsBtn.addEventListener('click', function () {
            console.log('📄 More Events clicked');
            window.location.href = '/more-events.html';
        });
    }
});
function initializeControls() {
    toggleAdminControls();

    updateSignInButton();
}