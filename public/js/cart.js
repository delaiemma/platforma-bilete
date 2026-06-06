const modalStyles = `
<style>
.availability-error-popup {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    align-items: center;
    justify-content: center;
}

.availability-error-popup.show {
    display: flex;
}

.availability-popup-content {
    background: white;
    border: 1px solid #000;
    padding: 40px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.availability-close-btn {
    position: absolute;
    top: 15px;
    right: 20px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    font-weight: 300;
}

.availability-close-btn:hover {
    color: #000;
}

.availability-popup-content h2 {
    font-size: 20px;
    font-style: italic;
    font-weight: 300;
    color: #dc3545;
    margin-bottom: 15px;
}

.availability-popup-content p {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    margin-bottom: 10px;
}

.availability-popup-content strong {
    color: #333;
}

.purchase-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    background: white;
    border: 2px solid #000;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    position: relative;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.loading-content {
    padding: 40px;
    text-align: center;
    width: 400px;
    font-style: italic;
}
.loading-content h2 {
    font-style: italic;
    font-weight: 400;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 2px solid #f3f3f3;
    border-top: 4px solid #333;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-bar {
    width: 100%;
    height: 6px;
    background: #f3f3f3;
    border: 1px solid #ddd;
    margin-top: 20px;
    overflow: hidden;
}

.loading-progress {
    height: 100%;
    background: linear-gradient(90deg, #333, #666);
    width: 0%;
    transition: width 3s ease;
}

.success-content {
    padding: 30px;
    width: 600px;
}

.success-header {
    text-align: center;
    margin-bottom: 30px;
}

.success-header h2 {
    font-size: 24px;
    font-weight: 300;
    font-style: italic;
    color: #333;
    margin-bottom: 10px;
}

.tickets-container {
    margin-bottom: 30px;
}

.tickets-container h3 {
    font-size: 18px;
    font-weight: 400;
    font-style: italic;
    color: #333;
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
}

.ticket-section {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 20px;
    background: #f9f9f9;
}

.ticket-section h4 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
}

.ticket-details {
    display: flex;
    gap: 20px;
    align-items: center;
}

.ticket-info {
    flex: 1;
}

.ticket-info p {
    margin: 5px 0;
    font-size: 14px;
    color: #666;
}

.qr-code {
    text-align: center;
}

.qr-code img {
    border: 1px solid #ddd;
    padding: 5px;
    background: white;
}

.qr-code p {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
    font-style: italic;
}

.action-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
}

.action-buttons button {
    padding: 12px 20px;
    border: 1px solid #000;
    background: white;
    color: #000;
    cursor: pointer;
    font-size: 14px;
    font-weight: 300;
    font-style: italic;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: all 0.3s;
    min-width: 140px;
}

.action-buttons button:hover {
    background: #f0f0f0;
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        margin: 10px;
    }
    
    .success-content {
        width: auto;
        padding: 20px;
    }
    
    .ticket-details {
        flex-direction: column;
        text-align: center;
    }
    
    .action-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .action-buttons button {
        width: 100%;
        max-width: 200px;
    }
}
</style>
`;
function showAvailabilityErrorPopup(eventTitle, available, requested) {
    const popup = document.querySelector('.availability-error-popup');

    if (!popup) {
        const newPopup = document.createElement('div');
        newPopup.className = 'availability-error-popup';
        newPopup.innerHTML = `
            <div class="availability-popup-content">
                <button class="availability-close-btn" onclick="closeAvailabilityErrorPopup()">×</button>
                <h2>Insufficient Tickets Available</h2>
                <p>Sorry! Not enough tickets available for <strong>"${eventTitle}"</strong>.</p>
                <p><strong>Available:</strong> ${available} ticket(s)</p>
                <p><strong>You requested:</strong> ${requested} ticket(s)</p>
                <p>Please adjust the quantity in your cart and try again.</p>
            </div>
        `;
        document.body.appendChild(newPopup);
    } else {
        const content = popup.querySelector('.availability-popup-content');
        content.innerHTML = `
            <button class="availability-close-btn" onclick="closeAvailabilityErrorPopup()">×</button>
            <h2>Insufficient Tickets Available</h2>
            <p>Sorry! Not enough tickets available for <strong>"${eventTitle}"</strong>.</p>
            <p><strong>Available:</strong> ${available} ticket(s)</p>
            <p><strong>You requested:</strong> ${requested} ticket(s)</p>
            <p>Please adjust the quantity in your cart and try again.</p>
        `;
    }
    document.querySelector('.availability-error-popup').classList.add('show');
}

function closeAvailabilityErrorPopup() {
    const popup = document.querySelector('.availability-error-popup');
    if (popup) {
        popup.classList.remove('show');
    }
}
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
async function loadCartFromServer() {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return;

    try {
        const user = JSON.parse(userSession);
        const response = await fetch(`/api/user/cart?userId=${user.id}`);
        const result = await response.json();

        if (response.ok && result.success) {
            const userKey = getUserCartKey();
            localStorage.setItem(userKey, JSON.stringify(result.cart));
        }
    } catch (error) {
    }
}
function createCartItem(event, quantity) {
    const imagePath = event.image_path ? `/images/${event.image_path}` : '/images/banner1.jpg';
    const price = parseFloat(event.price) === 0 ? 'Free' : `${event.price}`;
    const priceClass = parseFloat(event.price) === 0 ? 'free' : '';
    const totalPrice = parseFloat(event.price) === 0 ? 'Free' : `${(parseFloat(event.price) * quantity).toFixed(2)}`;

    return `
        <div class="cart-item" data-event-id="${event.event_id}">
            <div class="item-checkbox">
                <input type="checkbox" id="cart-${event.event_id}" onchange="updateCartSummary()">
            </div>
            <img src="${imagePath}" alt="${event.title}" class="item-image" onerror="this.src='/images/banner1.jpg'">
            <div class="item-details">
                <div class="item-title">${event.title}</div>
                <div class="item-location">${event.location}, ${event.city}</div>
                <div class="item-date">${event.formatted_date} • ${event.formatted_time}</div>
                <div class="item-price ${priceClass}">Price per ticket: ${price}</div>
                <div class="item-quantity">
                    <span>Quantity: <span class="quantity-display">${quantity}</span></span>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="changeQuantity('${event.event_id}', -1)" title="Remove one ticket">-</button>
                        <span class="quantity-display">${quantity}</span>
                        <button class="quantity-btn" onclick="changeQuantity('${event.event_id}', 1)" title="Add one ticket">+</button>
                    </div>
                </div>
                <div class="item-total ${priceClass}">Total: ${totalPrice}</div>
            </div>
            <button class="remove-item-btn" onclick="changeQuantity('${event.event_id}', -1)" title="Remove one ticket">
                ×
            </button>
        </div>
    `;
}

async function changeQuantity(eventId, change) {
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
    } else {
        return;
    }

    localStorage.setItem(userKey, JSON.stringify(cart));

    const cartItem = document.querySelector(`[data-event-id="${eventId}"]`);
    if (cartItem) {
        const newQuantity = cart[eventId] || 0;

        if (newQuantity > 0) {
            const quantityDisplays = cartItem.querySelectorAll('.quantity-display');
            console.log(`🔄 Found ${quantityDisplays.length} quantity displays to update`);

            quantityDisplays.forEach((display, index) => {
                display.textContent = newQuantity;
                console.log(`✅ Updated quantity display ${index + 1}: ${newQuantity}`);
            });

            const itemTotal = cartItem.querySelector('.item-total');
            const priceElement = cartItem.querySelector('.item-price');

            if (itemTotal && priceElement) {
                const priceText = priceElement.textContent;
                const priceMatch = priceText.match(/\$?(\d+\.?\d*)/);

                if (priceMatch) {
                    const unitPrice = parseFloat(priceMatch[1]);
                    const totalPrice = unitPrice * newQuantity;

                    if (unitPrice === 0) {
                        itemTotal.textContent = 'Total: Free';
                    } else {
                        itemTotal.textContent = `Total: ${totalPrice.toFixed(2)}`;
                    }
                }
            }
        } else {
            cartItem.remove();
        }

        updateCartSummary();
    } else {
        if (document.getElementById('cart-items')) {
            loadCartEvents();
        }
    }

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
                console.log('✅ Synced with server');
            }
        } catch (error) {
            console.error('❌ Error syncing with server:', error);
        }
    }

    updateCartBadge();

    if (Object.keys(cart).length === 0) {
        const cartContainer = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');

        if (cartContainer) {
            cartContainer.innerHTML = '';
        }

        if (emptyCart) {
            emptyCart.style.display = 'block';
        } else if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Start exploring events and add them to your cart!</p>
                    <button class="browse-events-btn" onclick="window.location.href='/'">Browse Events</button>
                </div>
            `;
        }

        const orderSummary = document.getElementById('cart-summary');
        if (orderSummary) {
            orderSummary.style.display = 'none';
        }
    }

    if (typeof startReservationTimer === 'function') {
        startReservationTimer();
    }
}
function updateCartSummary() {
    const checkboxes = document.querySelectorAll('.cart-item input[type="checkbox"]:checked');

    const totalItemsElement = document.getElementById('total-items') ||
        document.querySelector('.total-items') ||
        document.querySelector('[data-total-items]');

    const totalPriceElement = document.getElementById('total-price') ||
        document.querySelector('.total-price') ||
        document.querySelector('[data-total-price]');

    let totalTickets = 0;
    let totalPrice = 0;

    checkboxes.forEach(checkbox => {
        const cartItem = checkbox.closest('.cart-item');
        if (cartItem) {
            const quantityDisplay = cartItem.querySelector('.quantity-display');
            const quantity = quantityDisplay ? parseInt(quantityDisplay.textContent) : 1;

            totalTickets += quantity;

            const priceElement = cartItem.querySelector('.item-price');
            if (priceElement) {
                const priceText = priceElement.textContent;
                const priceMatch = priceText.match(/\$?(\d+\.?\d*)/);
                if (priceMatch && !priceText.toLowerCase().includes('free')) {
                    totalPrice += parseFloat(priceMatch[1]) * quantity;
                }
            }
        }
    });

    if (totalItemsElement) {
        totalItemsElement.textContent = totalTickets;
    } else {
    }

    if (totalPriceElement) {
        totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
    } else {
    }

    if (!totalItemsElement && !totalPriceElement) {
        createCartSummary(totalTickets, totalPrice);
    }
}
function createCartSummary(totalTickets, totalPrice) {
    if (totalTickets === 0) {
        const existingSummary = document.getElementById('cart-summary');
        if (existingSummary) {
            existingSummary.style.display = 'none';
        }
        return;
    }
    const cartContainer = document.querySelector('.cart-content') ||
        document.querySelector('.cart-main') ||
        document.querySelector('.cart-container');

    if (!cartContainer) {
        console.log('⚠️ Cannot create summary - no cart container found');
        return;
    }

    let summaryContainer = document.getElementById('cart-summary');

    if (!summaryContainer) {
        summaryContainer = document.createElement('div');
        summaryContainer.id = 'cart-summary';
        summaryContainer.className = 'order-summary';
        summaryContainer.innerHTML = `
            <h3>Order Summary</h3>
            <div class="summary-row">
                <span>Selected Tickets:</span>
                <span id="total-items">${totalTickets}</span>
            </div>
            <div class="summary-row total">
                <span>Total Price:</span>
                <span id="total-price">$${totalPrice.toFixed(2)}</span>
            </div>
            <button class="buy-tickets-btn" onclick="processPurchase()">
                Buy Tickets
            </button>
        `;

        cartContainer.appendChild(summaryContainer);
        console.log('✅ Created cart summary');
    } else {
        const totalItemsEl = summaryContainer.querySelector('#total-items');
        const totalPriceEl = summaryContainer.querySelector('#total-price');

        if (totalItemsEl) totalItemsEl.textContent = totalTickets;
        if (totalPriceEl) totalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
    }
}

async function simulatePurchase(purchaseEvents) {
    console.log('🛒 Real purchase for:', purchaseEvents);

    const user = JSON.parse(localStorage.getItem('userSession'));
    console.log('👤 User:', user);

    console.log('🔍 About to send to server:', {
        userId: user.id,
        events: purchaseEvents
    });

    const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: user.id,
            events: purchaseEvents
        })
    });

    console.log('📡 Server response status:', response.status);

    const result = await response.json();
    console.log('📦 Server response:', result);

    if (!response.ok || !result.success) {
        throw new Error(result.message || `Server error: ${response.status}`);
    }

    console.log('✅ Real purchase completed successfully');
    return result;
}

async function checkAvailability(purchaseEvents) {
    console.log('🔍 Checking availability for:', purchaseEvents);

    for (const event of purchaseEvents) {
        try {
            const response = await fetch(`/api/events/${event.eventId}`);
            const eventData = await response.json();

            if (!response.ok) {
                throw new Error(`Event ${event.eventId} not found`);
            }

            const availableTickets = parseInt(eventData.available_tickets);
            const requestedQuantity = parseInt(event.quantity);

            console.log(`📊 Event ${event.eventId}: Available=${availableTickets}, Requested=${requestedQuantity}`);

            if (availableTickets < requestedQuantity) {
                showAvailabilityErrorPopup(eventData.title, availableTickets, requestedQuantity);
                throw new Error(`Not enough tickets for "${eventData.title}". Available: ${availableTickets}, Requested: ${requestedQuantity}`);
            }

        } catch (error) {
            console.error(`❌ Availability check failed for event ${event.eventId}:`, error);
            throw error;
        }
    }

    console.log('✅ All events have sufficient tickets available');
    return true;
}

async function processPurchase() {

    const checkboxes = document.querySelectorAll('.cart-item input[type="checkbox"]:checked');
    console.log('📦 Found checkboxes:', checkboxes.length);

    if (checkboxes.length === 0) {
        console.log('❌ No checkboxes selected');
        showNotification('Please select at least one event to purchase', 'error');
        return;
    }

    const userSession = localStorage.getItem('userSession');
    console.log('👤 User session:', userSession ? 'Found' : 'Not found');

    if (!userSession) {
        showNotification('Please log in to purchase tickets', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }

    const selectedEvents = [];
    const purchaseEvents = [];

    try {
        checkboxes.forEach((checkbox, index) => {
            console.log(`🔍 Processing checkbox ${index + 1}`);

            const cartItem = checkbox.closest('.cart-item');
            if (!cartItem) {
                console.log('❌ No cart item found for checkbox');
                return;
            }

            const eventId = cartItem.dataset.eventId;
            console.log('🎯 Event ID:', eventId);

            const title = cartItem.querySelector('.item-title')?.textContent || 'Unknown';
            const location = cartItem.querySelector('.item-location')?.textContent || 'Unknown';
            const date = cartItem.querySelector('.item-date')?.textContent || 'Unknown';

            const quantityElements = cartItem.querySelectorAll('.quantity-display');
            console.log(`📊 Found ${quantityElements.length} quantity elements:`);
            quantityElements.forEach((el, i) => {
                console.log(`  - Element ${i}: "${el.textContent}" (parent: ${el.parentElement.className})`);
            });

            const quantity = quantityElements.length > 1 ?
                parseInt(quantityElements[1].textContent) :
                parseInt(quantityElements[0].textContent);


            const priceElement = cartItem.querySelector('.item-price');
            const priceText = priceElement?.textContent || '0';
            const priceMatch = priceText.match(/\$?(\d+\.?\d*)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

            selectedEvents.push({
                eventId,
                title,
                location,
                date,
                quantity,
                price: price === 0 ? 'Free' : `$${price}`,
                totalPrice: price === 0 ? 'Free' : `$${(price * quantity).toFixed(2)}`
            });

            purchaseEvents.push({
                eventId: parseInt(eventId),
                quantity: quantity
            });
        });


        if (selectedEvents.length === 0) {
            console.log('❌ No valid events to purchase');
            showNotification('No valid events found to purchase', 'error');
            return;
        }

        showLoadingModal();

        try {
            await checkAvailability(purchaseEvents);
        } catch (error) {
            hideLoadingModal();

            const errorMsg = error.message;
            if (errorMsg.includes('Not enough tickets')) {
            } else {
                const popup = document.querySelector('.availability-error-popup');
                if (!popup) {
                    const newPopup = document.createElement('div');
                    newPopup.className = 'availability-error-popup';
                    newPopup.innerHTML = `
                <div class="availability-popup-content">
                    <button class="availability-close-btn" onclick="closeAvailabilityErrorPopup()">×</button>
                    <h2>Purchase Failed</h2>
                    <p>Sorry, your purchase could not be completed.</p>
                    <p><strong>Error:</strong> ${errorMsg}</p>
                    <p>Please try again or contact support if the problem persists.</p>
                </div>
            `;
                    document.body.appendChild(newPopup);
                }
                document.querySelector('.availability-error-popup').classList.add('show');
            }
            return;
        }
        await simulatePurchase(purchaseEvents);

        const userKey = getUserCartKey();
        let cart = JSON.parse(localStorage.getItem(userKey) || '{}');

        purchaseEvents.forEach(({ eventId }) => {
            delete cart[String(eventId)];
        });

        localStorage.setItem(userKey, JSON.stringify(cart));

        setTimeout(() => {
            hideLoadingModal();
            showSuccessModal(selectedEvents);
            loadCartEvents();
            updateCartBadge();
        }, 2000);

    } catch (error) {
        hideLoadingModal();
        showAvailabilityErrorPopup('Purchase Error', 0, 0);
        return;
    }
}
function showLoadingModal() {

    const existingModal = document.getElementById('loadingModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'loadingModal';
    modal.className = 'purchase-modal';
    modal.innerHTML = `
        <div class="modal-content loading-content">
            <div class="loading-spinner"></div>
            <h2>Processing Your Purchase...</h2>
            <p>Please wait while we process your tickets.</p>
            <div class="loading-bar">
                <div class="loading-progress"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    console.log('✅ Loading modal created');

    setTimeout(() => {
        const progress = modal.querySelector('.loading-progress');
        if (progress) {
            progress.style.width = '100%';
        }
    }, 100);
}

function hideLoadingModal() {
    console.log('🚫 Hiding loading modal');
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.remove();
        console.log('✅ Loading modal removed');
    } else {
        console.log('⚠️ No loading modal found to remove');
    }
}

function showSuccessModal(selectedEvents) {
    console.log('🎉 Creating success modal for:', selectedEvents);

    const existingModal = document.getElementById('successModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'successModal';
    modal.className = 'purchase-modal';

    const totalTickets = selectedEvents.reduce((sum, event) => sum + event.quantity, 0);

    const qrCodesHTML = selectedEvents.map(event => {
        const qrData = `Event: ${event.title}\nLocation: ${event.location}\nDate: ${event.date}\nQuantity: ${event.quantity}\nTotal: ${event.totalPrice}\nTicket ID: ${generateTicketId()}`;
        const qrCodeURL = generateQRCode(qrData);

        return `
            <div class="ticket-section">
                <h4>${event.title}</h4>
                <div class="ticket-details">
                    <div class="ticket-info">
                        <p><strong>Location:</strong> ${event.location}</p>
                        <p><strong>Date:</strong> ${event.date}</p>
                        <p><strong>Quantity:</strong> ${event.quantity} ticket(s)</p>
                        <p><strong>Total:</strong> ${event.totalPrice}</p>
                        <p><strong>Ticket ID:</strong> ${generateTicketId()}</p>
                    </div>
                    <div class="qr-code">
                        <img src="${qrCodeURL}" alt="QR Code for ${event.title}" />
                        <p>Scan at venue</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    modal.innerHTML = `
        <div class="modal-content success-content">
            <div class="success-header">
                <h2>Purchase Successful!</h2>
                <p>Thank you for your purchase. You have successfully bought ${totalTickets} ticket(s).</p>
            </div>
            
            <div class="tickets-container">
                <h3>Your Digital Tickets</h3>
                ${qrCodesHTML}
            </div>
            
            <div class="action-buttons">
                <button class="download-btn" onclick="downloadTickets()">Download Tickets</button>
                <button class="close-btn" onclick="closeSuccessModal()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    console.log('✅ Success modal created');
}

function generateQRCode(data) {
    const encodedData = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedData}`;
}

function generateTicketId() {
    return 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function closeSuccessModal() {
    console.log('🚫 Closing success modal');
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.remove();
        console.log('✅ Success modal removed');
    }
}
function downloadTickets() {
    console.log('⬇️ Starting exact design download...');

    try {
        const modal = document.getElementById('successModal');
        const ticketSections = modal.querySelectorAll('.ticket-section');

        if (ticketSections.length === 0) {
            showNotification('No tickets found!', 'error');
            return;
        }

        let ticketsHTML = '';
        ticketSections.forEach(section => {
            const title = section.querySelector('h4').textContent;
            const qrImg = section.querySelector('.qr-code img');
            const qrSrc = qrImg ? qrImg.src : '';

            const infoElements = section.querySelectorAll('.ticket-info p');
            let location = '', date = '', quantity = '', total = '', ticketId = '';

            infoElements.forEach(p => {
                const text = p.textContent;
                if (text.includes('Location:')) location = text.replace('Location: ', '').replace('Location:', '').trim();
                if (text.includes('Date:')) date = text.replace('Date: ', '').replace('Date:', '').trim();
                if (text.includes('Quantity:')) quantity = text.replace('Quantity: ', '').replace('Quantity:', '').trim();
                if (text.includes('Total:')) total = text.replace('Total: ', '').replace('Total:', '').trim();
                if (text.includes('Ticket ID:')) ticketId = text.replace('Ticket ID: ', '').replace('Ticket ID:', '').trim();
            });

            ticketsHTML += `
            <div style="
                width: 100%; 
                max-width: 600px; 
                margin: 20px auto; 
                padding: 25px; 
                border: 2px solid #ddd; 
                background: #f9f9f9;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                page-break-after: always;
                box-sizing: border-box;
            ">
                <!-- Titlul evenimentului -->
                <h2 style="
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 25px 0;
                    line-height: 1.3;
                ">${title}</h2>
                
                <!-- Containerul principal cu informații și QR -->
                <div style="
                    display: flex;
                    gap: 25px;
                    align-items: flex-start;
                ">
                    <!-- Coloana cu informații -->
                    <div style="flex: 1;">
                        <p style="
                            margin: 0 0 8px 0;
                            font-size: 14px;
                            color: #666;
                            line-height: 1.4;
                        "><strong style="color: #333;">Location:</strong> ${location}</p>
                        
                        <p style="
                            margin: 0 0 8px 0;
                            font-size: 14px;
                            color: #666;
                            line-height: 1.4;
                        "><strong style="color: #333;">Date:</strong> ${date}</p>
                        
                        <p style="
                            margin: 0 0 8px 0;
                            font-size: 14px;
                            color: #666;
                            line-height: 1.4;
                        "><strong style="color: #333;">Quantity:</strong> ${quantity}</p>
                        
                        <p style="
                            margin: 0 0 8px 0;
                            font-size: 14px;
                            color: #666;
                            line-height: 1.4;
                        "><strong style="color: #333;">Total:</strong> ${total}</p>
                        
                        <p style="
                            margin: 0;
                            font-size: 14px;
                            color: #666;
                            line-height: 1.4;
                        "><strong style="color: #333;">Ticket ID:</strong> ${ticketId}</p>
                    </div>
                    
                    <!-- Coloana cu QR Code -->
                    <div style="
                        text-align: center;
                        flex-shrink: 0;
                    ">
                        <img src="${qrSrc}" alt="QR Code" style="
                            width: 120px;
                            height: 120px;
                            border: 1px solid #ccc;
                            padding: 5px;
                            background: white;
                            display: block;
                        " />
                        <p style="
                            margin: 8px 0 0 0;
                            font-size: 12px;
                            color: #999;
                            font-style: italic;
                            line-height: 1.2;
                        ">Scan at venue</p>
                    </div>
                </div>
            </div>`;
        });

        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Digital Tickets</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: white;
            padding: 20px;
            line-height: 1.5;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 300;
            color: #333;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        @media print {
            body { padding: 10px; }
            .header { page-break-after: avoid; }
            .ticket { page-break-after: always; }
            .ticket:last-child { page-break-after: avoid; }
        }
        
        @media (max-width: 768px) {
            .ticket-content {
                flex-direction: column !important;
                text-align: center;
            }
            
            .ticket-info {
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>My Digital Tickets</h1>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>
    
    ${ticketsHTML}
    
    <div style="
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        color: #999;
        font-size: 12px;
    ">
        <p>Ticket - Event Management System</p>
        <p style="margin-top: 5px;">Present this ticket at the venue entrance for scanning</p>
    </div>
</body>
</html>`;

        const dataURL = 'data:text/html;charset=utf-8,' + encodeURIComponent(fullHTML);

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `my-tickets-${new Date().toISOString().slice(0, 10)}.html`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('Tickets downloaded successfully!', 'success');

    } catch (error) {
        showNotification('Download failed. Please try again.', 'error');
    }
}

async function loadCartEvents() {

    const cartContainer = document.getElementById('cart-items') || document.querySelector('.cart-items');
    const emptyCart = document.getElementById('empty-cart') || document.querySelector('.empty-cart');

    if (!cartContainer) {
        return;
    }

    cartContainer.innerHTML = '<div class="loading">Loading your cart...</div>';
    if (emptyCart) emptyCart.style.display = 'none';

    try {
        const userKey = getUserCartKey();
        let cart = JSON.parse(localStorage.getItem(userKey) || '{}');

        if (Array.isArray(cart)) {
            const newCart = {};
            cart.forEach(id => {
                newCart[id] = newCart[id] ? newCart[id] + 1 : 1;
            });
            cart = newCart;
            localStorage.setItem(userKey, JSON.stringify(newCart));
        }

        const eventIds = Object.keys(cart);
        if (eventIds.length === 0) {
            cartContainer.innerHTML = '';
            if (emptyCart) {
                emptyCart.style.display = 'block';
            } else {
                cartContainer.innerHTML = `
                    <div class="empty-cart">
                        <h3>Your cart is empty</h3>
                        <p>Start exploring events and add them to your cart!</p>
                        <button class="browse-events-btn" onclick="window.location.href='/'">Browse Events</button>
                    </div>
                `;
            }
            updateCartSummary();
            return;
        }

        const cartEvents = [];

        for (const eventId of eventIds) {
            try {
                const response = await fetch(`/api/events/${eventId}`);

                if (response.ok) {
                    const eventData = await response.json();
                    cartEvents.push({ ...eventData, quantity: cart[eventId] });
                } else {
                    delete cart[eventId];
                }
            } catch (error) {
                delete cart[eventId];
            }
        }

        localStorage.setItem(userKey, JSON.stringify(cart));

        if (cartEvents.length === 0) {
            cartContainer.innerHTML = '';
            if (emptyCart) {
                emptyCart.style.display = 'block';
            } else {
                cartContainer.innerHTML = `
                    <div class="empty-cart">
                        <h3>Your cart is empty</h3>
                        <p>The events in your cart may have been removed.</p>
                        <button class="browse-events-btn" onclick="window.location.href='/'">Browse Events</button>
                    </div>
                `;
            }
            updateCartSummary();

            if (typeof startReservationTimer === 'function') {
                startReservationTimer();
            }
            return;
        }

        const cartHTML = cartEvents.map(event => createCartItem(event, event.quantity)).join('');
        cartContainer.innerHTML = cartHTML;

        const cartItems = document.querySelectorAll('.cart-item');
        cartItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.type === 'checkbox' ||
                    e.target.classList.contains('remove-item-btn') ||
                    e.target.classList.contains('quantity-btn') ||
                    e.target.closest('.item-checkbox') ||
                    e.target.closest('.quantity-controls')) {
                    return;
                }

                const eventId = item.dataset.eventId;
                window.location.href = `/event-details.html?id=${eventId}`;
            });
        });

        updateCartSummary();
        if (emptyCart) emptyCart.style.display = 'none';

        if (typeof startReservationTimer === 'function') {
            startReservationTimer();
        }

    } catch (error) {
        console.error('❌ Error loading cart events:', error);

        cartContainer.innerHTML = `
            <div class="error-message">
                <h3>❌ Could not load cart events</h3>
                <p>Error: ${error.message}</p>
                <button onclick="loadCartEvents()">🔄 Try Again</button>
            </div>
        `;
    }
}

async function removeFromCart(eventId) {

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
        delete cart[String(eventId)];
    }

    localStorage.setItem(userKey, JSON.stringify(cart));

    if (userSession) {
        try {
            const user = JSON.parse(userSession);

            console.log(`🗑️ Deleting from server: User ${user.id}, Event ${eventId}`);

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

            if (!response.ok) {
                console.error('❌ Failed to remove from server:', response.status);
                const errorData = await response.json();
                console.error('Error details:', errorData);
            } else {
                console.log(`✅ Successfully removed from server for user ${user.id}`);
            }

            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error('❌ Error removing from server:', error);
        }
    }

    await loadCartEvents();
    showNotification('Removed from cart!', 'success');
}

window.addToCart = async function (eventId, quantity = 1) {

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

    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        try {
            const user = JSON.parse(userSession);

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

            if (response.ok) {
                console.log(`✅ Added to server for user ${user.id}`);
            }
        } catch (error) {
            console.error('❌ Error adding to server:', error);
        }
    }

    showNotification(`Added ${quantity} ticket(s) to cart!`, 'success');
    updateCartBadge();
    return true;
};

window.isInCart = function (eventId) {
    const userKey = getUserCartKey();
    const cart = JSON.parse(localStorage.getItem(userKey) || '{}');

    if (Array.isArray(cart)) {
        return cart.includes(String(eventId));
    }

    return cart[String(eventId)] && cart[String(eventId)] > 0;
};

window.getCartCount = function () {
    const userKey = getUserCartKey();
    const cart = JSON.parse(localStorage.getItem(userKey) || '{}');

    if (Array.isArray(cart)) {
        return cart.length;
    }

    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
};

window.getEventQuantityInCart = function (eventId) {
    const userKey = getUserCartKey();
    const cart = JSON.parse(localStorage.getItem(userKey) || '{}');

    if (Array.isArray(cart)) {
        return cart.includes(String(eventId)) ? 1 : 0;
    }

    return cart[String(eventId)] || 0;
};
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

document.addEventListener('DOMContentLoaded', async function () {
    console.log('🎯 DOM loaded, initializing cart page');
    if (!document.getElementById('modal-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'modal-styles';
        styleElement.innerHTML = modalStyles;
        document.head.appendChild(styleElement);
    }

    if (localStorage.getItem('userSession')) {
        await loadCartFromServer();
    }

    loadCartEvents();

    updateCartBadge();

    setupNavigation();
});
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

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.isInCart = isInCart;
window.getCartCount = getCartCount;
window.getEventQuantityInCart = getEventQuantityInCart;
window.changeQuantity = changeQuantity;
window.showNotification = showNotification;
window.getUserCartKey = getUserCartKey;
window.updateCartBadge = updateCartBadge;
window.showAvailabilityErrorPopup = showAvailabilityErrorPopup;
window.closeAvailabilityErrorPopup = closeAvailabilityErrorPopup;

let countdownInterval = null;
let earliestExpiration = null;

async function fetchReservations() {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return null;

    try {
        const user = JSON.parse(userSession);
        const response = await fetch(`/api/user/cart/${user.id}`);
        const result = await response.json();

        if (response.ok && result.success && result.reservations) {
            return result.reservations;
        }
    } catch (error) {
        console.error('❌ Error fetching reservations:', error);
    }

    return null;
}

function findEarliestExpiration(reservations) {
    if (!reservations || reservations.length === 0) return null;

    let earliest = new Date(reservations[0].expires_at);

    for (const reservation of reservations) {
        const expiresAt = new Date(reservation.expires_at);
        if (expiresAt < earliest) {
            earliest = expiresAt;
        }
    }

    return earliest;
}

function updateCountdownDisplay() {
    const timerContainer = document.getElementById('reservation-timer');
    const timeDisplay = document.querySelector('.time-remaining');

    if (!earliestExpiration || !timerContainer || !timeDisplay) {
        if (timerContainer) {
            timerContainer.style.display = 'none';
        }
        return;
    }

    const now = new Date();
    const timeLeft = earliestExpiration - now;

    if (timeLeft <= 0) {
        timerContainer.style.display = 'none';
        clearInterval(countdownInterval);
        showNotification('Reservation expired! Cart refreshing...', 'warning');
        setTimeout(() => {
            loadCartEvents();
        }, 1000);
        return;
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timeDisplay.textContent = formattedTime;

    if (timeLeft < 120000) {
        timeDisplay.classList.add('warning');
    } else {
        timeDisplay.classList.remove('warning');
    }

    timerContainer.style.display = 'block';
}

async function startReservationTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    const reservations = await fetchReservations();

    if (!reservations || reservations.length === 0) {
        earliestExpiration = null;

        const timerContainer = document.getElementById('reservation-timer');
        if (timerContainer) {
            timerContainer.style.display = 'none';
        }
        return;
    }

    earliestExpiration = findEarliestExpiration(reservations);

    updateCountdownDisplay();

    countdownInterval = setInterval(() => {
        updateCountdownDisplay();
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    startReservationTimer();
});

window.startReservationTimer = startReservationTimer;