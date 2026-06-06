function getUserFavouritesKey() {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
        return 'favouriteEvents'; 
    }

    try {
        const user = JSON.parse(userSession);
        return `favouriteEvents_user_${user.id}`; 
    } catch (error) {
        return 'favouriteEvents';
    }
}

async function loadFavouritesFromServer() {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return;

    try {
        const user = JSON.parse(userSession);
        console.log(`📥 Loading favourites for user ${user.id} from server...`);

        const response = await fetch(`/api/user/favourites?userId=${user.id}`);
        const result = await response.json();

        if (response.ok && result.success) {
            const userKey = getUserFavouritesKey();
            localStorage.setItem(userKey, JSON.stringify(result.favourites));
            console.log(`✅ Favourites loaded from server for user ${user.id}:`, result.favourites);
        }
    } catch (error) {
        console.error('❌ Error loading favourites from server:', error);
    }
}

function createFavouriteItem(event) {
    const imagePath = event.image_path ? `/images/${event.image_path}` : '/images/banner1.jpg';
    const price = parseFloat(event.price) === 0 ? 'Free' : `$${event.price}`;
    const priceClass = parseFloat(event.price) === 0 ? 'free' : '';

    return `
        <div class="favourite-item" data-event-id="${event.event_id}">
            <img src="${imagePath}" alt="${event.title}" class="item-image" onerror="this.src='/images/banner1.jpg'">
            <div class="item-details">
                <div class="item-title">${event.title}</div>
                <div class="item-location">${event.location}, ${event.city}</div>
                <div class="item-date">${event.formatted_date} • ${event.formatted_time}</div>
                <div class="item-price ${priceClass}">Price: ${price}</div>
                <div class="item-type">${event.type}</div>
            </div>
            <button class="remove-item-btn" onclick="removeFavourite('${event.event_id}')" title="Remove from favourites">
                ×
            </button>
        </div>
    `;
}

async function loadFavourites() {

    const favouritesContainer = document.getElementById('favourites-items');
    const emptyContainer = document.getElementById('emptyFavourites');

    if (!favouritesContainer) {
        console.error('❌ Favourites container not found!');
        return;
    }

    favouritesContainer.innerHTML = '<div class="loading">Loading favourite events...</div>';
    favouritesContainer.style.display = 'flex';
    emptyContainer.style.display = 'none';

    try {
        const userKey = getUserFavouritesKey();
        let favouriteIds = JSON.parse(localStorage.getItem(userKey) || '[]');

        if (favouriteIds.length === 0) {
            favouritesContainer.style.display = 'none';
            emptyContainer.style.display = 'block';
            return;
        }

        const favouriteEvents = [];

        for (const eventId of favouriteIds) {
            try {
                const response = await fetch(`/api/events/${eventId}`);

                if (response.ok) {
                    const eventData = await response.json();
                    favouriteEvents.push(eventData);
                } else {
                    favouriteIds = favouriteIds.filter(id => id !== eventId);
                    console.log(`❌ Event ${eventId} not found, removing from favourites`);
                }
            } catch (error) {
                console.error(`❌ Error loading event ${eventId}:`, error);
                favouriteIds = favouriteIds.filter(id => id !== eventId);
            }
        }

        localStorage.setItem(userKey, JSON.stringify(favouriteIds));

        if (favouriteEvents.length === 0) {
            favouritesContainer.style.display = 'none';
            emptyContainer.style.display = 'block';
            return;
        }

        const favouritesHTML = favouriteEvents.map(event => createFavouriteItem(event)).join('');
        favouritesContainer.innerHTML = favouritesHTML;

        const favouriteItems = document.querySelectorAll('.favourite-item');
        favouriteItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-item-btn')) {
                    return;
                }

                const eventId = item.dataset.eventId;
                window.location.href = `/event-details.html?id=${eventId}`;
            });
        });

    } catch (error) {

        favouritesContainer.innerHTML = `
            <div class="error-message">
                <h3>❌ Could not load favourite events</h3>
                <p>Error: ${error.message}</p>
                <button onclick="loadFavourites()">
                    🔄 Try Again
                </button>
            </div>
        `;
    }
}

async function removeFavourite(eventId) {

    const userSession = localStorage.getItem('userSession');
    const userKey = getUserFavouritesKey();

    let favourites = JSON.parse(localStorage.getItem(userKey) || '[]');
    favourites = favourites.filter(id => id !== String(eventId));
    localStorage.setItem(userKey, JSON.stringify(favourites));

    if (userSession) {
        try {
            const user = JSON.parse(userSession);

            const response = await fetch('/api/user/favourites', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    eventId: eventId
                })
            });

            if (response.ok) {
                console.log(`✅ Removed from server for user ${user.id}`);
            }
        } catch (error) {
            console.error('❌ Error removing from server:', error);
        }
    }

    loadFavourites();

    showNotification('Removed from favourites!', 'success');
}

function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            const items = document.querySelectorAll('.favourite-item');

            let visibleCount = 0;

            items.forEach(item => {
                const title = item.querySelector('.item-title')?.textContent.toLowerCase() || '';
                const location = item.querySelector('.item-location')?.textContent.toLowerCase() || '';
                const type = item.querySelector('.item-type')?.textContent.toLowerCase() || '';

                if (!searchTerm ||
                    title.includes(searchTerm) ||
                    location.includes(searchTerm) ||
                    type.includes(searchTerm)) {
                    item.style.display = 'flex';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            const emptyFavourites = document.getElementById('emptyFavourites');
            const favouritesContainer = document.getElementById('favourites-items');

            if (searchTerm && visibleCount === 0 && items.length > 0) {
                favouritesContainer.style.display = 'none';
                emptyFavourites.innerHTML = `
                    <h3>No results found</h3>
                    <p>No favourites match "${searchTerm}"</p>
                    <button class="browse-events-btn" onclick="clearSearch()">Clear Search</button>
                `;
                emptyFavourites.style.display = 'block';
            } else if (!searchTerm && items.length === 0) {
                emptyFavourites.innerHTML = `
                    <h3>No favourites yet</h3>
                    <p>Start exploring events and add them to your favourites!</p>
                    <button class="browse-events-btn" onclick="window.location.href='/'">Browse Events</button>
                `;
                emptyFavourites.style.display = 'block';
            } else {
                emptyFavourites.style.display = 'none';
                if (items.length > 0) {
                    favouritesContainer.style.display = 'flex';
                }
            }
        });
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
    }
}

window.addToFavourites = async function (eventId) {
    console.log(`❤️ Adding to favourites: ${eventId}`);

    const userSession = localStorage.getItem('userSession');
    const userKey = getUserFavouritesKey();
    let favourites = JSON.parse(localStorage.getItem(userKey) || '[]');

    if (!favourites.includes(String(eventId))) {
        favourites.push(String(eventId));
        localStorage.setItem(userKey, JSON.stringify(favourites));

        if (userSession) {
            try {
                const user = JSON.parse(userSession);

                const response = await fetch('/api/user/favourites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        eventId: eventId
                    })
                });

                if (response.ok) {
                }
            } catch (error) {
            }
        }

        showNotification('Added to favourites!', 'success');
        return true;
    } else {
        showNotification('Already in favourites!', 'error');
        return false;
    }
};

window.isFavourite = function (eventId) {
    const userKey = getUserFavouritesKey();
    const favourites = JSON.parse(localStorage.getItem(userKey) || '[]');
    return favourites.includes(String(eventId));
};

window.getFavouritesCount = function () {
    const userKey = getUserFavouritesKey();
    const favourites = JSON.parse(localStorage.getItem(userKey) || '[]');
    return favourites.length;
};

window.toggleFavourite = function (eventId) {
    if (window.isFavourite(eventId)) {
        removeFavourite(eventId);
        return false;
    } else {
        return window.addToFavourites(eventId);
    }
};

document.addEventListener('DOMContentLoaded', async function () {
    console.log('🎯 DOM loaded, initializing favourites page');

    if (localStorage.getItem('userSession')) {
        await loadFavouritesFromServer();
    }

    loadFavourites();

    setupSearch();
});