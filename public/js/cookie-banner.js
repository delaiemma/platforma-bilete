document.addEventListener('DOMContentLoaded', function() {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptNecessaryBtn = document.getElementById('acceptNecessary');
    const acceptAllBtn = document.getElementById('acceptAll');

    const CONSENT_KEY = 'cookieConsent';

    function showBanner() {
        if (cookieBanner) {
            cookieBanner.classList.add('show');
        }
    }

    function hideBanner() {
        if (cookieBanner) {
            cookieBanner.classList.remove('show');
        }
    }

    function checkCookieConsent() {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            showBanner();
        }
    }

    function handleAcceptNecessary() {
        localStorage.setItem(CONSENT_KEY, 'necessary');
        hideBanner();
        console.log('✅ Cookie consent: Necessary only');
    }

    function handleAcceptAll() {
        localStorage.setItem(CONSENT_KEY, 'all');
        hideBanner();
        console.log('✅ Cookie consent: All accepted');
    }

    if (acceptNecessaryBtn) {
        acceptNecessaryBtn.addEventListener('click', handleAcceptNecessary);
    }

    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', handleAcceptAll);
    }

    const manageCookiesLink = document.getElementById('manageCookiesLink');
    if (manageCookiesLink) {
        manageCookiesLink.addEventListener('click', function(e) {
            e.preventDefault();
            showBanner();
        });
    }

    checkCookieConsent();
});
