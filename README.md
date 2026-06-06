Platformă Web pentru Vânzarea Biletelor la Evenimente

Proiect de licență — aplicație web full-stack pentru managementul și vânzarea biletelor la
evenimente culturale și sportive, cu actualizări în timp real.


TEHNOLOGII UTILIZATE

Backend: Node.js, Express.js, PostgreSQL, Socket.IO, JWT, Stripe API, Nodemailer, Puppeteer

Frontend: React 18, Vite, Zustand, React Query, CSS Modules

Testare: Jest


CERINȚE PRELIMINARE

Node.js 18+
PostgreSQL 14+
npm


INSTALARE

Clonare repository

    git clone <url-repository>
    cd site-bilete

Instalare dependențe backend

    npm install

Instalare dependențe frontend

    cd client
    npm install

Configurare variabile de mediu

Creați un fișier .env în directorul rădăcină cu următoarele valori:

    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    GEMINI_API_KEY=your_key
    CHATBOT_MODE=ai
    CANCELLATION_DEADLINE_HOURS=24

Configurare bază de date

Creați baza de date PostgreSQL și rulați scriptul de inițializare:

    psql -U postgres -c "CREATE DATABASE ticket;"
    psql -U postgres -d ticket -f backup_20260331_.sql

Verificați că parametrii de conexiune din config/database.js corespund instalării locale.


RULARE

Backend (port 3000):

    node server.js

Frontend (port 5173):

    cd client
    npm run dev

Aplicația este accesibilă la adresa localhost:5173.


RULARE TESTE

    cd tests
    npx jest --testPathPattern="unit|integration" --forceExit


STRUCTURA PROIECTULUI

    site-bilete/
    ├── config/          Configurare bază de date
    ├── controllers/     Logica de business pentru fiecare resursă
    ├── middleware/      Autentificare JWT, rate limiting, validare
    ├── models/          Modele de date și interogări SQL
    ├── routes/          Definirea endpoint-urilor API
    ├── services/        Servicii externe (email, chatbot, cleanup)
    ├── tests/           Teste unitare și de integrare
    ├── client/          Aplicația React (frontend)
    │   └── src/
    │       ├── components/  Componente reutilizabile
    │       ├── pages/       Paginile aplicației
    │       ├── hooks/       Custom hooks
    │       ├── store/       State management (Zustand)
    │       └── styles/      CSS Modules
    └── server.js        Punctul de intrare al serverului


AUTOR

De Lai Emma

Proiect dezvoltat ca lucrare de licență, 2026.
