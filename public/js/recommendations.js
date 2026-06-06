document.addEventListener('DOMContentLoaded', async () => {
    const recommendationsGrid = document.getElementById('recommendations-grid');
    const recommendationsTitle = document.getElementById('recommendations-title');
    const recommendationsSection = document.querySelector('.recommendations-section');

    if (!recommendationsGrid || !recommendationsTitle) {
        return;
    }

    try {
        const userSession = localStorage.getItem('userSession');
        const userId = userSession ? JSON.parse(userSession).id : null;

        const url = userId
            ? `/api/recommendations?userId=${userId}&limit=3`
            : `/api/recommendations?limit=3`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success || !data.recommendations || data.recommendations.length === 0) {
            if (recommendationsSection) {
                recommendationsSection.style.display = 'none';
            }
            return;
        }

        if (data.personalized) {
            recommendationsTitle.textContent = 'Recommendations - Personalized for You';
        } else {
            recommendationsTitle.textContent = 'Recommendations - Popular Events';
        }

        const eventsHTML = data.recommendations.map(event => createEventCard(event)).join('');
        recommendationsGrid.innerHTML = eventsHTML;

        const eventCards = recommendationsGrid.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            card.addEventListener('click', () => {
                const eventId = card.dataset.eventId;
                window.location.href = `/event-details.html?id=${eventId}`;
            });
        });

    } catch (error) {
        console.error('Error loading recommendations:', error);
        if (recommendationsSection) {
            recommendationsSection.style.display = 'none';
        }
    }
});
