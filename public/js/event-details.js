function getUserCartKey() {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
        return 'cartEvents'; 
    }

    try {
        const user = JSON.parse(userSession);
        return `cartEvents_user_${user.id}`; 
    } catch (error) {
        return 'cartEvents';
    }
}

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

function clearUserFavourites() {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            const userKey = `favouriteEvents_user_${user.id}`;
            localStorage.removeItem(userKey);
            console.log(`🧹 Cleared favourites for user ${user.id}`);
        } catch (error) {
            console.error('Error clearing user favourites:', error);
        }
    }
}

function canEditEvent(eventUserId) {

    const userSession = localStorage.getItem('userSession');
    console.log('🔍 DEBUG userSession raw:', userSession);

    if (!userSession) {
        console.log('❌ DEBUG: No user session found');
        return false;
    }

    try {
        const user = JSON.parse(userSession);

        if (user.role !== 'admin') {
            console.log('❌ DEBUG: User is not admin, role is:', user.role);
            return false;
        }

        if (eventUserId === undefined || eventUserId === null) {
            console.log('❌ DEBUG: eventUserId is undefined or null');
            return false;
        }

        const userIdStr = String(user.id);
        const eventUserIdStr = String(eventUserId);
        const canEdit = userIdStr === eventUserIdStr;
        console.log('🔍 DEBUG comparison:', `"${userIdStr}" === "${eventUserIdStr}" = ${canEdit}`);

        return canEdit;
    } catch (error) {
        console.log('❌ DEBUG: Error parsing userSession:', error);
        return false;
    }
}

function showAdminControls(eventUserId) {

    if (isLoggedIn() && canEditEvent(eventUserId)) {
        console.log('✅ DEBUG: User can edit this event - showing controls');
        const adminControls = document.getElementById('adminControls');
        console.log('🔍 DEBUG adminControls element:', adminControls);
        if (adminControls) {
            adminControls.style.display = 'flex';
            setupAdminButtons();
        } else {
            console.log('❌ DEBUG: adminControls element not found in DOM');
        }
    } else {
        console.log('❌ DEBUG: User cannot edit this event - hiding controls');
        const adminControls = document.getElementById('adminControls');
        if (adminControls) {
            adminControls.style.display = 'none';
        }
    }
}
function isEventInPast(eventDate, eventTime) {
    const dateOnly = eventDate.split('T')[0];

    const eventDateTimeString = `${dateOnly}T${eventTime}`;
    const eventDateTime = new Date(eventDateTimeString);
    const now = new Date();

    console.log('🕐 Checking if event is in past:');
    console.log('  Original event date:', eventDate);
    console.log('  Date only:', dateOnly);
    console.log('  Event time:', eventTime);
    console.log('  Combined:', eventDateTimeString);
    console.log('  Event DateTime:', eventDateTime);
    console.log('  Now:', now);
    console.log('  Is past?', eventDateTime < now);

    return eventDateTime < now;
}

function populateEventDetails(event) {
    console.log('🔍 DEBUG populateEventDetails called with event:', event);
    console.log('🔍 DEBUG event.user_id:', event.user_id, typeof event.user_id);

    document.title = `${event.title} - Ticket`;

    document.getElementById('eventTitle').textContent = event.title;
    document.getElementById('eventVenue').textContent = event.location;
    document.getElementById('eventAddress').textContent = event.city;
    document.getElementById('eventDateTime').textContent = `${event.formatted_date} • ${event.formatted_time}`;
    document.getElementById('eventPrice').textContent = `Price: $${event.price}`;
    document.getElementById('eventOrganizer').textContent = 'Ticket Events';
    document.getElementById('eventDescriptionText').textContent = event.description || 'No description available for this event.';

    const eventImage = document.getElementById('eventImage');
    if (event.image_path) {
        eventImage.src = `/images/${event.image_path}`;
        eventImage.alt = event.title;
        eventImage.onerror = function () {
            this.src = '/images/banner1.jpg';
        };
    } else {
        eventImage.src = '/images/banner1.jpg';
    }

    const address = `${event.location}, ${event.city}`;
    const encodedAddress = encodeURIComponent(address);

    const mapIframe = document.getElementById('eventMap');
    if (mapIframe) {
        mapIframe.src = `https://maps.google.com/maps?q=${encodedAddress}&output=embed`;
    }

    const directionsLink = document.getElementById('directionsLink');
    if (directionsLink) {
        directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    if (eventId) {
        const isPastEvent = isEventInPast(event.date, event.time);

        if (isPastEvent) {
            const actionButtons = document.querySelector('.action-buttons');
            if (actionButtons) {
                actionButtons.style.display = 'none';
            }

            const buttonsContainer = document.querySelector('.buttons-container');
            if (buttonsContainer && !document.querySelector('.past-event-message')) {
                const message = document.createElement('div');
                message.className = 'past-event-message';
                message.textContent = '⏰ This event has ended';
                message.style.cssText = `
                    padding: 12px 20px;
                    background: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    text-align: center;
                    color: #666;
                    font-style: italic;
                    margin-bottom: 10px;
                `;
                buttonsContainer.insertBefore(message, buttonsContainer.firstChild);
            }
        } else {
            updateFavouriteButton(eventId);
            updateCartButton(eventId);
        }

        showAdminControls(event.user_id);
    }
}

function isAdmin() {
    const userSession = localStorage.getItem('userSession');

    if (userSession) {
        const user = JSON.parse(userSession);
        return user.role === 'admin';
    }
    return false;
}

function isLoggedIn() {
    const userSession = localStorage.getItem('userSession');
    return userSession !== null;
}

function setupAdminButtons() {
    const modifyBtn = document.getElementById('modifyBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    if (modifyBtn) {
        modifyBtn.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const eventId = urlParams.get('id');
            if (eventId) {
                window.location.href = `/edit-event.html?id=${eventId}`;
            }
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this event?')) {
                deleteEvent();
            }
        });
    }
}

async function deleteEvent() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.success) {
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            console.error('Error deleting event:', data.message);
        }
    } catch (error) {
        console.error('❌ Error deleting event:', error);
    }
}

async function addToCart(eventId, quantity = 1) {
    const userSession = localStorage.getItem('userSession');

    if (!userSession) {
        console.log('🔐 User not logged in, redirecting to login...');

        localStorage.setItem('pendingCartAction', JSON.stringify({
            action: 'add',
            eventId: String(eventId),
            quantity: quantity,
            returnUrl: window.location.href
        }));

        window.location.href = '/login.html';
        return false;
    }

    try {
        const user = JSON.parse(userSession);
        console.log(`🛒 Adding ${quantity} ticket(s) for event ${eventId} to cart for user ${user.id}`);

        const userKey = getUserCartKey();
        let cart = JSON.parse(localStorage.getItem(userKey) || '{}');

        if (Array.isArray(cart)) {
            const newCart = {};
            cart.forEach(id => {
                newCart[id] = newCart[id] ? newCart[id] + 1 : 1;
            });
            cart = newCart;
        }

        cart[String(eventId)] = (cart[String(eventId)] || 0) + quantity;
        localStorage.setItem(userKey, JSON.stringify(cart));
        updateCartButton(eventId);

        const response = await fetch('/api/user/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                eventId: eventId,
                quantity: quantity
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log(`✅ Added ${quantity} ticket(s) for event ${eventId} to cart on server for user ${user.id}`);
            return true;
        } else {
            cart[String(eventId)] = (cart[String(eventId)] || quantity) - quantity;
            if (cart[String(eventId)] <= 0) {
                delete cart[String(eventId)];
            }
            localStorage.setItem(userKey, JSON.stringify(cart));
            updateCartButton(eventId);
            return false;
        }
    } catch (error) {
        return false;
    }
}
async function removeFromCart(eventId, quantity = null) {
    const userSession = localStorage.getItem('userSession');

    const userKey = getUserCartKey();
    let cart = JSON.parse(localStorage.getItem(userKey) || '{}');

    if (Array.isArray(cart)) {
        const newCart = {};
        cart.forEach(id => {
            if (id !== String(eventId)) {
                newCart[id] = newCart[id] ? newCart[id] + 1 : 1;
            }
        });
        cart = newCart;
    } else {
        if (quantity === null) {
            delete cart[String(eventId)];
        } else {
            cart[String(eventId)] = (cart[String(eventId)] || 0) - quantity;
            if (cart[String(eventId)] <= 0) {
                delete cart[String(eventId)];
            }
        }
    }

    localStorage.setItem(userKey, JSON.stringify(cart));
    updateCartButton(eventId);

    if (!userSession) {
        return true;
    }

    try {
        const user = JSON.parse(userSession);

        const response = await fetch('/api/user/cart', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                eventId: eventId
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log(`✅ Removed event ${eventId} from cart on server for user ${user.id}`);
        } else {
            console.log('⚠️ Could not remove from server, but removed locally');
        }

        return true;
    } catch (error) {
        console.error('❌ Error removing from cart:', error);
        return true;
    }
}

function isInCart(eventId) {
    const userKey = getUserCartKey();
    const cart = JSON.parse(localStorage.getItem(userKey) || '{}');

    if (Array.isArray(cart)) {
        return cart.includes(String(eventId));
    }

    return cart[String(eventId)] && cart[String(eventId)] > 0;
}

function getEventQuantityInCart(eventId) {
    const userKey = getUserCartKey();
    const cart = JSON.parse(localStorage.getItem(userKey) || '{}');

    if (Array.isArray(cart)) {
        return cart.includes(String(eventId)) ? 1 : 0;
    }

    return cart[String(eventId)] || 0;
}

function updateCartButton(eventId) {
    const cartBtn = document.querySelector('.add-to-cart-btn');

    if (cartBtn) {
        const quantity = getEventQuantityInCart(eventId);

        if (quantity > 0) {
            cartBtn.textContent = `In Cart (${quantity})`;
            cartBtn.classList.add('is-in-cart');
            cartBtn.style.background = '#333';
            cartBtn.style.color = 'white';
            cartBtn.style.borderColor = '#333';
        } else {
            cartBtn.textContent = 'Add to Cart';
            cartBtn.classList.remove('is-in-cart');
            cartBtn.style.background = 'white';
            cartBtn.style.color = 'black';
            cartBtn.style.borderColor = '#000';
        }
    }
}

function setupActionButtons() {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const addToFavouritesBtn = document.querySelector('.add-to-favourites-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (addToCartBtn && eventId) {
        updateCartButton(eventId);

        addToCartBtn.addEventListener('click', function () {
            const currentQuantity = getEventQuantityInCart(eventId);
            if (currentQuantity > 0) {
                removeFromCart(eventId);
            } else {
                addToCart(eventId, 1);
            }
        });
    }

    if (addToFavouritesBtn && eventId) {
        updateFavouriteButton(eventId);

        addToFavouritesBtn.addEventListener('click', function () {
            if (isFavourite(eventId)) {
                removeFromFavourites(eventId);
            } else {
                addToFavourites(eventId);
            }
        });
    }
}

function isFavourite(eventId) {
    const key = getUserFavouritesKey();
    const favourites = JSON.parse(localStorage.getItem(key) || '[]');
    return favourites.includes(String(eventId));
}

async function addToFavourites(eventId) {
    const userSession = localStorage.getItem('userSession');

    if (!userSession) {
        console.log('🔐 User not logged in, redirecting to login...');

        localStorage.setItem('pendingFavouriteAction', JSON.stringify({
            action: 'add',
            eventId: String(eventId),
            returnUrl: window.location.href
        }));

        window.location.href = '/login.html';
        return false;
    }

    try {
        const user = JSON.parse(userSession);
        console.log(`❤️ Adding event ${eventId} to favourites for user ${user.id}`);

        if (isFavourite(eventId)) {
            return false;
        }

        const userKey = getUserFavouritesKey();
        let favourites = JSON.parse(localStorage.getItem(userKey) || '[]');
        favourites.push(String(eventId));
        localStorage.setItem(userKey, JSON.stringify(favourites));
        updateFavouriteButton(eventId);

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

        const result = await response.json();

        if (response.ok && result.success) {
            return true;
        } else {
            favourites = favourites.filter(id => id !== String(eventId));
            localStorage.setItem(userKey, JSON.stringify(favourites));
            updateFavouriteButton(eventId);
            showNotification('Error adding to favourites', 'error');
            return false;
        }
    } catch (error) {
        console.error('❌ Error adding to favourites:', error);
        showNotification('Error adding to favourites', 'error');
        return false;
    }
}

async function removeFromFavourites(eventId) {
    const userSession = localStorage.getItem('userSession');

    if (!userSession) {
        const userKey = getUserFavouritesKey();
        let favourites = JSON.parse(localStorage.getItem(userKey) || '[]');
        favourites = favourites.filter(id => id !== String(eventId));
        localStorage.setItem(userKey, JSON.stringify(favourites));
        updateFavouriteButton(eventId);
        showNotification('Removed from favourites!', 'success');
        return true;
    }

    try {
        const user = JSON.parse(userSession);

        const userKey = getUserFavouritesKey();
        let favourites = JSON.parse(localStorage.getItem(userKey) || '[]');
        favourites = favourites.filter(id => id !== String(eventId));
        localStorage.setItem(userKey, JSON.stringify(favourites));
        updateFavouriteButton(eventId);

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

        const result = await response.json();

        if (response.ok && result.success) {
            console.log(`✅ Removed event ${eventId} from favourites on server for user ${user.id}`);
        } else {
            console.log('⚠️ Could not remove from server, but removed locally');
        }

        return true;
    } catch (error) {
        console.error('❌ Error removing from favourites:', error);
        return true;
    }
}

function updateFavouriteButton(eventId) {
    const favouriteBtn = document.querySelector('.add-to-favourites-btn');

    if (favouriteBtn) {
        if (isFavourite(eventId)) {
            favouriteBtn.textContent = 'Remove from Favourites';
            favouriteBtn.classList.add('is-favourite');
            favouriteBtn.style.background = '#000';
            favouriteBtn.style.color = 'white';
            favouriteBtn.style.borderColor = '#000';
        } else {
            favouriteBtn.textContent = 'Add to Favourites';
            favouriteBtn.classList.remove('is-favourite');
            favouriteBtn.style.background = 'white';
            favouriteBtn.style.color = 'black';
            favouriteBtn.style.borderColor = '#000';
        }
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

async function loadEventDetails(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const event = await response.json();
        event.formatted_date = formatDate(event.date);
        event.formatted_time = formatTime(event.time);
        populateEventDetails(event);

    } catch (error) {
        console.error('❌ Error loading event details:', error);
        document.querySelector('.event-main').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2>Event not found</h2>
                <p>The event you're looking for doesn't exist.</p>
                <button onclick="window.location.href='/'" style="margin-top: 20px; padding: 10px 20px; border: 1px solid #000; background: white; cursor: pointer;">
                    Back to Events
                </button>
            </div>
        `;
    }
}
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const btnText = this.textContent.trim();

            switch (btnText) {
                case 'Home':
                    window.location.href = '/';
                    break;
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
                case 'Sign out':
                    break;
                default:
                    break;
            }
        });
    });

    if (typeof updateAuthButton === 'function') {
        updateAuthButton();
    }
}
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border: 1px solid #000;
        background: white;
        z-index: 1000;
        transition: all 0.3s ease;
        font-weight: 300;
        font-style: italic;
        color: #333;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;

    if (type === 'success') {
        notification.style.borderColor = '#28a745';
        notification.style.color = '#28a745';
    } else if (type === 'error') {
        notification.style.borderColor = '#dc3545';
        notification.style.color = '#dc3545';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

async function changeQuantity(eventId, change) {
    console.log(`🔢 Changing quantity for event ${eventId} by ${change}`);

    const userKey = getUserCartKey();
    let cart = JSON.parse(localStorage.getItem(userKey) || '{}');

    if (Array.isArray(cart)) {
        const newCart = {};
        cart.forEach(id => {
            newCart[id] = newCart[id] ? newCart[id] + 1 : 1;
        });
        cart = newCart;
    }

    if (cart[eventId]) {
        cart[eventId] += change;

        if (cart[eventId] <= 0) {
            delete cart[eventId];
            showNotification('Ticket removed from cart!', 'success');
        } else {
            showNotification(`Quantity updated to ${cart[eventId]}!`, 'success');
        }
    } else if (change > 0) {
        cart[eventId] = change;
        showNotification('Added to cart!', 'success');
    }

    localStorage.setItem(userKey, JSON.stringify(cart));

    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        try {
            const user = JSON.parse(userSession);

            const response = await fetch('/api/user/cart', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    eventId: eventId,
                    quantity: cart[eventId] || 0
                })
            });

            if (response.ok) {
                console.log(`✅ Cart synchronized with server for user ${user.id}`);
            }
        } catch (error) {
            console.error('❌ Error syncing with server:', error);
        }
    }

    if (typeof loadCartEvents === 'function') {
        loadCartEvents();
    }

    if (window.location.pathname.includes('event-details')) {
        updateCartButton(eventId);
    }
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.isInCart = isInCart;
window.getEventQuantityInCart = getEventQuantityInCart;
window.changeQuantity = changeQuantity;
window.getUserCartKey = getUserCartKey;
window.showNotification = showNotification;

function updateCartBadge() {
    const cartBadge = document.querySelector('.cart-badge') ||
        document.querySelector('.cart-count') ||
        document.querySelector('#cart-count');

    if (cartBadge) {
        const count = getCartCount();
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'block' : 'none';
    }
}

function getCartCount() {
    const userKey = getUserCartKey();
    const cart = JSON.parse(localStorage.getItem(userKey) || '{}');

    if (Array.isArray(cart)) {
        return cart.length;
    }

    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}

window.getCartCount = getCartCount;
window.updateCartBadge = updateCartBadge;

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (eventId) {
        loadEventDetails(eventId);
        setupActionButtons();
    }

    setupNavigation();

    updateCartBadge();
});