/**
 * @fileoverview Chatbot Knowledge Base - Rule-based responses
 * Contains all predefined intents, keywords, and responses for the chatbot
 */

/**
 * Chatbot knowledge base with categorized intents
 * Each intent has keywords for matching and predefined responses
 */
const knowledgeBase = {
  salut: {
    keywords: ['salut', 'hello', 'buna', 'hey', 'bună ziua', 'bună seara', 'hi', 'hei'],
    response: '👋 Bună! Sunt asistentul virtual al platformei de bilete.\n\nCu ce te pot ajuta astăzi?\n• Cumpărare bilete\n• Anulare și refund\n• Informații despre locuri\n• Plăți și securitate',
    priority: 1
  },

  cumpar_bilet: {
    keywords: ['cum cumpar', 'vreau bilet', 'cumparare', 'achizitie', 'comanda', 'pot cumpara', 'vreau sa cumpar'],
    response: '🎫 **Cum cumperi bilete:**\n\n1️⃣ Caută evenimentul dorit în pagina principală\n2️⃣ Click pe eveniment pentru detalii\n3️⃣ Selectează numărul de bilete (sau locurile pentru evenimente cu locuri numerotate)\n4️⃣ Adaugă în coș\n5️⃣ Finalizează comanda cu plata prin Stripe\n\n✅ Vei primi email cu biletele și QR code-uri!\n\nAi nevoie de ajutor cu un anumit pas?',
    priority: 2
  },

  anulare: {
    keywords: ['anulez', 'anulare', 'refund', 'returnare', 'bani inapoi', 'pot anula', 'vreau sa anulez', 'cancel'],
    response: '❌ **Anulare bilete:**\n\n• Poți anula biletele din pagina "My Tickets"\n• Anularea este posibilă **cu mai mult de 24 ore înainte de eveniment**\n• Apasă butonul "Cancel ticket" de lângă biletul dorit\n\n💰 **Refund:**\n• Se procesează automat prin Stripe\n• Banii revin în cont în 5-10 zile lucrătoare\n• Vei primi email de confirmare\n\n⚠️ **Important:** Biletele NU pot fi anulate cu 24 ore sau mai puțin înainte de eveniment.',
    priority: 2
  },

  plata: {
    keywords: ['plata', 'platesc', 'card', 'stripe', 'securitate', 'sigur', 'metode plata', 'cum platesc'],
    response: '💳 **Plăți și Securitate:**\n\n✅ Plățile sunt procesate **100% securizat prin Stripe**\n✅ Acceptăm toate cardurile majore (Visa, Mastercard, Amex)\n✅ Nu stocăm datele cardului tău\n✅ Conexiune criptată SSL\n\n🔒 Datele tale sunt în siguranță!\n\nStripe este folosit de companii precum Amazon, Google, și Shopify.',
    priority: 2
  },

  locuri: {
    keywords: ['loc', 'locuri', 'scaun', 'rand', 'zona', 'vip', 'regular', 'balcony', 'numerotate', 'selectez loc'],
    response: '🪑 **Locuri Numerotate:**\n\n**Zone disponibile:**\n• 🌟 **VIP** - Cele mai apropiate de scenă (preț maxim)\n• 🎭 **Regular** - Locuri centrale (preț mediu)\n• 🏛️ **Balcony** - Locuri superioare (preț accesibil)\n\n**Cum funcționează:**\n1. Pentru evenimente cu locuri numerotate, vei vedea harta sălii\n2. Click pe locurile dorite (verzi = disponibile)\n3. Prețul se calculează automat pe baza zonei\n\n📍 Locurile tale sunt rezervate timp de 10 minute pentru finalizarea comenzii!',
    priority: 2
  },

  bilet_qr: {
    keywords: ['bilet', 'qr', 'qr code', 'cod', 'ticket', 'primesc bilet', 'unde e biletul'],
    response: '🎟️ **Bilete și QR Codes:**\n\n**După cumpărare:**\n✅ Primești email instant cu biletele\n✅ Fiecare bilet are QR code unic\n✅ Poți descărca PDF din "My Tickets"\n\n**La eveniment:**\n📱 Arată QR code-ul la intrare (pe telefon sau printat)\n🔍 Se scanează și primești acces\n\n**Pierdut emailul?**\nIntră în "My Tickets" și descarcă din nou biletele!',
    priority: 2
  },

  cont: {
    keywords: ['cont', 'inregistrare', 'login', 'parola', 'email', 'profil', 'ma inregistrez', 'creez cont'],
    response: '👤 **Cont și Autentificare:**\n\n**Înregistrare:**\n• Click pe "Sign Up" în colțul din dreapta sus\n• Completează: nume, email, parolă\n• Verifică emailul pentru confirmare\n\n**Login:**\n• Click pe "Login"\n• Introdu email și parola\n\n**Parolă uitată?**\n• Click pe "Forgot Password"\n• Vei primi email pentru resetare\n\n✅ Contul îți permite să vezi istoric achiziții în "My Tickets"!',
    priority: 2
  },

  discount: {
    keywords: ['discount', 'reducere', 'cod', 'promo', 'voucher', 'earlybird', 'cupon', 'oferta'],
    response: '🎁 **Coduri de Reducere:**\n\n**Cum folosești:**\n1. La checkout, vezi câmpul "Discount Code"\n2. Introdu codul și apasă "Apply"\n3. Prețul se recalculează automat\n\n**Exemple coduri:**\n• **EARLYBIRD** - pentru evenimente la 30+ zile distanță\n• Coduri pentru prima achiziție\n• Reduceri procentuale sau sume fixe\n\n⚠️ Verifică data de expirare și condițiile fiecărui cod!',
    priority: 2
  },

  evenimente: {
    keywords: ['evenimente', 'spectacole', 'concert', 'teatru', 'program', 'cand', 'ce evenimente'],
    response: '🎭 **Evenimente Disponibile:**\n\n**Vezi toate evenimentele:**\n• Pagina principală - evenimente featured\n• "More Events" - lista completă\n• Filtrare după oraș, tip, dată\n\n**Tipuri evenimente:**\n🎵 Concerte\n🎭 Teatru\n🎪 Show-uri\n🎨 Expoziții\n⚽ Sport\n\n**Recomandări personalizate:**\nDacă ești logat, vezi recomandări bazate pe preferințele tale în pagina principală!',
    priority: 2
  },

  contact: {
    keywords: ['contact', 'suport', 'ajutor', 'email', 'telefon', 'asistenta', 'vorbesc cu cineva'],
    response: '📧 **Contact și Suport:**\n\n**Email:**\nsupport@ticketing.com\n\n**Formular Contact:**\nPagina "Contact Us" - completează formularul și primești răspuns în 24h\n\n**Chat Live:**\nSunt aici să te ajut! Întreabă-mă orice.\n\n**Program suport:**\nLuni - Vineri: 9:00 - 18:00\nSâmbătă: 10:00 - 14:00',
    priority: 2
  },

  favorite: {
    keywords: ['favorite', 'favorit', 'salvez', 'imi place', 'adaug la favorite'],
    response: '❤️ **Favorite:**\n\n**Cum adaugi:**\n• Click pe inima (♡) de pe cardul evenimentului\n• Evenimentul se salvează în "Favorites"\n\n**Acces rapid:**\n• Click pe iconița inimă din meniu\n• Vezi toate evenimentele favorite\n\n✅ Primești notificări când sunt actualizări la evenimentele tale favorite!',
    priority: 2
  },

  cos: {
    keywords: ['cos', 'cart', 'cosul meu', 'checkout', 'finalizare', 'comanda mea'],
    response: '🛒 **Coș de Cumpărături:**\n\n**Cum funcționează:**\n• Adaugi bilete din pagina evenimentului\n• Biletele sunt rezervate 10 minute\n• Click pe iconița coșului pentru checkout\n\n**La checkout:**\n✅ Verifici comanda\n✅ Aplici cod discount (opțional)\n✅ Finalizezi plata prin Stripe\n\n⏰ **Important:** Rezervarea expiră după 10 minute - finalizează repede comanda!',
    priority: 2
  },

  pret: {
    keywords: ['pret', 'cost', 'cat costa', 'tarif', 'valoare', 'scump', 'ieftin'],
    response: '💰 **Prețuri:**\n\n**Prețul variază în funcție de:**\n• Tipul evenimentului\n• Zona selectată (pentru locuri numerotate)\n• Disponibilitate\n\n**Zone și prețuri:**\n• VIP: Preț maxim (×3 din bază)\n• Regular: Preț mediu (×2 din bază)\n• Balcony: Preț accesibil (preț bază)\n\n📊 Vezi prețul exact pe pagina fiecărui eveniment!\n\n🎁 Folosește coduri de discount pentru reduceri!',
    priority: 2
  },

  multiple_bilete: {
    keywords: ['mai multe', 'grup', '10 bilete', 'multi', 'cantitate', 'cate bilete'],
    response: '👥 **Bilete Multiple:**\n\n✅ Poți cumpăra **oricâte bilete** dorești (în limita disponibilității)\n\n**Cum cumperi pentru grup:**\n1. Selectează cantitatea dorită\n2. Pentru locuri numerotate: click pe fiecare loc de pe hartă\n3. Prețul total se calculează automat\n\n💡 **Sfat:** Pentru grupuri mari (10+ persoane), asigură-te că există suficiente locuri libere alăturate!',
    priority: 2
  },

  email_notif: {
    keywords: ['email', 'notificare', 'confirmare', 'primesc', 'nu am primit'],
    response: '📬 **Email-uri și Notificări:**\n\n**Primești email pentru:**\n✅ Confirmare achiziție (cu bilete + QR)\n✅ Anulare bilet (cu confirmare refund)\n✅ Update-uri evenimente favorite\n\n**Nu ai primit email?**\n1. Verifică folderul SPAM/Junk\n2. Intră în "My Tickets" pentru download bilete\n3. Contactează suport dacă problema persistă\n\n📧 Email-urile vin de la: noreply@ticketing.com',
    priority: 2
  },

  multumesc: {
    keywords: ['multumesc', 'mersi', 'ms', 'thank', 'thanks', 'multumiri', 'pa', 'bye'],
    response: '😊 Cu plăcere! Dacă mai ai întrebări, sunt aici să te ajut!\n\n🎭 Distracție plăcută la evenimente!\n\n---\n\nPentru alte întrebări, scrie-mi oricând! 👋',
    priority: 1
  }
};

/**
 * Default response when no intent is matched
 */
const defaultResponse = `🤔 Îmi pare rău, nu am înțeles întrebarea.

**Încearcă să întrebi despre:**
• 🎫 Cumpărare bilete
• ❌ Anulare și refund
• 🪑 Locuri numerotate
• 💳 Plăți și securitate
• 📧 Contact și suport
• 🎁 Coduri discount

Sau reformulează întrebarea! 😊`;

module.exports = {
  knowledgeBase,
  defaultResponse
};
