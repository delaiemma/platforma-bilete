--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cart_cart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_cart_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_cart_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    cart_id integer DEFAULT nextval('public.cart_cart_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- Name: cart_reservations_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_reservations_reservation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_reservations_reservation_id_seq OWNER TO postgres;

--
-- Name: cart_reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_reservations (
    reservation_id integer DEFAULT nextval('public.cart_reservations_reservation_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.cart_reservations OWNER TO postgres;

--
-- Name: discount_codes_code_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.discount_codes_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discount_codes_code_id_seq OWNER TO postgres;

--
-- Name: discount_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discount_codes (
    code_id integer DEFAULT nextval('public.discount_codes_code_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    valid_from timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    valid_until timestamp without time zone,
    max_uses integer,
    current_uses integer DEFAULT 0,
    first_purchase_only boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.discount_codes OWNER TO postgres;

--
-- Name: event_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_event_id_seq OWNER TO postgres;

--
-- Name: event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event (
    event_id integer DEFAULT nextval('public.event_event_id_seq'::regclass) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    location character varying(255),
    city character varying(255),
    date date NOT NULL,
    "time" time without time zone NOT NULL,
    price numeric(10,2) DEFAULT 0,
    available_tickets integer DEFAULT 0,
    type character varying(100),
    image_path character varying(255),
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tickets_sold integer DEFAULT 0,
    organizer character varying(255),
    has_seating boolean DEFAULT false
);


ALTER TABLE public.event OWNER TO postgres;

--
-- Name: event_layouts_event_layout_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_layouts_event_layout_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_layouts_event_layout_id_seq OWNER TO postgres;

--
-- Name: event_layouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_layouts (
    event_layout_id integer DEFAULT nextval('public.event_layouts_event_layout_id_seq'::regclass) NOT NULL,
    event_id integer NOT NULL,
    layout_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.event_layouts OWNER TO postgres;

--
-- Name: event_zone_pricing_pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_zone_pricing_pricing_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_zone_pricing_pricing_id_seq OWNER TO postgres;

--
-- Name: event_zone_pricing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_zone_pricing (
    pricing_id integer DEFAULT nextval('public.event_zone_pricing_pricing_id_seq'::regclass) NOT NULL,
    event_id integer NOT NULL,
    zone_id integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.event_zone_pricing OWNER TO postgres;

--
-- Name: favorites_favorite_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorites_favorite_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_favorite_id_seq OWNER TO postgres;

--
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    favorite_id integer DEFAULT nextval('public.favorites_favorite_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- Name: layout_rows_row_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.layout_rows_row_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.layout_rows_row_id_seq OWNER TO postgres;

--
-- Name: layout_rows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.layout_rows (
    row_id integer DEFAULT nextval('public.layout_rows_row_id_seq'::regclass) NOT NULL,
    layout_id integer NOT NULL,
    zone_id integer NOT NULL,
    row_letter character varying(2) NOT NULL,
    seats_in_row integer NOT NULL,
    row_order integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.layout_rows OWNER TO postgres;

--
-- Name: newsletter_subscribers_subscriber_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.newsletter_subscribers_subscriber_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.newsletter_subscribers_subscriber_id_seq OWNER TO postgres;

--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.newsletter_subscribers (
    subscriber_id integer DEFAULT nextval('public.newsletter_subscribers_subscriber_id_seq'::regclass) NOT NULL,
    email character varying(255) NOT NULL,
    subscribed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);


ALTER TABLE public.newsletter_subscribers OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    event_id integer,
    type character varying(50) NOT NULL,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_payment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_payment_id_seq OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    payment_id integer DEFAULT nextval('public.payments_payment_id_seq'::regclass) NOT NULL,
    purchase_id integer,
    user_id integer,
    stripe_payment_intent_id character varying(255) NOT NULL,
    stripe_client_secret character varying(255),
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'ron'::character varying,
    status character varying(50) NOT NULL,
    payment_method_type character varying(50),
    last_payment_error text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: purchases_purchase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchases_purchase_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_purchase_id_seq OWNER TO postgres;

--
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    purchase_id integer DEFAULT nextval('public.purchases_purchase_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    total_price numeric(10,2) NOT NULL,
    purchase_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    stripe_payment_intent_id character varying(255)
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_review_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_review_id_seq OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    review_id integer DEFAULT nextval('public.reviews_review_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: seat_reservations_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seat_reservations_reservation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seat_reservations_reservation_id_seq OWNER TO postgres;

--
-- Name: seat_reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seat_reservations (
    reservation_id integer DEFAULT nextval('public.seat_reservations_reservation_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    row_letter character varying(2) NOT NULL,
    seat_number integer NOT NULL,
    zone_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.seat_reservations OWNER TO postgres;

--
-- Name: seat_zones_zone_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seat_zones_zone_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seat_zones_zone_id_seq OWNER TO postgres;

--
-- Name: seat_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seat_zones (
    zone_id integer DEFAULT nextval('public.seat_zones_zone_id_seq'::regclass) NOT NULL,
    layout_id integer NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(7) DEFAULT '#4CAF50'::character varying,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    default_price numeric(10,2)
);


ALTER TABLE public.seat_zones OWNER TO postgres;

--
-- Name: ticket_seats_ticket_seat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_seats_ticket_seat_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_seats_ticket_seat_id_seq OWNER TO postgres;

--
-- Name: ticket_seats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_seats (
    ticket_seat_id integer DEFAULT nextval('public.ticket_seats_ticket_seat_id_seq'::regclass) NOT NULL,
    purchase_id integer NOT NULL,
    event_id integer NOT NULL,
    row_letter character varying(2),
    seat_number integer,
    zone_id integer,
    ticket_id character varying(50),
    qr_code text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ticket_seats OWNER TO postgres;

--
-- Name: upgrade_offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upgrade_offers (
    offer_id integer NOT NULL,
    purchase_id integer NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    from_zone_id integer NOT NULL,
    to_zone_id integer NOT NULL,
    new_row character varying(3),
    new_seat integer,
    token character varying(64) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.upgrade_offers OWNER TO postgres;

--
-- Name: upgrade_offers_offer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.upgrade_offers_offer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upgrade_offers_offer_id_seq OWNER TO postgres;

--
-- Name: upgrade_offers_offer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.upgrade_offers_offer_id_seq OWNED BY public.upgrade_offers.offer_id;


--
-- Name: user_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_user_id_seq OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    user_id integer DEFAULT nextval('public.user_user_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reset_token character varying(255),
    reset_token_expires timestamp without time zone
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: venue_layouts_layout_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.venue_layouts_layout_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.venue_layouts_layout_id_seq OWNER TO postgres;

--
-- Name: venue_layouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.venue_layouts (
    layout_id integer DEFAULT nextval('public.venue_layouts_layout_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.venue_layouts OWNER TO postgres;

--
-- Name: waitlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.waitlist (
    waitlist_id integer NOT NULL,
    event_id integer NOT NULL,
    user_id integer NOT NULL,
    status character varying(20) DEFAULT 'waiting'::character varying,
    notified_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.waitlist OWNER TO postgres;

--
-- Name: waitlist_waitlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.waitlist_waitlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.waitlist_waitlist_id_seq OWNER TO postgres;

--
-- Name: waitlist_waitlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.waitlist_waitlist_id_seq OWNED BY public.waitlist.waitlist_id;


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: upgrade_offers offer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upgrade_offers ALTER COLUMN offer_id SET DEFAULT nextval('public.upgrade_offers_offer_id_seq'::regclass);


--
-- Name: waitlist waitlist_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist ALTER COLUMN waitlist_id SET DEFAULT nextval('public.waitlist_waitlist_id_seq'::regclass);


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (cart_id, user_id, event_id, quantity, added_at) FROM stdin;
3	2	1	1	2026-01-09 08:56:29.948
\.


--
-- Data for Name: cart_reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_reservations (reservation_id, user_id, event_id, quantity, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: discount_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discount_codes (code_id, code, description, discount_type, discount_value, valid_from, valid_until, max_uses, current_uses, first_purchase_only, is_active, created_at, updated_at) FROM stdin;
1	WELCOME10	10% discount for first-time customers	percentage	10.00	2026-02-23 13:39:36.005	\N	\N	0	t	t	2026-02-23 13:39:36.005	2026-02-23 13:39:36.005
2	SUMMER26	25% summer 2026 special discount	percentage	25.00	2026-05-31 21:00:00	2026-08-31 20:59:59	\N	3	f	t	2026-02-23 13:39:36.005	2026-02-24 11:43:53.682
4	VALENTINE	15% Valentine's Day special	percentage	15.00	2026-02-09 22:00:00	2026-02-14 21:59:59	\N	0	f	t	2026-02-24 11:51:08.288	2026-02-24 11:51:08.288
5	BLACKFRIDAY	30% Black Friday mega discount	percentage	30.00	2026-11-23 22:00:00	2026-11-30 21:59:59	\N	0	f	t	2026-02-24 11:51:08.288	2026-02-24 11:51:08.288
6	EARLYBIRD	15% early bird discount	percentage	15.00	\N	\N	\N	1	f	t	2026-02-24 11:51:08.288	2026-02-24 11:59:12.156
3	NEWYEAR2026	20% New Year 2026 discount	percentage	20.00	2025-12-31 22:00:00	2026-01-15 21:59:00	\N	0	f	t	2026-02-24 11:51:08.288	2026-02-25 17:04:52.916
8	WELCOME10-B4KA9	Welcome newsletter discount - 10% off	percentage	10.00	2026-02-26 16:15:56.555	2027-02-26 16:15:56.555	\N	0	t	t	2026-02-26 16:15:56.551	2026-02-26 16:15:56.551
9	WELCOME10-70QD8	Welcome newsletter discount - 10% off	percentage	10.00	2026-02-26 16:22:07.209	2027-02-26 16:22:07.209	\N	0	t	t	2026-02-26 16:22:07.207	2026-02-26 16:22:07.207
\.


--
-- Data for Name: event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event (event_id, title, description, location, city, date, "time", price, available_tickets, type, image_path, user_id, created_at, tickets_sold, organizer, has_seating) FROM stdin;
19	Medieval Castle Festival	Discover medieval history in a spectacular setting! Cultural festival featuring historical reenactments, sword fighting demonstrations, traditional crafts, and medieval music. Visit the fortress and enjoy unique views of the surrounding mountains.	Râșnov Fortress	Brașov	2030-06-21	10:00:00	45.00	200	General	image-1771947596199-90415210.avif	1	2026-02-24 15:32:09.864	0	Heritage Romania Events	f
17	Electric Space Festival	he hottest electronic music festival of the summer! 3 stages, 30+ international DJs, spectacular art installations and immersive experiences. Get ready for an intergalactic sonic journey under the open sky!	Arenele Romane	București	2029-06-08	14:00:00	250.00	5000	Concert	image-1771946590114-449609133.avif	1	2026-02-24 15:22:39.552	0	Space Music Productions	f
10	Autumn Fair & Carnival	Experience the magic of autumn at our traditional fair and carnival! Enjoy thrilling rides, including our iconic illuminated swing carousel, classic fairground attractions, local food vendors, live entertainment, and games for all ages. A perfect family outing as the sun sets. Open until late evening with spectacular light displays.	Parcul Herăstrău	București	2027-04-29	14:00:00	25.00	500	Festival	image-1771682968785-303163937.avif	1	2026-01-30 14:12:51.744	0	Festivalul de Toamnă	f
13	Hot Air Balloon Festival	Experience the magic of hundreds of colorful hot air balloons filling the sky at sunrise! Watch the spectacular mass ascension, enjoy tethered balloon rides, and capture breathtaking photos. Evening program includes the mesmerizing Night Glow event where grounded balloons light up in synchronized patterns. Food vendors, live music, and family activities throughout the day. Early morning flights available for an additional fee.	Cappadocia Valley	Cappadocia	2025-06-09	06:00:00	180.00	300	Festival	image-1771684139605-854374075.avif	1	2026-01-31 10:17:50.93	0	SkyHigh Adventures	t
4	Bruno Major	Intimate acoustic performance by British singer-songwriter Bruno Major. Known for his soulful voice and heartfelt lyrics, Bruno will perform songs from his latest album along with fan favorites in this special solo concert.	Jakarta Convention Center	Jakarta	2026-09-29	20:00:00	125.00	136	Concert	bruno_major.jpg	2	2026-01-09 08:56:29.947	13	Paradigm Talent Agency	f
6	Draculas Vampire Ball	Step into the mysterious world of Transylvania at this gothic-themed costume ball. Enjoy live entertainment, traditional Romanian cuisine, and dancing in the legendary Bran Castle. Costumes encouraged but not required.	Bran Castle	Bran Castle	2026-10-28	19:00:00	150.00	76	Party	dracula_vampire_ball.jpg	2	2026-01-09 08:56:29.947	2	Dark Arts Entertainment	f
1	Hamilton the Musical	Experience the revolutionary musical that tells the story of Alexander Hamilton, one of Americas founding fathers. This acclaimed Broadway production combines hip-hop, jazz, and R&B to create an unforgettable theatrical experience.	Broadway Theater	New York	2026-12-10	19:30:00	75.00	500	Theater	hamilton_musical.jpg	1	2026-01-09 08:56:29.947	0	Broadway Touring Productions	f
2	Alexandre Pallas Seminar	Join renowned speaker Alexandre Pallas for an inspiring seminar on leadership, innovation, and personal development. Learn practical strategies for success in business and life from one of todays most influential thought leaders.	Conference Center Madrid	Madrid	2026-05-01	14:00:00	0.00	285	Seminar	alexandre_pallas.jpg	1	2026-01-09 08:56:29.947	1	Alexandre Pallas Official	f
5	Plavia Auto Show	The ultimate automotive exhibition featuring the latest luxury cars, concept vehicles, and classic automobiles. Meet industry experts, test drive new models, and witness the unveiling of next years most anticipated vehicles.	Plavia Romania Exhibition Hall	Plavia Romania	2026-08-31	10:00:00	30.00	100	Exhibition	plavia_auto_show.jpg	2	2026-01-09 08:56:29.947	3	Plavia Automotive Group	t
15	Contemporary Art Showcase	Step into the world of contemporary art at our exclusive showcase featuring modern sculptures, installations, and interactive exhibits.\r\nOpen daily from 10:00 AM to 8:00 PM. Don't miss this celebration of modern creativity!	Galateca Gallery	București	2028-05-07	10:00:00	45.00	200	Exhibition	image-1771668133361-266102499.avif	1	2026-02-19 15:15:38.234	0	ArtHouse Events	f
14	Cinque Terre Coastal Experience	Explore the stunning colorful villages of Cinque Terre on this guided coastal adventure! Walk through picturesque rainbow-colored houses perched on dramatic cliffs, swim in crystal-clear turquoise waters, taste authentic Italian cuisine at seaside restaurants, and visit all five villages by scenic train. Includes professional photography spots, local wine tasting, and sunset viewing from the best vantage points. Transportation between villages and lunch included.	Manarola Village	Cinque Terre	2025-04-13	10:00:00	95.00	150	General	image-1771685007039-913881194.avif	1	2026-02-19 11:08:42.55	0	Italian Coastal Tours	t
3	Outdoor Cinema	Watch your favorite movies under the stars in this magical outdoor cinema experience. Bring your blankets and enjoy classic films in a beautiful natural setting with premium sound quality and comfortable seating.	Plaja Cannes	Cannes	2026-08-10	21:00:00	30.00	204	Cinema	outdoor_cinema.jpg	1	2026-01-09 08:56:29.947	16	Open Air Cinema Co.	t
18	Mountain Sounds Festival	Music festival in the heart of nature! Romanian and international artists, equipped camping area, spectacular mountain views. 3 days of live music, art, morning yoga, and outdoor activities. Unforgettable experience in the heart of the Carpathians!	Ciucaș Domain	Brașov	2028-06-16	12:00:00	180.00	520	Concert	image-1771946998004-144260192.avif	1	2026-02-24 15:25:54.452	0	Mountain Music Romania	t
16	Venetian Masquerade Ball	Step into a world of mystery and elegance at our Venetian Masquerade Ball. Wear your finest masks and costumes for an unforgettable evening of dancing, live classical music, and Venetian-inspired cuisine. Traditional mask-making workshop included before the ball. Dress code: Formal attire with masks required.	Grand Ballroom Vienna	Vienna	2028-01-25	20:00:00	120.00	460	Party	image-1771682675567-396877288.avif	1	2026-02-19 15:21:31.969	0	Venice Carnival Productions	t
12	Autumn Fair & Carnival	Experience the magic of autumn at our traditional fair featuring carnival rides, food stalls, live entertainment, and family fun!\r\nFrom afternoon golden hour to evening lights, enjoy a perfect day out with family and friends. Free entry for children under 5!	Parcul Herăstrău	București	2027-08-28	14:45:00	25.00	0	Festival	image-1771670236831-366994667.jpeg	1	2026-01-30 14:29:09.64	3	Festival Works	f
\.


--
-- Data for Name: event_layouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_layouts (event_layout_id, event_id, layout_id, created_at) FROM stdin;
2	3	3	2026-02-11 21:16:18.428
3	5	4	2026-02-11 21:18:22.808
4	13	5	2026-02-11 21:26:49.814
6	14	7	2026-02-19 11:08:42.589
10	18	11	2026-02-24 15:25:54.482
18	16	14	2026-03-26 18:38:51.071873
\.


--
-- Data for Name: event_zone_pricing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_zone_pricing (pricing_id, event_id, zone_id, price, created_at) FROM stdin;
6	3	7	30.00	2026-02-11 21:16:18.428
5	3	6	60.00	2026-02-11 21:16:18.428
4	3	5	90.00	2026-02-11 21:16:18.428
9	5	10	30.00	2026-02-11 21:18:22.808
8	5	9	60.00	2026-02-11 21:18:22.808
7	5	8	90.00	2026-02-11 21:18:22.808
12	13	13	30.00	2026-02-11 21:26:49.814
11	13	12	60.00	2026-02-11 21:26:49.814
10	13	11	90.00	2026-02-11 21:26:49.814
16	14	17	30.00	2026-02-19 11:08:42.589
17	14	18	20.00	2026-02-19 11:08:42.589
18	14	19	10.00	2026-02-19 11:08:42.589
28	18	29	120.00	2026-02-24 15:25:54.482
29	18	30	80.00	2026-02-24 15:25:54.482
30	18	31	40.00	2026-02-24 15:25:54.482
58	16	39	360.00	2026-03-26 18:38:51.071873
59	16	40	240.00	2026-03-26 18:38:51.071873
60	16	41	120.00	2026-03-26 18:38:51.071873
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (favorite_id, user_id, event_id, added_at) FROM stdin;
7	3	3	2026-01-09 08:56:29.948
8	2	3	2026-01-09 08:56:29.948
9	2	6	2026-01-09 08:56:29.948
16	1	2	2026-01-29 10:41:44.898
21	1	6	2026-02-24 11:59:44.988
1	1	3	2026-03-27 17:40:20.75587
\.


--
-- Data for Name: layout_rows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.layout_rows (row_id, layout_id, zone_id, row_letter, seats_in_row, row_order, created_at) FROM stdin;
1	1	1	A	10	0	2026-02-06 11:20:33.867
2	2	2	A	20	0	2026-02-06 11:22:18.04
3	2	2	B	20	1	2026-02-06 11:22:18.04
4	2	2	C	19	2	2026-02-06 11:22:18.04
5	2	3	D	20	3	2026-02-06 11:22:18.04
6	2	3	E	20	4	2026-02-06 11:22:18.04
7	2	3	F	20	5	2026-02-06 11:22:18.04
8	2	3	G	20	6	2026-02-06 11:22:18.04
9	2	3	H	19	7	2026-02-06 11:22:18.04
10	2	4	I	20	8	2026-02-06 11:22:18.04
11	2	4	J	20	9	2026-02-06 11:22:18.04
12	3	5	A	20	0	2026-02-11 21:16:18.406
13	3	5	B	20	1	2026-02-11 21:16:18.406
14	3	5	C	20	2	2026-02-11 21:16:18.406
15	3	5	D	1	3	2026-02-11 21:16:18.406
16	3	6	E	20	4	2026-02-11 21:16:18.406
17	3	6	F	20	5	2026-02-11 21:16:18.406
18	3	6	G	20	6	2026-02-11 21:16:18.406
19	3	6	H	20	7	2026-02-11 21:16:18.406
20	3	6	I	20	8	2026-02-11 21:16:18.406
21	3	6	J	2	9	2026-02-11 21:16:18.406
22	3	7	K	20	10	2026-02-11 21:16:18.406
23	3	7	L	20	11	2026-02-11 21:16:18.406
24	3	7	M	1	12	2026-02-11 21:16:18.406
25	4	8	A	20	0	2026-02-11 21:18:22.793
26	4	8	B	10	1	2026-02-11 21:18:22.793
27	4	9	C	20	2	2026-02-11 21:18:22.793
28	4	9	D	20	3	2026-02-11 21:18:22.793
29	4	9	E	10	4	2026-02-11 21:18:22.793
30	4	10	F	20	5	2026-02-11 21:18:22.793
47	8	20	A	20	0	2026-02-19 15:15:38.256
48	8	20	B	10	1	2026-02-19 15:15:38.256
49	8	21	C	20	2	2026-02-19 15:15:38.256
50	8	21	D	20	3	2026-02-19 15:15:38.256
51	8	21	E	10	4	2026-02-19 15:15:38.256
52	8	22	F	20	5	2026-02-19 15:15:38.256
57	6	14	A	20	1	2026-02-21 14:16:38.355
58	6	14	B	20	2	2026-02-21 14:16:38.357
59	6	14	C	20	3	2026-02-21 14:16:38.357
60	6	14	D	20	4	2026-02-21 14:16:38.358
61	6	14	E	20	5	2026-02-21 14:16:38.358
62	6	14	F	20	6	2026-02-21 14:16:38.359
63	6	14	G	20	7	2026-02-21 14:16:38.36
64	6	14	H	20	8	2026-02-21 14:16:38.361
65	6	14	I	20	9	2026-02-21 14:16:38.361
66	6	14	J	20	10	2026-02-21 14:16:38.362
67	6	14	K	20	11	2026-02-21 14:16:38.362
68	6	14	L	20	12	2026-02-21 14:16:38.362
69	6	14	M	20	13	2026-02-21 14:16:38.363
70	6	14	N	20	14	2026-02-21 14:16:38.363
71	6	14	O	20	15	2026-02-21 14:16:38.364
72	6	14	P	20	16	2026-02-21 14:16:38.365
73	6	14	Q	20	17	2026-02-21 14:16:38.365
74	6	14	R	20	18	2026-02-21 14:16:38.366
75	6	14	S	20	19	2026-02-21 14:16:38.366
76	6	14	T	20	20	2026-02-21 14:16:38.366
77	6	14	U	20	21	2026-02-21 14:16:38.367
78	6	14	V	20	22	2026-02-21 14:16:38.367
79	6	14	W	20	23	2026-02-21 14:16:38.368
80	6	14	X	20	24	2026-02-21 14:16:38.368
81	6	14	Y	20	25	2026-02-21 14:16:38.369
82	5	11	A	20	1	2026-02-21 14:48:19.661
83	5	11	B	20	2	2026-02-21 14:48:19.663
84	5	11	C	20	3	2026-02-21 14:48:19.663
85	5	11	D	20	4	2026-02-21 14:48:19.663
86	5	11	E	20	5	2026-02-21 14:48:19.664
87	5	11	F	20	6	2026-02-21 14:48:19.664
88	5	11	G	20	7	2026-02-21 14:48:19.664
89	5	11	H	20	8	2026-02-21 14:48:19.665
90	5	11	I	20	9	2026-02-21 14:48:19.665
91	5	11	J	20	10	2026-02-21 14:48:19.665
92	5	11	K	20	11	2026-02-21 14:48:19.666
93	5	11	L	20	12	2026-02-21 14:48:19.666
94	5	11	M	20	13	2026-02-21 14:48:19.667
95	5	11	N	20	14	2026-02-21 14:48:19.667
96	5	11	O	20	15	2026-02-21 14:48:19.668
97	7	17	A	20	1	2026-02-21 14:49:37.441
98	7	17	B	20	2	2026-02-21 14:49:37.442
99	7	17	C	20	3	2026-02-21 14:49:37.443
100	7	17	D	20	4	2026-02-21 14:49:37.443
101	7	17	E	20	5	2026-02-21 14:49:37.444
102	7	17	F	20	6	2026-02-21 14:49:37.444
103	7	17	G	20	7	2026-02-21 14:49:37.444
104	7	17	H	10	8	2026-02-21 14:49:37.445
105	10	26	A	20	0	2026-02-24 15:22:39.588
106	10	26	B	10	1	2026-02-24 15:22:39.588
107	10	27	C	20	2	2026-02-24 15:22:39.588
108	10	27	D	20	3	2026-02-24 15:22:39.588
109	10	27	E	10	4	2026-02-24 15:22:39.588
110	10	28	F	20	5	2026-02-24 15:22:39.588
117	12	32	A	20	0	2026-02-24 15:32:09.879
118	12	32	B	10	1	2026-02-24 15:32:09.879
119	12	33	C	20	2	2026-02-24 15:32:09.879
120	12	33	D	20	3	2026-02-24 15:32:09.879
121	12	33	E	10	4	2026-02-24 15:32:09.879
122	12	34	F	20	5	2026-02-24 15:32:09.879
123	11	29	A	20	1	2026-02-24 16:56:33.839
124	11	29	B	20	2	2026-02-24 16:56:33.84
125	11	29	C	20	3	2026-02-24 16:56:33.841
126	11	29	D	20	4	2026-02-24 16:56:33.841
127	11	29	E	20	5	2026-02-24 16:56:33.842
128	11	29	F	20	6	2026-02-24 16:56:33.842
129	11	29	G	20	7	2026-02-24 16:56:33.843
130	11	29	H	20	8	2026-02-24 16:56:33.843
131	11	29	I	20	9	2026-02-24 16:56:33.844
132	11	29	J	20	10	2026-02-24 16:56:33.845
133	11	29	K	20	11	2026-02-24 16:56:33.846
134	11	29	L	20	12	2026-02-24 16:56:33.846
135	11	29	M	20	13	2026-02-24 16:56:33.847
136	11	29	N	20	14	2026-02-24 16:56:33.847
137	11	29	O	20	15	2026-02-24 16:56:33.848
138	11	29	P	20	16	2026-02-24 16:56:33.848
139	11	29	Q	20	17	2026-02-24 16:56:33.848
140	11	29	R	20	18	2026-02-24 16:56:33.849
141	11	29	S	20	19	2026-02-24 16:56:33.85
142	11	29	T	20	20	2026-02-24 16:56:33.85
143	11	29	U	20	21	2026-02-24 16:56:33.851
144	11	29	V	20	22	2026-02-24 16:56:33.851
145	11	29	W	20	23	2026-02-24 16:56:33.852
146	11	29	X	20	24	2026-02-24 16:56:33.852
147	11	29	Y	20	25	2026-02-24 16:56:33.853
148	11	29	Z	20	26	2026-02-24 16:56:33.854
279	9	23	A	20	1	2026-03-25 10:01:22.055443
280	9	23	B	20	2	2026-03-25 10:01:22.05697
281	9	23	C	20	3	2026-03-25 10:01:22.057617
282	9	23	D	20	4	2026-03-25 10:01:22.058289
283	9	23	E	20	5	2026-03-25 10:01:22.058822
284	9	23	F	20	6	2026-03-25 10:01:22.059449
285	9	23	G	20	7	2026-03-25 10:01:22.0601
286	9	23	H	20	8	2026-03-25 10:01:22.060616
287	9	23	I	20	9	2026-03-25 10:01:22.061012
288	9	23	J	20	10	2026-03-25 10:01:22.061411
289	9	23	K	20	11	2026-03-25 10:01:22.061729
290	9	23	L	20	12	2026-03-25 10:01:22.062372
291	9	23	M	20	13	2026-03-25 10:01:22.062733
292	9	23	N	20	14	2026-03-25 10:01:22.063029
293	9	23	O	20	15	2026-03-25 10:01:22.063302
294	9	23	P	20	16	2026-03-25 10:01:22.063588
295	9	23	Q	20	17	2026-03-25 10:01:22.063871
296	9	23	R	20	18	2026-03-25 10:01:22.064181
297	9	23	S	20	19	2026-03-25 10:01:22.064462
298	9	23	T	20	20	2026-03-25 10:01:22.064722
299	9	23	U	20	21	2026-03-25 10:01:22.065007
300	9	23	V	20	22	2026-03-25 10:01:22.06529
301	9	23	W	20	23	2026-03-25 10:01:22.06556
604	13	38	A	30	1	2026-03-26 18:32:44.216861
605	13	38	B	30	2	2026-03-26 18:32:44.216861
606	13	38	C	30	3	2026-03-26 18:32:44.216861
607	13	38	D	30	4	2026-03-26 18:32:44.216861
608	13	38	E	30	5	2026-03-26 18:32:44.216861
609	13	38	F	30	6	2026-03-26 18:32:44.216861
610	13	38	G	30	7	2026-03-26 18:32:44.216861
611	13	38	H	30	8	2026-03-26 18:32:44.216861
612	13	38	I	30	9	2026-03-26 18:32:44.216861
613	13	38	J	30	10	2026-03-26 18:32:44.216861
614	13	38	K	30	11	2026-03-26 18:32:44.216861
615	13	38	L	30	12	2026-03-26 18:32:44.216861
616	13	38	M	30	13	2026-03-26 18:32:44.216861
617	13	38	N	30	14	2026-03-26 18:32:44.216861
618	13	38	O	30	15	2026-03-26 18:32:44.216861
619	13	38	P	30	16	2026-03-26 18:32:44.216861
620	13	38	Q	30	17	2026-03-26 18:32:44.216861
621	13	38	R	30	18	2026-03-26 18:32:44.216861
622	13	38	S	30	19	2026-03-26 18:32:44.216861
623	13	38	T	30	20	2026-03-26 18:32:44.216861
624	13	35	U	12	21	2026-03-26 18:32:44.216861
625	13	35	V	12	22	2026-03-26 18:32:44.216861
626	13	35	W	12	23	2026-03-26 18:32:44.216861
627	13	35	X	12	24	2026-03-26 18:32:44.216861
628	13	36	Y	28	25	2026-03-26 18:32:44.216861
629	13	36	Z	28	26	2026-03-26 18:32:44.216861
630	13	36	AA	28	27	2026-03-26 18:32:44.216861
631	13	36	AB	28	28	2026-03-26 18:32:44.216861
632	13	37	AC	28	29	2026-03-26 18:32:44.216861
633	13	37	AD	28	30	2026-03-26 18:32:44.216861
634	13	37	AE	28	31	2026-03-26 18:32:44.216861
635	14	41	A	22	1	2026-03-26 18:32:44.216861
636	14	41	B	22	2	2026-03-26 18:32:44.216861
637	14	41	C	22	3	2026-03-26 18:32:44.216861
638	14	41	D	22	4	2026-03-26 18:32:44.216861
639	14	41	E	22	5	2026-03-26 18:32:44.216861
640	14	41	F	22	6	2026-03-26 18:32:44.216861
641	14	41	G	22	7	2026-03-26 18:32:44.216861
642	14	41	H	22	8	2026-03-26 18:32:44.216861
643	14	41	I	22	9	2026-03-26 18:32:44.216861
644	14	41	J	22	10	2026-03-26 18:32:44.216861
645	14	41	K	22	11	2026-03-26 18:32:44.216861
646	14	41	L	22	12	2026-03-26 18:32:44.216861
647	14	41	M	22	13	2026-03-26 18:32:44.216861
648	14	41	N	22	14	2026-03-26 18:32:44.216861
649	14	41	O	22	15	2026-03-26 18:32:44.216861
650	14	41	P	22	16	2026-03-26 18:32:44.216861
651	14	39	Q	14	17	2026-03-26 18:32:44.216861
652	14	39	R	14	18	2026-03-26 18:32:44.216861
653	14	39	S	14	19	2026-03-26 18:32:44.216861
654	14	40	T	22	20	2026-03-26 18:32:44.216861
655	14	40	U	22	21	2026-03-26 18:32:44.216861
656	14	40	V	22	22	2026-03-26 18:32:44.216861
657	15	44	A	20	1	2026-03-26 18:32:44.216861
658	15	44	B	20	2	2026-03-26 18:32:44.216861
659	15	44	C	20	3	2026-03-26 18:32:44.216861
660	15	44	D	20	4	2026-03-26 18:32:44.216861
661	15	44	E	20	5	2026-03-26 18:32:44.216861
662	15	44	F	20	6	2026-03-26 18:32:44.216861
663	15	44	G	20	7	2026-03-26 18:32:44.216861
664	15	44	H	20	8	2026-03-26 18:32:44.216861
665	15	44	I	20	9	2026-03-26 18:32:44.216861
666	15	44	J	20	10	2026-03-26 18:32:44.216861
667	15	44	K	20	11	2026-03-26 18:32:44.216861
668	15	44	L	20	12	2026-03-26 18:32:44.216861
669	15	44	M	20	13	2026-03-26 18:32:44.216861
670	15	44	N	20	14	2026-03-26 18:32:44.216861
671	15	44	O	20	15	2026-03-26 18:32:44.216861
672	15	44	P	20	16	2026-03-26 18:32:44.216861
673	15	44	Q	20	17	2026-03-26 18:32:44.216861
674	15	44	R	20	18	2026-03-26 18:32:44.216861
675	15	44	S	20	19	2026-03-26 18:32:44.216861
676	15	44	T	20	20	2026-03-26 18:32:44.216861
677	15	43	U	20	21	2026-03-26 18:32:44.216861
678	15	43	V	20	22	2026-03-26 18:32:44.216861
679	15	43	W	20	23	2026-03-26 18:32:44.216861
532	16	45	A	20	1	2026-03-26 18:30:17.166689
533	16	45	B	20	2	2026-03-26 18:30:17.167834
534	16	45	C	20	3	2026-03-26 18:30:17.168344
535	16	45	D	20	4	2026-03-26 18:30:17.168909
536	16	45	E	20	5	2026-03-26 18:30:17.169507
537	16	45	F	20	6	2026-03-26 18:30:17.169984
538	16	45	G	20	7	2026-03-26 18:30:17.170341
539	16	45	H	20	8	2026-03-26 18:30:17.170816
540	16	45	I	20	9	2026-03-26 18:30:17.171316
541	16	45	J	20	10	2026-03-26 18:30:17.171773
542	16	45	K	20	11	2026-03-26 18:30:17.172094
543	16	45	L	20	12	2026-03-26 18:30:17.172402
544	16	45	M	20	13	2026-03-26 18:30:17.172679
545	16	45	N	20	14	2026-03-26 18:30:17.172934
546	16	45	O	20	15	2026-03-26 18:30:17.173189
547	16	45	P	20	16	2026-03-26 18:30:17.173496
548	16	45	Q	20	17	2026-03-26 18:30:17.173758
549	16	45	R	20	18	2026-03-26 18:30:17.174004
550	16	45	S	20	19	2026-03-26 18:30:17.174262
551	16	45	T	20	20	2026-03-26 18:30:17.174516
552	16	45	U	20	21	2026-03-26 18:30:17.174756
553	16	45	V	20	22	2026-03-26 18:30:17.174995
554	16	45	W	20	23	2026-03-26 18:30:17.175254
555	16	45	X	20	24	2026-03-26 18:30:17.175531
556	16	45	Y	20	25	2026-03-26 18:30:17.175812
557	16	45	Z	20	26	2026-03-26 18:30:17.176345
558	16	45	AA	20	27	2026-03-26 18:30:17.176661
559	16	45	AB	20	28	2026-03-26 18:30:17.176963
560	16	45	AC	20	29	2026-03-26 18:30:17.177223
561	16	45	AD	20	30	2026-03-26 18:30:17.177482
680	15	43	X	20	24	2026-03-26 18:32:44.216861
681	15	43	Y	20	25	2026-03-26 18:32:44.216861
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.newsletter_subscribers (subscriber_id, email, subscribed_at, is_active) FROM stdin;
1	delaiemma0@gmail.com	2026-02-26 16:15:56.551	t
2	delaiemma6@gmail.com	2026-02-26 16:22:07.207	t
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, user_id, event_id, type, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (payment_id, purchase_id, user_id, stripe_payment_intent_id, stripe_client_secret, amount, currency, status, payment_method_type, last_payment_error, created_at, updated_at, completed_at) FROM stdin;
1	\N	1	pi_3T1RlWF1Dg2siotp0272nqf7	pi_3T1RlWF1Dg2siotp0272nqf7_secret_ypy1qBhqQYO6Eo7uVP6iYpcwu	150.00	ron	pending	\N	\N	2026-02-16 13:23:06.882	2026-02-16 13:23:06.882	\N
2	\N	1	pi_3T1lSIF1Dg2siotp1ozlvEuh	pi_3T1lSIF1Dg2siotp1ozlvEuh_secret_8kWGy3norJYwrGuqNcd0aKwrG	60.00	ron	pending	\N	\N	2026-02-17 10:24:34.829	2026-02-17 10:24:34.829	\N
3	\N	1	pi_3T1lUfF1Dg2siotp1pPX4ZHS	pi_3T1lUfF1Dg2siotp1pPX4ZHS_secret_PXrVqffszd8cQZdbBuaWhnAp2	60.00	ron	pending	\N	\N	2026-02-17 10:27:01.667	2026-02-17 10:27:01.667	\N
4	33	1	pi_3T1lZIF1Dg2siotp0U2LHUAB	pi_3T1lZIF1Dg2siotp0U2LHUAB_secret_uASKHEOpFA5x8RnMiV79CBk4M	60.00	ron	succeeded	\N	\N	2026-02-17 10:31:48.906	2026-02-17 10:33:27.406	2026-02-17 10:33:27.364
5	34	1	pi_3T1lcXF1Dg2siotp1msAEq9u	pi_3T1lcXF1Dg2siotp1msAEq9u_secret_h7yofLTirEE5Y4ehR8gOeKD5i	60.00	ron	succeeded	\N	\N	2026-02-17 10:35:09.608	2026-02-17 10:35:26.112	2026-02-17 10:35:26.073
6	35	1	pi_3T1luQF1Dg2siotp1a1fHFKZ	pi_3T1luQF1Dg2siotp1a1fHFKZ_secret_uCO0BHEdhH0XexFrOvfSO91xK	60.00	ron	succeeded	\N	\N	2026-02-17 10:53:38.949	2026-02-17 10:53:52.486	2026-02-17 10:53:52.422
7	36	1	pi_3T1m1lF1Dg2siotp14K5U3y1	pi_3T1m1lF1Dg2siotp14K5U3y1_secret_hZ5gMsbDbxKSIYRjDlbvXAszT	60.00	ron	succeeded	\N	\N	2026-02-17 11:01:13.884	2026-02-17 11:01:24.209	2026-02-17 11:01:24.165
8	37	1	pi_3T1n4rF1Dg2siotp1Lop8bFK	pi_3T1n4rF1Dg2siotp1Lop8bFK_secret_IKZwQyr70hB3oXlEUwDMpJvI7	60.00	ron	succeeded	\N	\N	2026-02-17 12:08:30.017	2026-02-17 12:08:44.085	2026-02-17 12:08:44.025
9	38	4	pi_3T1nEJF1Dg2siotp1hwahOGR	pi_3T1nEJF1Dg2siotp1hwahOGR_secret_8E1cTXl26UPNBVsjbQuQucW6D	60.00	ron	succeeded	\N	\N	2026-02-17 12:18:15.578	2026-02-17 12:18:28.001	2026-02-17 12:18:27.962
10	39	4	pi_3T1qHGF1Dg2siotp1JFFIqEw	pi_3T1qHGF1Dg2siotp1JFFIqEw_secret_r2C7xh7geIcypMOmJvTa3gjGP	60.00	ron	succeeded	\N	\N	2026-02-17 15:33:31.095	2026-02-17 15:34:10.716	2026-02-17 15:34:10.67
11	40	4	pi_3T1qQtF1Dg2siotp1ZoDD7iG	pi_3T1qQtF1Dg2siotp1ZoDD7iG_secret_cpXp8j9O2lKjUUQz9pjaQxf6p	60.00	ron	succeeded	\N	\N	2026-02-17 15:43:27.591	2026-02-17 15:43:48.141	2026-02-17 15:43:48.068
12	41	4	pi_3T1qX3F1Dg2siotp0n1ucjqV	pi_3T1qX3F1Dg2siotp0n1ucjqV_secret_Xow0jtbUAQ2DYa1l4Z4vJABML	60.00	ron	succeeded	\N	\N	2026-02-17 15:49:50.168	2026-02-17 15:50:09.05	2026-02-17 15:50:08.978
13	42	1	pi_3T3DEqF1Dg2siotp0nOhTYSS	pi_3T3DEqF1Dg2siotp0nOhTYSS_secret_72iMLheYEtghbqbNLNfsItkpf	45.00	ron	succeeded	\N	\N	2026-02-21 10:16:40.566	2026-02-21 10:16:53.792	2026-02-21 10:16:53.729
14	43	1	pi_3T3DZ3F1Dg2siotp1ZefBT8H	pi_3T3DZ3F1Dg2siotp1ZefBT8H_secret_tuVLJFdrV2MWMdvdUzRFJu23z	45.00	ron	succeeded	\N	\N	2026-02-21 10:37:33.73	2026-02-21 10:37:48.267	2026-02-21 10:37:48.224
15	44	1	pi_3T3DbcF1Dg2siotp0505GvPe	pi_3T3DbcF1Dg2siotp0505GvPe_secret_nDxlE66LEk3g9aIdRPVA7d1nK	25.00	ron	succeeded	\N	\N	2026-02-21 10:40:12.452	2026-02-21 10:40:27.514	2026-02-21 10:40:27.48
16	45	1	pi_3T3HpUF1Dg2siotp0ILQcyik	pi_3T3HpUF1Dg2siotp0ILQcyik_secret_akG1M9louLIPPVHWBLDTVbeXW	60.00	ron	succeeded	\N	\N	2026-02-21 15:10:48.218	2026-02-21 15:11:02.118	2026-02-21 15:11:02.054
17	46	1	pi_3T3Hy5F1Dg2siotp0IcIPLIu	pi_3T3Hy5F1Dg2siotp0IcIPLIu_secret_caYQHui7wLgcqMhrrPJH23GMS	60.00	ron	succeeded	\N	\N	2026-02-21 15:19:41.53	2026-02-21 15:19:57.071	2026-02-21 15:19:57.011
18	47	1	pi_3T3LhYF1Dg2siotp1vUdm0HZ	pi_3T3LhYF1Dg2siotp1vUdm0HZ_secret_2OeXBNuIDvkqALmlyOAErSyLa	60.00	ron	succeeded	\N	\N	2026-02-21 19:18:52.406	2026-02-21 19:19:11.905	2026-02-21 19:19:11.859
19	48	1	pi_3T3LlTF1Dg2siotp0E3NpGyB	pi_3T3LlTF1Dg2siotp0E3NpGyB_secret_1kCAcoM9tVze85UaXH4x7PJXz	60.00	ron	succeeded	\N	\N	2026-02-21 19:22:55.717	2026-02-21 19:23:08.872	2026-02-21 19:23:08.814
20	\N	1	pi_3T3MQBF1Dg2siotp0Xu58C8l	pi_3T3MQBF1Dg2siotp0Xu58C8l_secret_73HEqvJL7j6Vj1bkPqt7TDNTE	60.00	ron	pending	\N	\N	2026-02-21 20:05:00.082	2026-02-21 20:05:00.082	\N
21	\N	1	pi_3T3MVtF1Dg2siotp0aMEGsvM	pi_3T3MVtF1Dg2siotp0aMEGsvM_secret_5jUvCqSb991KgKbYTwegVMQDj	125.00	ron	pending	\N	\N	2026-02-21 20:10:53.367	2026-02-21 20:10:53.367	\N
22	52	1	pi_3T3MZyF1Dg2siotp0ps2esak	pi_3T3MZyF1Dg2siotp0ps2esak_secret_eablHSYYEPrj5HscXKuYrCjZk	75.00	ron	succeeded	\N	\N	2026-02-21 20:15:06.82	2026-02-21 20:15:18.556	2026-02-21 20:15:18.523
23	53	1	pi_3T3MfbF1Dg2siotp14r2qC5E	pi_3T3MfbF1Dg2siotp14r2qC5E_secret_V3PUSiaMKnfpManEBynXOvvXA	75.00	ron	succeeded	\N	\N	2026-02-21 20:20:55.47	2026-02-21 20:21:07.651	2026-02-21 20:21:07.596
24	54	1	pi_3T3Ms9F1Dg2siotp1MXhqpHd	pi_3T3Ms9F1Dg2siotp1MXhqpHd_secret_n9kFGVsHvyF9OWdW3KeK6XJai	75.00	ron	succeeded	\N	\N	2026-02-21 20:33:53.638	2026-02-21 20:34:05.637	2026-02-21 20:34:05.585
25	55	1	pi_3T4JwJF1Dg2siotp0tRTSXLg	pi_3T4JwJF1Dg2siotp0tRTSXLg_secret_5rN02zno5fYEM6CqS0albqGz3	112.50	ron	succeeded	\N	\N	2026-02-24 11:38:07.63	2026-02-24 11:38:20.578	2026-02-24 11:38:20.24
26	56	1	pi_3T4JzlF1Dg2siotp0lyoNyH6	pi_3T4JzlF1Dg2siotp0lyoNyH6_secret_1gZLjPu0i09Cfi0A3JeeBrQtx	112.50	ron	succeeded	\N	\N	2026-02-24 11:41:41.746	2026-02-24 11:41:56.022	2026-02-24 11:41:55.732
27	57	1	pi_3T4K1iF1Dg2siotp1BdyYrN1	pi_3T4K1iF1Dg2siotp1BdyYrN1_secret_NQltw0BslDjlXofE11vD11kR1	112.50	ron	succeeded	\N	\N	2026-02-24 11:43:42.117	2026-02-24 11:43:53.683	2026-02-24 11:43:53.345
28	58	1	pi_3T4KGSF1Dg2siotp0FMCsWOk	pi_3T4KGSF1Dg2siotp0FMCsWOk_secret_PVJS0acbX0EvO2fnmR4gPi8V9	191.25	ron	succeeded	\N	\N	2026-02-24 11:58:56.632	2026-02-24 11:59:12.158	2026-02-24 11:59:11.817
29	60	1	pi_3TFZFzF1Dg2siotp1cdQFx3J	pi_3TFZFzF1Dg2siotp1cdQFx3J_secret_yDyXMMdZcDPkAieftzmqfwxLH	25.00	ron	succeeded	\N	\N	2026-03-27 14:12:55.887916	2026-03-27 14:13:20.788348	2026-03-27 14:13:20.481609
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (purchase_id, user_id, event_id, quantity, total_price, purchase_date, status, stripe_payment_intent_id) FROM stdin;
1	1	3	1	20.00	2026-01-29 14:31:19.263	active	\N
2	1	5	1	30.00	2026-01-29 14:32:49.655	active	\N
4	1	4	1	125.00	2026-01-29 14:35:17.473	active	\N
5	1	4	1	125.00	2026-01-29 14:38:45.228	active	\N
6	1	4	1	125.00	2026-01-29 14:40:39.98	active	\N
7	1	2	1	0.00	2026-01-29 14:41:12.924	active	\N
8	1	4	1	125.00	2026-01-29 14:42:36.282	active	\N
9	1	4	1	125.00	2026-01-29 14:42:55.473	active	\N
10	1	4	1	125.00	2026-01-29 14:43:17.786	active	\N
11	1	4	1	125.00	2026-01-29 14:44:31.281	active	\N
12	1	4	1	125.00	2026-01-29 14:47:18.253	active	\N
13	1	4	1	125.00	2026-01-29 14:47:59.501	active	\N
14	1	4	1	125.00	2026-01-29 14:49:30.301	active	\N
15	1	4	1	125.00	2026-01-29 19:42:31.888	active	\N
16	1	4	1	125.00	2026-01-29 19:43:18.32	active	\N
17	1	3	1	20.00	2026-01-29 19:52:14.02	active	\N
18	1	4	1	125.00	2026-01-29 19:52:14.02	active	\N
19	4	5	1	30.00	2026-01-30 08:54:15.584	active	\N
21	1	3	1	20.00	2026-01-30 13:30:09.014	active	\N
23	1	12	1	45.00	2026-01-31 10:12:30.086	active	\N
24	1	6	1	150.00	2026-02-05 15:56:03.117	active	\N
25	1	3	1	20.00	2026-02-05 20:59:27.315	active	\N
26	1	3	1	20.00	2026-02-05 21:04:55.11	active	\N
27	1	3	1	50.00	2026-02-06 11:35:34.079	active	\N
28	4	3	1	50.00	2026-02-11 21:39:45.447	active	\N
29	4	3	1	50.00	2026-02-11 21:46:20.612	active	\N
30	1	3	1	90.00	2026-02-15 10:03:49.147	active	\N
31	1	3	1	60.00	2026-02-16 13:29:32.558	active	\N
32	1	3	1	60.00	2026-02-17 10:10:03.881	active	\N
33	1	3	1	60.00	2026-02-17 10:33:27.386	active	pi_3T1lZIF1Dg2siotp0U2LHUAB
34	1	3	1	60.00	2026-02-17 10:35:26.092	cancelled	pi_3T1lcXF1Dg2siotp1msAEq9u
35	1	3	1	60.00	2026-02-17 10:53:52.45	cancelled	pi_3T1luQF1Dg2siotp1a1fHFKZ
36	1	5	1	60.00	2026-02-17 11:01:24.19	active	pi_3T1m1lF1Dg2siotp14K5U3y1
37	1	3	1	60.00	2026-02-17 12:08:44.053	cancelled	pi_3T1n4rF1Dg2siotp1Lop8bFK
38	4	3	1	60.00	2026-02-17 12:18:27.986	active	pi_3T1nEJF1Dg2siotp1hwahOGR
39	4	3	1	60.00	2026-02-17 15:34:10.699	active	pi_3T1qHGF1Dg2siotp1JFFIqEw
40	4	3	1	60.00	2026-02-17 15:43:48.105	active	pi_3T1qQtF1Dg2siotp1ZoDD7iG
41	4	3	1	60.00	2026-02-17 15:50:09.017	active	pi_3T1qX3F1Dg2siotp0n1ucjqV
42	1	12	1	45.00	2026-02-21 10:16:53.755	cancelled	pi_3T3DEqF1Dg2siotp0nOhTYSS
44	1	12	1	25.00	2026-02-21 10:40:27.495	active	pi_3T3DbcF1Dg2siotp0505GvPe
45	1	3	1	60.00	2026-02-21 15:11:02.079	cancelled	\N
46	1	3	1	60.00	2026-02-21 15:19:57.039	cancelled	\N
47	1	3	1	60.00	2026-02-21 19:19:11.883	cancelled	\N
48	1	3	1	60.00	2026-02-21 19:23:08.84	cancelled	\N
3	1	4	1	125.00	2026-01-29 14:35:04.808	cancelled	\N
50	1	2	1	0.00	2026-02-21 20:07:51.858	cancelled	\N
49	1	2	1	0.00	2026-02-21 20:03:29.555	cancelled	\N
52	1	1	1	75.00	2026-02-21 20:15:18.541	cancelled	\N
54	1	1	1	75.00	2026-02-21 20:34:05.601	cancelled	\N
53	1	1	1	75.00	2026-02-21 20:21:07.615	cancelled	\N
51	1	2	1	0.00	2026-02-21 20:09:47.389	cancelled	\N
56	1	6	1	150.00	2026-02-24 11:41:55.998	cancelled	\N
55	1	6	1	150.00	2026-02-24 11:38:20.54	cancelled	\N
57	1	6	1	112.50	2026-02-24 11:43:53.645	cancelled	\N
59	1	6	1	127.50	2026-02-24 11:59:12.106	active	\N
58	1	1	1	63.75	2026-02-24 11:59:12.106	cancelled	\N
43	1	12	1	45.00	2026-02-21 10:37:48.245	cancelled	pi_3T3DZ3F1Dg2siotp1ZefBT8H
60	1	12	1	25.00	2026-03-27 14:13:20.761204	active	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (review_id, user_id, event_id, rating, comment, created_at) FROM stdin;
2	4	5	5	Amazing event, would definitely go again!	2026-02-19 11:46:20.111
1	1	3	5	Great atmosphere and well organized.	2026-02-19 11:47:24.807
\.


--
-- Data for Name: seat_reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seat_reservations (reservation_id, user_id, event_id, row_letter, seat_number, zone_id, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: seat_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seat_zones (zone_id, layout_id, name, color, display_order, created_at, default_price) FROM stdin;
35	13	Lojă	#66BB6A	0	2026-03-25 09:57:27.559647	350.00
39	14	Lojă	#66BB6A	0	2026-03-25 09:57:27.58616	160.00
1	1	VIP	#66BB6A	0	2026-02-06 11:20:33.863	\N
2	2	VIP	#66BB6A	0	2026-02-06 11:22:18.036	\N
5	3	VIP	#66BB6A	0	2026-02-11 21:16:18.402	\N
8	4	VIP	#66BB6A	0	2026-02-11 21:18:22.791	\N
11	5	VIP	#66BB6A	0	2026-02-11 21:26:49.793	\N
14	6	VIP	#66BB6A	0	2026-02-16 13:00:55.077	\N
17	7	VIP	#66BB6A	0	2026-02-19 11:08:42.567	\N
20	8	VIP	#66BB6A	0	2026-02-19 15:15:38.251	\N
23	9	VIP	#66BB6A	0	2026-02-19 15:21:31.985	\N
26	10	VIP	#66BB6A	0	2026-02-24 15:22:39.584	\N
29	11	VIP	#66BB6A	0	2026-02-24 15:25:54.466	\N
32	12	VIP	#66BB6A	0	2026-02-24 15:32:09.877	\N
45	16	VIP	#66BB6A	0	2026-03-26 18:29:57.876725	\N
3	2	Regular	#36A2EB	0	2026-02-06 11:22:18.036	\N
6	3	Regular	#36A2EB	0	2026-02-11 21:16:18.402	\N
9	4	Regular	#36A2EB	0	2026-02-11 21:18:22.791	\N
12	5	Regular	#36A2EB	0	2026-02-11 21:26:49.793	\N
15	6	Regular	#36A2EB	0	2026-02-16 13:00:55.077	\N
18	7	Regular	#36A2EB	0	2026-02-19 11:08:42.567	\N
21	8	Regular	#36A2EB	0	2026-02-19 15:15:38.251	\N
24	9	Regular	#36A2EB	0	2026-02-19 15:21:31.985	\N
27	10	Regular	#36A2EB	0	2026-02-24 15:22:39.584	\N
30	11	Regular	#36A2EB	0	2026-02-24 15:25:54.466	\N
33	12	Regular	#36A2EB	0	2026-02-24 15:32:09.877	\N
46	16	Regular	#36A2EB	0	2026-03-26 18:29:57.876725	\N
4	2	Balcony	#4BC0C0	0	2026-02-06 11:22:18.036	\N
7	3	Balcony	#4BC0C0	0	2026-02-11 21:16:18.402	\N
10	4	Balcony	#4BC0C0	0	2026-02-11 21:18:22.791	\N
13	5	Balcony	#4BC0C0	0	2026-02-11 21:26:49.793	\N
16	6	Balcony	#4BC0C0	0	2026-02-16 13:00:55.077	\N
19	7	Balcony	#4BC0C0	0	2026-02-19 11:08:42.567	\N
22	8	Balcony	#4BC0C0	0	2026-02-19 15:15:38.251	\N
25	9	Balcony	#4BC0C0	0	2026-02-19 15:21:31.985	\N
28	10	Balcony	#4BC0C0	0	2026-02-24 15:22:39.584	\N
31	11	Balcony	#4BC0C0	0	2026-02-24 15:25:54.466	\N
34	12	Balcony	#4BC0C0	0	2026-02-24 15:32:09.877	\N
47	16	Balcony	#4BC0C0	0	2026-03-26 18:29:57.876725	\N
38	13	Parter	#36A2EB	3	2026-03-25 09:57:27.577616	100.00
41	14	Parter	#36A2EB	2	2026-03-25 09:57:27.591269	80.00
44	15	Parter	#36A2EB	1	2026-03-25 09:57:27.600681	100.00
36	13	Balcon I	#4BC0C0	1	2026-03-25 09:57:27.567512	200.00
37	13	Balcon II	#4BC0C0	2	2026-03-25 09:57:27.574594	150.00
40	14	Balcon	#4BC0C0	1	2026-03-25 09:57:27.588503	120.00
43	15	Balcon	#4BC0C0	0	2026-03-25 09:57:27.597942	180.00
\.


--
-- Data for Name: ticket_seats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_seats (ticket_seat_id, purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code, created_at) FROM stdin;
7	1	3	C	15	5	TKT-0001-0003-C15	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALBSURBVO3BQa7jSAwFwXyE7n/lnL/kqgBBsqdNMCL+YY1RrFGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUi4eS8E0qXRJOVJ5IwjepPFGsUYo1SrFGuXiZypuS8EQSOpUnVN6UhDcVa5RijVKsUS4+LAl3qNyh0iWhU+mS0Kk8kYQ7VD6pWKMUa5RijXLx45JwkoROpUtCp/LLijVKsUYp1igXP06lS8IdKpMUa5RijVKsUS4+TOWbVL5J5V9SrFGKNUqxRrl4WRK+KQmdSpeETqVLQqdykoR/WbFGKdYoxRol/uGHJeEOlcmKNUqxRinWKBcPJaFT6ZJwotIl4Q6VkyQ8kYRO5SQJnUqXhBOVJ4o1SrFGKdYoFw+p3KHSJaFTOUnCSRLuSEKn0ql0SehUOpU7VN5UrFGKNUqxRrl4KAknKicqJ0l4QuWJJHQqJ0n4PxVrlGKNUqxRLh5SOUnCiUqXhE7lJAlvSkKn0iXhRKVLwkkSOpUnijVKsUYp1igXDyWhU7kjCSdJOFG5Iwmdyh0qT6h8UrFGKdYoxRol/uGHJaFT6ZJwonKShDtUTpJwovJEsUYp1ijFGuXioSR8k8pJEjqVO5JwotIl4Q6VLglvKtYoxRqlWKNcvEzlTUm4Q6VLQqfyTUnoVDqVNxVrlGKNUqxRLj4sCXeo3KHSJaFT6ZJwotIloUvCSRI6lW8q1ijFGqVYo1z8uCR0KicqJ0noVE6S0KmcJKFTeVOxRinWKMUa5WK4JHQqTyShUzlJQqfyScUapVijFGuUiw9T+SSVO5JwotIloVM5SUKn8k3FGqVYoxRrlIuXJeGbknCi0iXhJAmdykkSOpWTJHQqbyrWKMUapVijxD+sMYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijfIfrlkS+6KizRYAAAAASUVORK5CYII=	2026-02-11 21:16:18.428
8	17	3	B	11	5	TKT-0017-0003-B11	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALbSURBVO3BQW7kQAwEwUxC//9yrY88NSCMNGsTjDA/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrl4kMq35SEE5UuCZ3KSRI6lW9KwieKNUqxRinWKBcPS8KTVE5UTlS6JHQqdyThSSpPKtYoxRqlWKNcvEzljiTckYQTlZMkfELljiS8qVijFGuUYo1yMYzKicpJEv6yYo1SrFGKNcrFH6fSJeFEZbJijVKsUYo1ysXLkvCmJHQqXRJOkvCJJPwmxRqlWKMUa5SLh6l8k0qXhE6lS0Kn0iXhROU3K9YoxRqlWKOYHwyicpKEyYo1SrFGKdYoFx9S6ZLQqXRJ6FS6JHQqXRJOknCHSpeEO1S6JJyodEl4UrFGKdYoxRrl4mVJOElCp9IloVM5ScKJSpeETqVLQqfSJaFTOUnCm4o1SrFGKdYoF1+m0iXhROUOlS4JdyShU+mS0Kl0SThR6ZLwpGKNUqxRijWK+cEHVO5IQqfSJeFE5SQJJyp3JOEOlU8k4RPFGqVYoxRrlIv/LAmdypNUTpJwonJHEjqVLgmdypOKNUqxRinWKOYHf5jKJ5LQqXRJOFHpkvA/FWuUYo1SrFEuPqTyTUnoktCpdEk4UemS8CSVkyQ8qVijFGuUYo1y8bAkPEnljiScqNyh0iXhRKVLQqfypmKNUqxRijXKxctU7kjCHSpdEjqVLgmdyh0qJ0noVLokvKlYoxRrlGKNcvHHJaFTOVHpktCpdEnoVE5UuiR0Kl0SnlSsUYo1SrFGufjjVLokdCpdEjqVLgmdSpeEO1S6JHQqXRI+UaxRijVKsUa5eFkS3pSETuVEpUvCk1S6JHQqbyrWKMUapVijXDxM5ZtUTpJwh0qXhBOVLgmdSpeETuVJxRqlWKMUaxTzgzVGsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxR/gFcMSAMNKx4iAAAAABJRU5ErkJggg==	2026-02-11 21:16:18.428
9	21	3	B	2	5	TKT-0021-0003-B2	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALJSURBVO3BQY7cWAwFwXyE7n/ldO2Gqw8IUvW4aUbED9YYxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGuXgoCT9J5SQJncoTSfhJKk8Ua5RijVKsUS5epvKmJJwkoVPpktCpdEnoVE5U3pSENxVrlGKNUqxRLr4sCXeo3KFyRxLelIQ7VL6pWKMUa5RijXIxTBL+ZcUapVijFGuUi18uCes/xRqlWKMUa5SLL1P5JpU7ktCpPKHyNynWKMUapVijXLwsCT8pCZ1Kl4ROpUtCp3KShL9ZsUYp1ijFGiV+MFgSOpXJijVKsUYp1igXDyWhU+mS0Kl0SehUuiR0Km9KQqdyRxI6lZMkdCpvKtYoxRqlWKPED35QEu5QeSIJJypdEjqVLgmdSpeEE5VvKtYoxRqlWKPED16UhE7ljiScqDyRhE7lJAmdSpeETuUkCZ3Km4o1SrFGKdYo8YMHkvCEyhNJ+CaVO5LwhMoTxRqlWKMUa5SLl6l0SXgiCZ3KicpJEjqVkyTcodIloVPpkvCmYo1SrFGKNUr84BdLwolKl4ROpUtCp3KShE7l/1SsUYo1SrFGuXgoCT9JpVPpknCi0iWhU3lTEu5QeaJYoxRrlGKNcvEylTcl4Q6VkyR0KidJ6FROktCpdEnoVN5UrFGKNUqxRrn4siTcoXJHEu5Q6ZLQqZwkoVM5SUKn8k3FGqVYoxRrlItfTqVLQqfSJaFT6ZLQqdyRhE6lS0Kn8qZijVKsUYo1ysUvl4Q7VE5UuiScqHQqXRI6lS4JncoTxRqlWKMUa5SLL1P5JpU7ktCpPJGEE5UuCd9UrFGKNUqxRrl4WRJ+UhJOVDqVkyR0KidJ6FS6JHQqXRLeVKxRijVKsUaJH6wxijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKN8gcu2SHpbbDoOQAAAABJRU5ErkJggg==	2026-02-11 21:16:18.428
10	25	3	D	1	5	TKT-0025-0003-D1	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKhSURBVO3BQW7sWAwEwSxC979yjpdcPUCQuv3NYUT8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoFw8l4ZtUuiR0KidJOFHpkvBNKk8Ua5RijVKsUS5epvKmJJyonCShU+mScIfKm5LwpmKNUqxRijXKxYcl4Q6VO5LQqXxTEu5Q+aRijVKsUYo1ysUfp9IloVP5PynWKMUapVijXAyj0iWhU5msWKMUa5RijXLxYSqflIQnVJ5Q+ZcUa5RijVKsUS5eloTfpNIl4SQJncpJEv5lxRqlWKMUa5T4g0GScIfKJMUapVijFGuU+IMHktCpdEnoVO5IwonKSRLuUDlJQqdykoROpUtCp/JEsUYp1ijFGiX+4IuScKJykoQnVL4pCScqbyrWKMUapVijXHxYEk5UTpLQqXRJ6FSeSMKbVL6pWKMUa5RijXLxYSpdEk6S0KmcqDyRhE7lJAmdykkSOpUuCZ3KE8UapVijFGuU+IMPSsKbVLoknKjckYQTlS4Jb1J5olijFGuUYo1y8WEqf4nKSRLuUOmS0Km8qVijFGuUYo1y8VASvknlRKVLwhMqTyShU+mS0Kk8UaxRijVKsUa5eJnKm5JwotIloVO5IwldEu5QuUPlTcUapVijFGuUiw9Lwh0qn5SEJ1ROknCHypuKNUqxRinWKBfDJaFTeSIJJyq/qVijFGuUYo1y8ccloVM5ScKJSpeETuUkCU+oPFGsUYo1SrFGufgwlU9S6ZLQqZyonKicJKFTuSMJbyrWKMUapVijXLwsCd+UhE6lS0Kn0iXhRKVLwkkSflOxRinWKMUaJf5gjVGsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5T/AHeOAufgjJanAAAAAElFTkSuQmCC	2026-02-11 21:16:18.428
11	26	3	I	17	6	TKT-0026-0003-I17	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALLSURBVO3BQW7kQAwEwSxC//9yro88NSBIM1jTjIg/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrl4qEkfJPKSRJOVLokdCpdEr5J5YlijVKsUYo1ysXLVN6UhJMknKh0SehU7lB5UxLeVKxRijVKsUa5+LAk3KFyh0qXhDuS0KnckYQ7VD6pWKMUa5RijXLxx6h0SZikWKMUa5RijXLxyyXhJAl/SbFGKdYoxRrl4sNUPkmlS0Kn0iWhU3lC5X9SrFGKNUqxRrl4WRK+KQmdSpeETqVLQqdykoT/WbFGKdYoxRol/mCNUaxRijVKsUa5eCgJnUqXhE6lS0Kn0iWhU7kjCZ1Kl4RO5Y4kdConSehU3lSsUYo1SrFGuXhZEu5Q6ZLQqXRJuEOlS0Kn0iWhU+mS0Kl0SThR+aRijVKsUYo1ysVDKl0STpLQqZwkoVM5ScITKl0SOpUuCZ3KSRI6lTcVa5RijVKsUeIPHkjCicpJEjqVO5LwSSp3JOEJlSeKNUqxRinWKPEHX5SEJ1ROknCHykkS7lDpktCpdEnoVJ4o1ijFGqVYo1x8mcqbkvCmJHQqJ0k4UTlReVOxRinWKMUa5eKhJHyTSqfSJeFEpUtCp/KmJJyovKlYoxRrlGKNcvEylTcl4QmVLgl3JKFTOUlCp9Il4ZOKNUqxRinWKBcfloQ7VO5IwhMqdyThRKVLQqfyScUapVijFGuUi19O5U1J6FS6JHQqXRI6lS4JncqbijVKsUYp1igXv1wSOpUTlTuS0Kl0SehUuiR0Kl0SOpUnijVKsUYp1igXH6bySSpdEjqVb0pCp9Il4ZOKNUqxRinWKBcvS8I3JeGOJHySSpeETqVLwpuKNUqxRinWKPEHa4xijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKP8A8fvFwO7HDa0AAAAAElFTkSuQmCC	2026-02-11 21:16:18.428
12	27	3	B	16	5	TKT-0027-0003-B16	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALUSURBVO3BQarsWAwFwUzh/W/59BtqdMHYLvoLRZg/rDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1y8ZDKLyXhDpU7ktCp/FISnijWKMUapVijXLwsCW9SOVE5ScKJyh1JeJPKm4o1SrFGKdYoFx9TuSMJdyShUzlReZPKHUn4UrFGKdYoxRrlYjiVLgmdyiTFGqVYoxRrlIt/nModKpMVa5RijVKsUS4+loQvJeEOlS4JTyTh/6RYoxRrlGKNcvEylV9S6ZLQqXRJ6FS6JJyo/J8Va5RijVKsUcwfBlPpkjBZsUYp1ijFGuXiIZUuCZ1Kl4ROpUtCp9Il4Y4knKh0SbhDpUvCiUqXhDcVa5RijVKsUS5eptIloVO5IwmdykkSOpWTJHQqXRI6lS4JncpJEr5UrFGKNUqxRrl4KAknKk+onCShU+mS0KmcJKFT6ZLQqXRJOFHpkvCmYo1SrFGKNYr5w4tUTpLQqZwkoVM5SUKn8kQS7lB5IglPFGuUYo1SrFEuPpaEkyScqHRJ6FROktCpdEk4UbkjCZ1Kl4RO5U3FGqVYoxRrlIuXJeFNSfgllS4JJyonSThJwpuKNUqxRinWKBcPqfxSEroknKh0SehUuiS8SeUkCW8q1ijFGqVYo1y8LAlvUrlDpUtCp9Il4USlS8KJSpeETuVLxRqlWKMUa5SLj6nckYQ7VH5JpUvCiUqXhC8Va5RijVKsUS7+cUnoVDqVO1S6JHQqJypdEjqVLglvKtYoxRqlWKNc/ONU7khCp9IloVPpktCpdEnoVLokdCpdEp4o1ijFGqVYo1x8LAlfSsIdKl0S3qTSJaFT+VKxRinWKMUa5eJlKr+kckcSTlS6JNyRhE6lS0Kn8qZijVKsUYo1ivnDGqNYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ij/AQAyGRC5KsEdAAAAAElFTkSuQmCC	2026-02-11 21:16:18.428
13	2	5	C	7	9	TKT-0002-0005-C7	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALUSURBVO3BQW7kQAwEwSxC//9y7hx5akCQxmsTjIgfrDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1y8VASfpLKSRLuUDlJwk9SeaJYoxRrlGKNcvEylTcl4SQJncpJEp5QeVMS3lSsUYo1SrFGufiyJNyhcofK/5SEO1S+qVijFGuUYo1yMVwSOpUuCZ3KX1asUYo1SrFGufjjktCpdCpdEiYr1ijFGqVYo1x8mco3qTyh8oTKb1KsUYo1SrFGuXhZEn5SEjqVLgmdSpeETuUkCb9ZsUYp1ijFGiV+MFgSOpXJijVKsUYp1igXDyWhU+mS0Kl0SehUuiR0KneonCShU7kjCZ3KSRI6lTcVa5RijVKsUeIHX5SEJ1S6JHQqXRLuUOmS0Kl0SehUuiScqHxTsUYp1ijFGiV+8B8l4Q6VLgmdSpeEE5WTJHQqXRI6lZMkdCpvKtYoxRqlWKPED36RJHQqXRI6lZMkPKFyRxKeUHmiWKMUa5RijXLxUBLepNIloVM5SUKn0iWhUzlJwh0qXRI6lS4JbyrWKMUapVijxA/+sCR0KidJ6FSeSEKn8j8Va5RijVKsUS4eSsJPUulU7lDpktCpdEnoVO5Iwh0qTxRrlGKNUqxRLl6m8qYk3JGEO1S6JHQqdyShU+mS0Km8qVijFGuUYo1y8WVJuEPljiR0KnckoVM5ScKJSpeETuWbijVKsUYp1igXf5zKHUnoVLoknKicJKFT6ZLQqbypWKMUa5RijXLxxyXhRKVTeVMSOpUuCZ1Kl4RO5YlijVKsUYo1ysWXqXyTSpeELgmdyh0qXRI6lS4JnUqXhG8q1ijFGqVYo1y8LAk/KQmdSpeEkyScJKFT6ZLQqXRJ6FS6JLypWKMUa5RijRI/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrlH3CmKux3yRsfAAAAAElFTkSuQmCC	2026-02-11 21:18:22.808
14	19	5	E	6	9	TKT-0019-0005-E6	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKOSURBVO3BQW7kQAwEwSxC//9yro88NSBIM2sTjIg/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrl4qEkfJPKE0k4UemS8E0qTxRrlGKNUqxRLl6m8qYk3JGEO1TuUHlTEt5UrFGKNUqxRrn4sCTcoXJHEjqVLgmdSpeETuWOJNyh8knFGqVYoxRrlIvhVLokdCqTFGuUYo1SrFEuhklCp3KShE7lLyvWKMUapVijXHyYyjepdEnoVLokPKHymxRrlGKNUqxRLl6WhMmS8JsVa5RijVKsUS4eUvnNVLok3KHylxRrlGKNUqxRLh5KQqfSJeFNKp3KSRI6lS4JJ0l4k8onFWuUYo1SrFEuPkzlTUnoVLokdCpPqHRJ6FTuSEKn8qZijVKsUYo1ysWXJaFT6ZJwonJHEk5U/qckdCpPFGuUYo1SrFEuHlI5SUKn0iXhROUJlTepPKHSJeFNxRqlWKMUa5SL/0zlJAlPJOFE5ZOS0Kl0Km8q1ijFGqVYo8Qf/GFJOFE5ScKJykkSnlB5U7FGKdYoxRrl4qEkfJNKp9IloUtCp3KicpKETuUkCd9UrFGKNUqxRrl4mcqbknCShE7lk1S6JHQqJyqfVKxRijVKsUa5+LAk3KHyRBJOVO5IQqfSqTyRhE7liWKNUqxRijXKxXAqn5SETuUOlTcVa5RijVKsUS6GUXkiCZ1Kl4TfrFijFGuUYo1y8WEqn6RykoROpVO5Q+VNSehUnijWKMUapVijXLwsCd+UhE6lU+mS0Kl0SbhD5QmVNxVrlGKNUqxR4g/WGMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRvkHuIz/yWPKdHwAAAAASUVORK5CYII=	2026-02-11 21:18:22.808
15	28	3	G	11	6	TKT-0028-0003-G11	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALASURBVO3BQW7ARgwEwR5C//9yx0eeFhAkOTHDqviDNUaxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFEuHkrCb1J5IgknKl0SfpPKE8UapVijFGuUi5epvCkJJ0noVL6k8qYkvKlYoxRrlGKNcvGxJNyhcodKl4RO5UTliSTcofKlYo1SrFGKNcrF/4xKl4RO5S8r1ijFGqVYo1z8cUm4IwmTFWuUYo1SrFEuPqbyJZUuCXeoPKHyX1KsUYo1SrFGuXhZEn5TEjqVLgmdSpeETuUkCf9lxRqlWKMUa5T4g8GS0KlMVqxRijVKsUa5eCgJnUqXhE6lS0Kn0iWhU3lTEjqVO5LQqZwkoVN5U7FGKdYoxRrl4iGVNyWhUzlJQqdykoROpUtCp9IloVPpknCi8qVijVKsUYo1SvzBA0l4QqVLwm9SOUlCp9IloVM5SUKn8qZijVKsUYo1SvzBA0n4ksodSXiTyh1JeELliWKNUqxRijXKxctUTpJwotIloVM5UTlJQqdykoQ7VLokdCpdEt5UrFGKNUqxRok/+MOScKLSJaFT6ZLQqZwkoVP5NxVrlGKNUqxRLh5Kwm9S6VROktCpdEnoVN6UhBOVNxVrlGKNUqxRLl6m8qYkPKHSJeGOJHQqJ0noVLokfKlYoxRrlGKNcvGxJNyhckcSOpUTlS4JdyThRKVLQqfypWKNUqxRijXKxR+ncpKEE5UuCZ3KHUnoVLokdCpvKtYoxRqlWKNc/HFJOFF5IgmdSpeETqVLQqfSJaFTeaJYoxRrlGKNcvExlS+pnCThRKVTeSIJnUqXhC8Va5RijVKsUS5eloTflIRO5UTlSypdEjqVLglvKtYoxRqlWKPEH6wxijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKN8g9EcB3npwUPLAAAAABJRU5ErkJggg==	2026-02-11 21:39:45.447
16	29	3	G	12	6	TKT-0029-0003-G12	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALBSURBVO3BQW7ARgwEwR5C//9yx0eeFhAkOTHDqviDNUaxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFEuHkrCb1J5IgmdykkSfpPKE8UapVijFGuUi5epvCkJJ0noVE5UuiR0Kicqb0rCm4o1SrFGKdYoFx9Lwh0qd6h0SThReVMS7lD5UrFGKdYoxRrlYjiV/5NijVKsUYo1ysUfl4Q7kjBZsUYp1ijFGuXiYypfUnlC5QmV/5JijVKsUYo1ysXLkvCbktCpdEnoVLokdConSfgvK9YoxRqlWKPEHwyShBOVyYo1SrFGKdYoFw8loVPpktCpdEnoVLokdConKnckoVO5IwmdykkSOpU3FWuUYo1SrFEuHlL5kkqXhE6lS8IdKl0SOpUuCZ1Kl4QTlS8Va5RijVKsUS5eloQ7VE6S0KmcqJwk4USlS0Kn0iWhUzlJQqfypmKNUqxRijVK/MGHknCHyhNJeJPKHUl4QuWJYo1SrFGKNcrFQ0noVDqVLgl3JOEJlS4JncpJEu5Q6ZLQqXRJeFOxRinWKMUaJf7gD0tCp9Il4USlS0KncpKETuXfVKxRijVKsUa5eCgJv0mlU7lDpUtCp/KmJJyovKlYoxRrlGKNcvEylTcl4U1J6FROktCpnCShU+mS8KVijVKsUYo1ysXHknCHyh1JOFHpktAloVM5SUKncpKETuVLxRqlWKMUa5SLP07lJAknKl0SOpU7ktCpdEnoVN5UrFGKNUqxRrn445JwovJEEjqVLgmdSpeETqVLQqfyRLFGKdYoxRrl4mMqX1I5ScKJSqfyRBI6lS4JXyrWKMUapVijXLwsCb8pCScqv0mlS0Kn0iXhTcUapVijFGuU+IM1RrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUf4BnQ0c6yQfeHYAAAAASUVORK5CYII=	2026-02-11 21:46:20.612
17	30	3	C	13	5	TKT-0030-0003-C13	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALPSURBVO3BQW7gSAwEwSxC//9yro88NSBI8o4JRsQfrDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1y8VASfpPKE0k4UemS8JtUnijWKMUapVijXLxM5U1JOEnCicqbVN6UhDcVa5RijVKsUS4+loQ7VO5QuUOlS8ITSbhD5UvFGqVYoxRrlIthknCHyiTFGqVYoxRrlIs/LgmdykkSuiR0Kn9ZsUYp1ijFGuXiYypfUjlJwonKEyr/kmKNUqxRijXKxcuS8JuS0KmcqHRJ6FROkvAvK9YoxRqlWKPEH6wxijVKsUYp1igXDyWhU+mS0Kl0SehUuiR0KidJ6FROktCp3JGETuUkCZ3Km4o1SrFGKdYoF/8zlS4JncpJEk6ScKLSJaFT6ZLQqXRJOFH5UrFGKdYoxRrl4iGVO5JwotIl4QmVLgknKl0SOpUuCZ3KSRI6lTcVa5RijVKsUeIPflESOpU3JaFT6ZJwh8odSXhC5YlijVKsUYo1ysXLknCi0iWhU+mS0Kl0SehUuiScqJwk4Q6VLgmdSpeENxVrlGKNUqxRLl6mcofKicpvSkKncpKEE5UTlTcVa5RijVKsUS4eSsJvUulUuiScqHRJ6FTelIQTlTcVa5RijVKsUS5epvKmJNyh0iWhS8IdSehUTpLQqXRJ+FKxRinWKMUa5eJjSbhD5Y4kdCpfSkKncpKETuVLxRqlWKMUa5SLP07lRKVLQqfSJaFTOUnCiUqXhE7lTcUapVijFGuUiz8uCXeo3JGETuVEpUtCp9IloVN5olijFGuUYo1y8TGVL6nckYQ7VLokdCpdEjqVLglfKtYoxRqlWKNcvCwJvykJncodKidJOElCp9IloVPpkvCmYo1SrFGKNUr8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYo/wFfOCH11v2U2AAAAABJRU5ErkJggg==	2026-02-15 10:03:49.147
18	31	3	G	13	6	TKT-0031-0003-G13	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALBSURBVO3BQa6jAAwFwW6L+1/5TZZeISEg82O5ynywxijWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFGKNcrBTSrflIRvUvmmJNxRrFGKNUqxRjl4WBKepHJG5Y4kXJGEJ6k8qVijFGuUYo1y8DKVK5JwRRLOqLxJ5YokvKlYoxRrlGKNcjCMypkkTFasUYo1SrFGOfhxKleonEnCLyvWKMUapVijHLwsCW9KQqdyRRLuSMJfUqxRijVKsUY5eJjKN6l0SehUuiR0Kl0Szqj8ZcUapVijFGsU88FgKl0SJivWKMUapVijHNyk0iWhU+mS0Kl0SehUuiScUblCpUvCFSpdEs6odEl4UrFGKdYoxRrFfPAilTNJ6FS6JDxJpUtCp9IloVPpktCpnEnCm4o1SrFGKdYoBzepXJGETuWMyh1JuCIJnUqXhE6lS8IZlS4JTyrWKMUapVijmA/+EJUuCZ3KNyXhCpU7knBHsUYp1ijFGuXgZSpnktAloVPpknCHSpeEMypXJKFT6ZLQqTypWKMUa5RijWI++GEqXRI6lTNJ6FS6JJxR6ZLwPxVrlGKNUqxRDm5S+aYkdEnoVLoknFHpkvAklTNJeFKxRinWKMUa5eBhSXiSyh0qd6h0STij0iWhU3lTsUYp1ijFGuXgZSpXJOEKlS4JZ1TuUDmThE6lS8KbijVKsUYp1igHPy4JncoVSehUuiR0Kl0SOpUuCZ1Kl4QnFWuUYo1SrFEOfpzKFUm4QuWMSpeETqVLQqfSJeGOYo1SrFGKNcrBy5LwpiR0Kl0SOpUuCV0Szqh0SehUuiR0Km8q1ijFGqVYoxw8TOWbVM6odEl4kkqXhE6lS0Kn8qRijVKsUYo1ivlgjVGsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5R/eRoPCITzB6kAAAAASUVORK5CYII=	2026-02-16 13:29:32.558
19	32	3	G	14	6	TKT-0032-0003-G14	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALPSURBVO3BQW7kQAwEwUxC//9yrY88NSCMNGsTjDA/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrl4kMq35SEE5UuCScqXRI6lW9KwieKNUqxRinWKBcPS8KTVE5U7lDpknBHEp6k8qRijVKsUYo1ysXLVO5Iwh1JuCMJnUqXhDtU7kjCm4o1SrFGKdYoF8OpnCRhkmKNUqxRijXKxR+ncpKETqVT6ZLwlxVrlGKNUqxRLl6WhDcloVPpVE6S8Ikk/CbFGqVYoxRrlIuHqXyTSpeETqVLQqfSJeFE5Tcr1ijFGqVYo5gfDKbSJWGyYo1SrFGKNcrFh1S6JHQqXRI6lS4JnUqXhBOVO1S6JNyh0iXhRKVLwpOKNUqxRinWKBe/jEqXhE6lS0KXhBOVLgmdSpeETqVLQqdykoQ3FWuUYo1SrFEuvkzlJAmdSpeETuVJSehUuiR0Kl0STlS6JDypWKMUa5RijWJ+8CKVkyR8QuUkCZ3KHUm4Q+UTSfhEsUYp1ijFGuXiQypdEk6ScKLyJJWTJJyo3JGETqVLQqfypGKNUqxRijWK+cEfpnKShE6lS0Kn0iXhRKVLwv9UrFGKNUqxRrn4kMo3JaFLwh1J6FS6JDxJ5SQJTyrWKMUapVijXDwsCU9SuUPljiScqHRJOFHpktCpvKlYoxRrlGKNcvEylTuScIdKl4Q3qXRJOFHpkvCmYo1SrFGKNcrFH5eEE5WTJHQqXRI6lROVLgmdSpeEJxVrlGKNUqxRLv44lZMkfELlRKVLQqfSJaFT6ZLwiWKNUqxRijXKxcuS8KYk3KHSJaFLwolKl4ROpUtCp/KmYo1SrFGKNcrFw1S+SeWOJDxJpUtCp9IloVN5UrFGKdYoxRrF/GCNUaxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlH+ArhoG9aRZqQAAAABJRU5ErkJggg==	2026-02-17 10:10:03.881
20	33	3	G	15	6	TKT-0033-0003-G15	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALPSURBVO3BQY7cQAwEwSxC//9yeo88NSBIM/bSjIg/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrl4qEkfJPKHUnoVO5IwjepPFGsUYo1SrFGuXiZypuScJKEO5JwonKi8qYkvKlYoxRrlGKNcvFhSbhD5Q6VLgknKm9Kwh0qn1SsUYo1SrFGuRhG5SQJncokxRqlWKMUa5SLXy4JncodSehUfrNijVKsUYo1ysWHqXySykkSTlSeUPmXFGuUYo1SrFEuXpaEb0pCp3Ki0iWhUzlJwr+sWKMUa5RijRJ/MEgSOpX/SbFGKdYoxRrl4qEkdCpdEjqVLgmdSpeETuVE5Y4kdCp3JKFTOUlCp/KmYo1SrFGKNUr8wRcl4Q6VkyR0Kl0STlS6JHQqXRI6lS4JJyqfVKxRijVKsUa5+MtUTpJwonKi0iXhRKVLQqfSJaFTOUlCp/KmYo1SrFGKNUr8wRcl4Q6VkyR0Kl0SnlC5IwlPqDxRrFGKNUqxRrl4KAknKp1Kl4ROpUvCicqJSpeETuUkCXeodEnoVLokvKlYoxRrlGKNEn/wiyWhU+mScKLSJaFTOUlCp/I3FWuUYo1SrFEuHkrCN6l0Kl0SOpWTJHQqb0rCicqbijVKsUYp1igXL1N5UxKeSMITSehUTpLQqXRJ+KRijVKsUYo1ysWHJeEOlTuScKLypiScqHRJ6FQ+qVijFGuUYo1y8cupdEk4SUKn0iWhU7kjCZ1Kl4RO5U3FGqVYoxRrlItfLgl3qNyRhDtUuiR0Kl0SOpUnijVKsUYp1igXH6bySSp3JKFT6VROktCpdEnoVLokfFKxRinWKMUa5eJlSfimJHQqXRI6lTcloVPpktCpdEl4U7FGKdYoxRol/mCNUaxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlD8QJCbqK7LYpwAAAABJRU5ErkJggg==	2026-02-17 10:33:27.386
24	4	4	\N	\N	\N	TKT-0004-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALpSURBVO3BQa7jSAwFwXyE7n/lHC+5KkCQbPTnMCJ+sMYo1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijXKxUNJ+CWVkyScqHRJ6FS6JPySyhPFGqVYoxRrlIuXqbwpCSdJeELlDpU3JeFNxRqlWKMUa5SLL0vCHSp3qNyRhE7liSTcofJNxRqlWKMUa5SL4ZLwf1KsUYo1SrFGufjjktCpdCpdErokdCp/WbFGKdYoxRrl4stUvkmlS0KncqLyhMq/pFijFGuUYo1y8bIk/FISOpUuCZ1Kl4RO5SQJ/7JijVKsUYo1SvxgsCR0KpMVa5RijVKsUS4eSkKn0iWhU+mS0Kl0SehUTpLQqZwkoVO5IwmdykkSOpU3FWuUYo1SrFHiBy9KQqfSJaFTeVMS7lDpktCpdEnoVLoknKh8U7FGKdYoxRolfvBAEn5JpUvCiUqXhE7lJAmdSpeETuUkCZ3Km4o1SrFGKdYo8YMXJaFT6ZLQqXRJ6FROktCpnCThDpU7kvCEyhPFGqVYoxRrlIt/jEqXhE7lJAmdyonKSRLuUOmS0Kl0SXhTsUYp1ijFGuXiZSonKneo3KHyRBI6lZMknKicqLypWKMUa5RijXLxUBJ+SaVT6ZJwotIl4ZuScIfKE8UapVijFGuUi5epvCkJb0pCp/KmJHQqXRI6lTcVa5RijVKsUS6+LAl3qNyRhE6lS0Kn0iXhRKVLwolKl4RO5ZuKNUqxRinWKBd/nEqXhJMkdCpvSkKn0iWhU3lTsUYp1ijFGuXij0tCp9IloVO5IwmdSpeETqVLQqfSJaFTeaJYoxRrlGKNcvFlKt+kcqLSJaFT6ZLQqXRJ6FS6JHQqXRK+qVijFGuUYo1y8bIk/FISTlQ6lS4JnUqXhE6lS0Kn0iWhU+mS8KZijVKsUYo1SvxgjVGsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5T/AAuuQeGt+CLoAAAAAElFTkSuQmCC	2026-02-17 10:59:19.157
25	5	4	\N	\N	\N	TKT-0005-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALNSURBVO3BQW7gSAwEwSxC//9y7hx5akCQZNhcRsR/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrl4qEk/CSVJ5JwotIl4SepPFGsUYo1SrFGuXiZypuScJKEE5UTlTtU3pSENxVrlGKNUqxRLj6WhDtU7lA5ScKXknCHypeKNUqxRinWKBfDJOH/rFijFGuUYo1y8ccl4YkkdCp/WbFGKdYoxRrl4mMqX1I5ScKJyhMqv0mxRinWKMUa5eJlSfhJSehUTlS6JHQqJ0n4zYo1SrFGKdYo8R8GScKJymTFGqVYoxRrlIuHktCpdEnoVLokdCpdEjqVNyWhU7kjCZ3KSRI6lTcVa5RijVKsUS5+OZWTJHQqJ0noVLokdCpdEjqVLgknKl8q1ijFGqVYo1w8pHJHEjqVkyR0Kp1Kl4RO5Q6VLgmdSpeETuUkCZ3Km4o1SrFGKdYoFw8l4Q6VLgknKidJeCIJJyonKl0S7khCp/JEsUYp1ijFGuXiIZUuCW9KwpdUTpJwh0qXhE6lS8KbijVKsUYp1igXL1O5Q+WJJHQqTyShUzlJwonKicqbijVKsUYp1igXDyXhJ6l0Kl0STlS6JHwpCXeoPFGsUYo1SrFGuXiZypuS8IRKl4RO5U1J6FS6JHQqbyrWKMUapVijXHwsCXeo3JGETuVEpUvCiUqXhE7lJAmdypeKNUqxRinWKBd/nMpJEk5UnkjCiUqXhE7lTcUapVijFGuUiz8uCZ1Kp/JEEjqVLgmdSpeETqVLQqfyRLFGKdYoxRrl4mMqX1LpknCHSpeETqVLQqfSJaFT6ZLwpWKNUqxRijXKxcuS8JOScIdKl4ROpUtCp9IloVPpktCpdEl4U7FGKdYoxRol/sMao1ijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKP8Bqw4g9no1EgAAAAAASUVORK5CYII=	2026-02-17 10:59:19.16
26	6	4	\N	\N	\N	TKT-0006-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALnSURBVO3BQW7gSAwEwSxC//9yro88NSBIMsZcRsQfrDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1y8VASfpPKHUnoVO5Iwm9SeaJYoxRrlGKNcvEylTcl4SQJncpJEk5UTlTelIQ3FWuUYo1SrFEuPpaEO1TuULlDpUvCE0m4Q+VLxRqlWKMUa5SL/5kkdCqTFGuUYo1SrFEu/rgkdCqdSpeELgmdyl9WrFGKNUqxRrn4mMqXVLokdConKk+o/EuKNUqxRinWKBcvS8JvSkKn0iWhU+mS0KmcJOFfVqxRijVKsUaJPxgsCZ3KZMUapVijFGuUi4eS0Kl0SehUuiR0Kl0SOpWTJNyRhE7ljiR0KidJ6FTeVKxRijVKsUa5+JjKHUnoVLokdCqdykkSOpUuCZ1Kl4ROpUvCicqXijVKsUYp1igXD6nckYROpUtCl4Q7kvCESpeETqVLQqdykoRO5U3FGqVYoxRrlPiDB5LQqZwk4Q6VkyR0KidJuEPljiQ8ofJEsUYp1ijFGuXiIZUnVLokdEl4IgknKidJuEOlS0Kn0iXhTcUapVijFGuUi1+mcqJyRxLelIRO5SQJJyonKm8q1ijFGqVYo1w8lITfpNKp3KHSJeFLSbhD5YlijVKsUYo1ysXLVN6UhDuS0Kl0SehU3pSETqVLQqfypmKNUqxRijXKxceScIfKHUnoVE5UuiScqHRJOFHpktCpfKlYoxRrlGKNcvHHqZwk4UTlDpUuCV0SOpUuCZ3Km4o1SrFGKdYoF39cEk5UnkhCp3Ki0iWhU+mS0Kk8UaxRijVKsUa5+JjKl1S6JHRJOFHpktCpdEnoVLokdCpdEr5UrFGKNUqxRrl4WRJ+UxI6lS4JnUqXhE6lS0Kn0iWhU+mS0Kl0SXhTsUYp1ijFGiX+YI1RrFGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuU/wAxxTP4cGh8KAAAAABJRU5ErkJggg==	2026-02-17 10:59:19.162
27	7	2	\N	\N	\N	TKT-0007-0002-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALiSURBVO3BQW7ARgwEwR5C//9yx0eeFhAkOTHDqviDNUaxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFEuHkrCb1J5IgknKl0SfpPKE8UapVijFGuUi5epvCkJJ0noVL6k8qYkvKlYoxRrlGKNcvGxJNyhcofKSRJOVJ5Iwh0qXyrWKMUapVijXAyThBOVyYo1SrFGKdYoF39cEjqVkyScqPxlxRqlWKMUa5SLj6l8SaVLQqdyovKEyn9JsUYp1ijFGuXiZUn4TUnoVLokdCpdEjqVkyT8lxVrlGKNUqxR4g8GSUKn8n9SrFGKNUqxRrl4KAmdSpeETqVLQqfSJaFTuSMJnUqXhE7ljiR0KidJ6FTeVKxRijVKsUaJP3hREk5UvpSEO1S6JHQqXRI6lS4JJypfKtYoxRqlWKNcfEylS8KJSpeETqVLQqfSJeEOlS4JnUqXhE7lJAmdypuKNUqxRinWKBcPJeEJlS4JnUqXhDcl4UTlRKVLwh1J6FSeKNYoxRqlWKNcPKRyh8odSehU3qRykoQ7VLokdCpdEt5UrFGKNUqxRok/+MOS0KmcJKFT6ZLQqZwkoVP5NxVrlGKNUqxRLh5Kwm9S6VTuUOmS0Km8KQl3qDxRrFGKNUqxRrl4mcqbknBHEjqVLgmdSpeETuWOJHQqXRI6lTcVa5RijVKsUS4+loQ7VO5IQqfSJaFT6ZLQqXRJOFE5SUKn8qVijVKsUYo1ysUfp9IloVPpktCp3KHSJeFEpUtCp/KmYo1SrFGKNcrFH5eETqVLQqfyJZUuCZ1Kl4RO5YlijVKsUYo1ysXHVL6k0iXhJAmdSpeETqVLQqfSJaFT6ZLwpWKNUqxRijXKxcuS8JuScKJykoROpUtCp9IloVPpktCpdEl4U7FGKdYoxRol/mCNUaxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlH8AsJY36w2zypcAAAAASUVORK5CYII=	2026-02-17 10:59:19.165
28	8	4	\N	\N	\N	TKT-0008-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALbSURBVO3BQW7kQAwEwSxC//9yro88NSBIM1jTjIg/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrl4qEkfJPKm5LQqXRJ+CaVJ4o1SrFGKdYoFy9TeVMSTpLwhModKm9KwpuKNUqxRinWKBcfloQ7VO5Q6ZLwTUm4Q+WTijVKsUYp1igXf1wSOpXfrFijFGuUYo1y8csloVM5ScJkxRqlWKMUa5SLD1P5JJUuCZ3KicoTKv+TYo1SrFGKNcrFy5LwTUnoVLokdCpdEjqVkyT8z4o1SrFGKdYo8QeDJKFT+UuKNUqxRinWKBcPJaFT6ZLQqXRJ6FS6JHQqb0pCp3JHEjqVkyR0Km8q1ijFGqVYo8QfvCgJnUqXhDtUuiScqHRJOFHpktCpdEnoVLoknKh8UrFGKdYoxRrl4mUqb0pCp9Il4U0qXRI6lS4JncpJEjqVNxVrlGKNUqxR4g8eSEKn0iXhDpWTJHQqdyThDpU7kvCEyhPFGqVYoxRrlIuHVE5UuiR0Kl0STlROktCpnKicJOEOlS4JnUqXhDcVa5RijVKsUS6+TOVE5Y4kvCkJncpJEk5UTlTeVKxRijVKsUa5eCgJ36TSqdyh0iXhk5Jwh8oTxRqlWKMUa5SLl6m8KQl3JKFT6ZLQqbwpCZ1Kl4RO5U3FGqVYoxRrlIsPS8IdKnck4Q6VLgknKl0STlS6JHQqn1SsUYo1SrFGufjlVLokdEk4UXlCpUtCp9IloVN5U7FGKdYoxRrl4pdLwh0qdyThJAmdSpeETqVLQqfyRLFGKdYoxRrl4sNUPkmlS8JJEjqVLgmdSpeETqVLQqfSJeGTijVKsUYp1igXL0vCNyWhU+mS0Kl0SehUuiR0Kl0SOpUuCZ1Kl4Q3FWuUYo1SrFHiD9YYxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFG+QcVtSv0FChWSQAAAABJRU5ErkJggg==	2026-02-17 10:59:19.167
29	9	4	\N	\N	\N	TKT-0009-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALPSURBVO3BQW7ARgwEwR5C//9yx7fwtIAgyYkJVsUfrDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1y8VASfpPKSRKeUOmS8JtUnijWKMUapVijXLxM5U1JOEnCicqbVN6UhDcVa5RijVKsUS4+loQ7VO5Q6ZJwkoRO5Ykk3KHypWKNUqxRijXKxTAqXRJOktCp/GXFGqVYoxRrlIs/LgnrX8UapVijFGuUi4+pfEnlJAknKk+o/J8Ua5RijVKsUS5eloTflIRO5USlS0KncpKE/7NijVKsUYo1SvzBGqNYoxRrlGKNcvFQEjqVLgmdSpeETqVLQqdykoQTlS4JncodSehUTpLQqbypWKMUa5RijXLxH1PpktCpdEnoVE5UuiR0Kl0SOpUuCZ1Kl4QTlS8Va5RijVKsUeIPHkjCiUqXhE7lJAmdyh1JOFE5SUKn0iWhUzlJQqfypmKNUqxRijVK/MEfkoROpUtCp9Il4Q6VO5LwhMoTxRqlWKMUa5SLjyWhU+mS0Kl0SfiSykkS7lDpktCpdEl4U7FGKdYoxRrl4mMqJyonKidJeFMSOpWTJJyonKi8qVijFGuUYo1y8VASfpNKp3KHSpeELyXhDpUnijVKsUYp1igXL1N5UxLuSMIdKm9KQqfSJaFTeVOxRinWKMUa5eJjSbhD5Y4k3KHSJeFEpUtCp3KShE7lS8UapVijFGuUiz9O5SQJXRI6lTcloVPpktCpvKlYoxRrlGKNcvHHJeFE5YkknCShU+mS0Kl0SehUnijWKMUapVijXHxM5UsqdyShU+mS0Kl0SehUuiR0Kl0SvlSsUYo1SrFGuXhZEn5TEjqVE5UuCZ1Kl4ROpUtCp9IloVPpkvCmYo1SrFGKNUr8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYo/wC8CSL0+ELTlAAAAABJRU5ErkJggg==	2026-02-17 10:59:19.169
30	10	4	\N	\N	\N	TKT-0010-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALWSURBVO3BQY7cQAwEwSxC//9yeo88NSBIM/bSjIg/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrl4qEkfJPKHUnoVO5IwjepPFGsUYo1SrFGuXiZypuScJKETqVTOUlCp3Ki8qYkvKlYoxRrlGKNcvFhSbhD5Q6VLgknKm9Kwh0qn1SsUYo1SrFGufjPJKFTmaRYoxRrlGKNcvHLJeGJJHQqv1mxRinWKMUa5eLDVD5J5Y4kdCpPqPxLijVKsUYp1igXL0vCNyWhU+mS0Kl0SehUTpLwLyvWKMUapVijxB8MkoRO5X9SrFGKNUqxRrl4KAmdSpeETqVLQqfSJaFTuSMJnUqXhE7ljiR0KidJ6FTeVKxRijVKsUa5eFkSnkhCp9Il4UTlJAmdSpeETqVLQqfSJeFE5ZOKNUqxRinWKBcPqZwk4Q6VLglPJOEOlS4JnUqXhE7lJAmdypuKNUqxRinWKPEHL0pCp9IloVN5IgmdSpeEJ1TuSMITKk8Ua5RijVKsUS6+TKVLQqfSJeFE5USlS0KncpKEO1S6JHQqXRLeVKxRijVKsUaJP/jFktCpnCShU+mS0KmcJKFT+ZuKNUqxRinWKBcPJeGbVDqVLgknKl0SPikJd6g8UaxRijVKsUa5eJnKm5Jwh8pJEjqVNyWhU+mS0Km8qVijFGuUYo1y8WFJuEPljiTcodIl4USlS0KncpKETuWTijVKsUYp1igXv5xKl4STJHQqTyThRKVLQqfypmKNUqxRijXKxS+XhE7lTUm4Q6VLQqfSJaFTeaJYoxRrlGKNcvFhKp+k0iXhDpUuCZ3KHUnoVLokfFKxRinWKMUa5eJlSfimJJyonCShU+mS0Kl0SehUuiR0Kl0S3lSsUYo1SrFGiT9YYxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGuUPmEsi/dxQCNYAAAAASUVORK5CYII=	2026-02-17 10:59:19.171
31	11	4	\N	\N	\N	TKT-0011-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKuSURBVO3BQW7sWAwEwSxC979yjpdcPUCQusfmZ0T8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoFw8l4ZtUuiScqJwkoVPpkvBNKk8Ua5RijVKsUS5epvKmJJyonCThROUOlTcl4U3FGqVYoxRrlIsPS8IdKnckoVM5UXlTEu5Q+aRijVKsUYo1ysUfp9Il4V9WrFGKNUqxRrkYTuUkCZ3KX1asUYo1SrFGufgwlU9KQqfSJaFT6VSeUPlNijVKsUYp1igXL0vCX5KETuUkCb9ZsUYp1ijFGiX+YJAkdCpdEjqVSYo1SrFGKdYo8QcPJKFT6ZLQqdyRhBOVkyTcoXKShE7lJAmdSpeETuWJYo1SrFGKNcrFh6l0SbhDpUvCSRI6lTepPJGETuVNxRqlWKMUa5SLh1S6JHQqd6h0SThJwpuS8CaVbyrWKMUapVijXHxYEk5UuiR0Kl0STlS6JHQqXRI6lZMkdConSehUuiR0Kk8Ua5RijVKsUS6+TOWOJHQqb1LpknCi0iXhjiR8UrFGKdYoxRol/uAPS8IdKk8k4Q6VLgmdypuKNUqxRinWKBcPJeGbVJ5IwonKm5LQqXRJ6FSeKNYoxRqlWKNcvEzlTUk4UemS0KnckYRO5Q6VO1TeVKxRijVKsUa5+LAk3KHyhEqXhDtUTlS6JHRJuEPlTcUapVijFGuUi3+MykkSOpUuCScq/6dijVKsUYo1ysUfl4ROpVPpktCpnCShU+mS0CXhCZUnijVKsUYp1igXH6bySSonSehUTlROktCpPJGENxVrlGKNUqxRLl6WhG9KwolKl4Q3JeE3KdYoxRqlWKPEH6wxijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKN8h9odw3opv6vfAAAAABJRU5ErkJggg==	2026-02-17 10:59:19.174
32	12	4	\N	\N	\N	TKT-0012-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALMSURBVO3BQY7cQAwEwSxC//9yeo88NSBIM/bSjIg/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrl4qEkfJPKSRJOVLokdCpdEr5J5YlijVKsUYo1ysXLVN6UhJMknKh0SehU7lB5UxLeVKxRijVKsUa5+LAk3KFyh0qXhG9Kwh0qn1SsUYo1SrFGuRguCf+TYo1SrFGKNcrFL5eEJ5LQqfxmxRqlWKMUa5SLD1P5JJU7ktCpPKHyLynWKMUapVijXLwsCd+UhE6lS0Kn0iWhUzlJwr+sWKMUa5RijRJ/MEgSOpX/SbFGKdYoxRrl4qEkdCpdEjqVLgmdSpeETuVNSehU7khCp3KShE7lTcUapVijFGuU+IMPSsKJyhNJeEKlS0Kn0iWhU+mScKLyScUapVijFGuUi4eScKLyRBI6lU7ljiScqHRJ6FS6JHQqJ0noVN5UrFGKNUqxRok/eCAJncpJEk5U7khCp9Il4QmVO5LwhMoTxRqlWKMUa5T4g78oCXeonCThDpWTJNyh0iWhU+mS0Kk8UaxRijVKsUa5+MtUnkhCp9Il4Y4kdConSThROVF5U7FGKdYoxRrl4qEkfJNKp3KHSpeET0rCHSpPFGuUYo1SrFEuXqbypiS8KQmdypuS0Kl0SehU3lSsUYo1SrFGufiwJNyhckcSTlROknCi0iWhUzlJQqfyScUapVijFGuUi19O5SQJJyp3qHRJOFHpktCpvKlYoxRrlGKNcvHLJeEOlTuScIdKl4ROpUtCp/JEsUYp1ijFGuXiw1Q+SeWOJHQqXRI6lTuS0Kl0SfikYo1SrFGKNcrFy5LwTUnoVLokdCpdEjqVLgmdSpeETqVLQqfSJeFNxRqlWKMUa5T4gzVGsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxR/gCqUB3z4aRXOgAAAABJRU5ErkJggg==	2026-02-17 10:59:19.176
33	13	4	\N	\N	\N	TKT-0013-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALYSURBVO3BQW7ARgwEwR5C//9yx0eeFhAkOTHDqviDNUaxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFEuHkrCb1I5SUKn8kQSfpPKE8UapVijFGuUi5epvCkJJ0m4Iwmdyh0qb0rCm4o1SrFGKdYoFx9Lwh0qd6jcofKmJNyh8qVijVKsUYo1ysUwSehU/k+KNUqxRinWKBd/XBI6lZMknKj8ZcUapVijFGuUi4+pfEnlJAknKk+o/JcUa5RijVKsUS5eloTflIRO5USlS0KncpKE/7JijVKsUYo1SvzBIEk4UZmsWKMUa5RijXLxUBI6lS4JnUqXhE6lS0KncofKSRI6lTuS0KmcJKFTeVOxRinWKMUa5eIhlS4JnUqXhE6lS0Kn8kQSTlS6JHQqXRI6lS4JJypfKtYoxRqlWKNc/DKVLgmdSpeEE5UTlS4JJypdEjqVLgmdykkSOpU3FWuUYo1SrFEuXqbSJeEJlS8l4UTlRKVLwh1J6FSeKNYoxRqlWKNcPJSEJ1S6JLwpCScqJ0m4Q6VLQqfSJeFNxRqlWKMUa5T4gz8sCU+odEnoVE6S0Kn8m4o1SrFGKdYoFw8l4TepdConSehUuiR8KQl3qDxRrFGKNUqxRrl4mcqbknBHEjqVLgmdypuS0Kl0SehU3lSsUYo1SrFGufhYEu5QuSMJnUqXhE6lS8KJSpeEE5UuCZ3Kl4o1SrFGKdYoF3+cSpeETqVLQqfyhEqXhE6lS0Kn8qZijVKsUYo1ysUfl4ROpUtCp3JHEjqVE5UuCZ1Kl4RO5YlijVKsUYo1ysXHVL6kcqLSJaFT6ZLQqdyRhE6lS8KXijVKsUYp1igXL0vCb0rCHSpdEjqVLgmdSpeETqVLQqfSJeFNxRqlWKMUa5T4gzVGsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxR/gEXtC3vOBcxuQAAAABJRU5ErkJggg==	2026-02-17 10:59:19.178
34	14	4	\N	\N	\N	TKT-0014-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKhSURBVO3BQW7kQAwEwSxC//9yro88NSBIM7C5jIg/WGMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRrl4qEkfJNKl4RO5SQJncpJEr5J5YlijVKsUYo1ysXLVN6UhBOVkyScJKFTOVF5UxLeVKxRijVKsUa5+LAk3KHyRBK+KQl3qHxSsUYp1ijFGuXij0tCp9IloVOZrFijFGuUYo1yMUwSOpUuCScqf1mxRinWKMUa5eLDVL5J5USlS8ITKr9JsUYp1ijFGuXiZUn4TZLQqTyRhN+sWKMUa5RijRJ/8IcloVP5nxVrlGKNUqxRLh5KQqdyRxI6lS4JdyShUzlJwiepnCShU3miWKMUa5RijXLxkModSbhD5Y4kfJLKb1asUYo1SrFGufiwJJyonCThRKVTeULlJAm/WbFGKdYoxRrl4qEknKicJKFT6VS6JNyRhDepdEm4Q6VLwpuKNUqxRinWKBcvU7lD5SQJJ0k4UemS0Kl0SbhD5SQJXRI+qVijFGuUYo0Sf/CHJaFT6ZLQqXRJ+CaVLgmdyhPFGqVYoxRrlIuHkvBNKidJOElCp9Il4U0qXRI6lTcVa5RijVKsUS5epvKmJJyodEnoVLok3KFyRxJOVD6pWKMUa5RijXLxYUm4Q+WOJHQqXRI6lS4JncpJEk5UuiScqLypWKMUa5RijXLxx6l0SehUnkhCp/KmJHQqTxRrlGKNUqxRLv4zSbhDpUtCp9IloVP5pmKNUqxRijXKxYep/GYqd6h0SXgiCZ3KE8UapVijFGuUi5cl4ZuScJKETqVLwh0qncpJEr6pWKMUa5RijRJ/sMYo1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijXKP5XG8fvYqVlOAAAAAElFTkSuQmCC	2026-02-17 10:59:19.18
35	15	4	\N	\N	\N	TKT-0015-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKvSURBVO3BQW7sWAwEwSxC979yjpdcPUCQusfmZ0T8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoFw8l4ZtUuiScqHRJOFHpkvBNKk8Ua5RijVKsUS5epvKmJJyodEn4JJU3JeFNxRqlWKMUa5SLD0vCHSp3JOEkCZ1Kl4QnknCHyicVa5RijVKsUS7+OJU7ktCpTFKsUYo1SrFGuRgmCZ1Kp9IloVP5y4o1SrFGKdYoFx+m8klJOElCp9KpPKHymxRrlGKNUqxRLl6WhP+TSpeEkyR0KidJ+M2KNUqxRinWKPEHgyXhRGWSYo1SrFGKNcrFQ0noVLokdCp3JOFE5YkkdConSehUTpLQqXRJ6FSeKNYoxRqlWKNcvCwJnUqXhDtU7khCp/ImlSeS0Km8qVijFGuUYo1y8WFJOFHpktAl4Q6VLgmdykkS3qTyTcUapVijFGuUi5epdEnoVO5Q6ZLQqZyonCShUzlJQqdykoROpUtCp/JEsUYp1ijFGuXiZUl4UxJOknCicqLSJeFEpUvCHUn4pGKNUqxRijVK/MEfloRO5ZOScIdKl4RO5U3FGqVYoxRrlIuHkvBNKnck4Q6VNyWhU+mS0Kk8UaxRijVKsUa5eJnKm5JwonKHykkSOpU7VO5QeVOxRinWKMUa5eLDknCHyhNJ6FS6JJyonKh0SeiScIfKm4o1SrFGKdYoF/8YlZMkdCpdEjqV36RYoxRrlGKNcvHHJaFTOUlCp3KShDuS8ITKE8UapVijFGuUiw9T+SSVkyR0KicqJ0k4UbkjCW8q1ijFGqVYo1y8LAnflIQTlS4Jb0rCb1KsUYo1SrFGiT9YYxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGuU/uI4BAfYTh5gAAAAASUVORK5CYII=	2026-02-17 10:59:19.181
36	16	4	\N	\N	\N	TKT-0016-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKqSURBVO3BQW7gSAwEwSxC//9yro88NSBI8noIRsQfrDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1y8VASfpNKl4ROpUtCp9IloVPpkvCbVJ4o1ijFGqVYo1y8TOVNSThR6ZLwJZU3JeFNxRqlWKMUa5SLjyXhDpU7knCi8qUk3KHypWKNUqxRijXKxT9OpUvCSRI6lUmKNUqxRinWKBfDqHRJ6FS6JHQq/7JijVKsUYo1ysXHVL6UhE6lUzlReULlLynWKMUapVijXLwsCX9JEjqVLgmdykkS/rJijVKsUYo1SvzBIEm4Q2WSYo1SrFGKNUr8wQNJ6FS6JHQqdyThROWOJJyonCShUzlJQqfSJaFTeaJYoxRrlGKNcvGQypuS0KmcJKFT6ZLQqTyh8kQSOpU3FWuUYo1SrFEuflkSTlS6JJyovCkJb1L5TcUapVijFGuUi4+pdEk4SUKn0iXhJAmdykkSOpWTJHQqJ0noVLokdCpPFGuUYo1SrFEuHkrCicodKl0SOpUuCU+odEk4UemScEcSvlSsUYo1SrFGiT/4hyWhU/lSEu5Q6ZLQqbypWKMUa5RijXLxUBJ+k8odSbhD5U1J6FS6JHQqTxRrlGKNUqxRLl6m8qYknKicqNyRhE7lDpU7VN5UrFGKNUqxRrn4WBLuUHkiCU+onKicJOEOlTcVa5RijVKsUS6GUXkiCZ1Kl4ROpVP5PxVrlGKNUqxRLv5xSehUuiScqJwk4Y4kPKHyRLFGKdYoxRrl4mMqX1LpktCp3KFykoQTlTuS8KZijVKsUYo1ysXLkvCbknCShC8l4S8p1ijFGqVYo8QfrDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo3yH0goB+7kNzG4AAAAAElFTkSuQmCC	2026-02-17 10:59:19.183
37	18	4	\N	\N	\N	TKT-0018-0004-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALISURBVO3BQW7gSAwEwSxC//9yro88CWhI8o4JRsQfrDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1y8VASfpPKE0noVO4k4TepPFGsUYo1SrFGuXiZypuScCcJncqJJHQqd1TelIQ3FWuUYo1SrFEuPpaEEyonVO4k4UtJOKHypWKNUqxRijXKxXAqXRI6lUmKNUqxRinWKBd/XBKeSEKn8pcVa5RijVKsUS4+pvIllS4JnUqXhE7lCZV/SbFGKdYoxRrl4mVJ+E1J6FS6JHQqXRI6lTtJ+JcVa5RijVKsUeIPBknCHZXJijVKsUYp1igXDyWhU+mS0Kl0SehUuiR0Km9KQqdyIgmdyp0kdCpvKtYoxRqlWKNcPKTSJeFNKm9KQqfSJaFT6ZLQqXRJuKPypWKNUqxRijXKxUNJOJGEE0m4o9Kp3EnCHZUuCZ1Kl4RO5U4SOpU3FWuUYo1SrFHiDx5IQqfypSR0KneS8ITKiSQ8ofJEsUYp1ijFGuXiIZUuCZ3KE0noVE6odEnoVO4k4YRKl4ROpUvCm4o1SrFGKdYo8Qd/WBKeUOmS0KncSUKn8n8q1ijFGqVYo1w8lITfpNKpPJGELyXhhMoTxRqlWKMUa5SLl6m8KQknktCpdEnoVN6UhE6lS0Kn8qZijVKsUYo1ysXHknBC5UQSTqh0Sbij0iWhU7mThE7lS8UapVijFGuUiz9OpUtCl4Q7Kk8k4Y5Kl4RO5U3FGqVYoxRrlIs/LgknVE4koVM5kYROpUtCp/JEsUYp1ijFGuXiYypfUjmRhE6lS0KnciIJnUqXhC8Va5RijVKsUS5eloTflIQTKl0SOpUuCZ1Kl4ROpUtCp9Il4U3FGqVYoxRrlPiDNUaxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFH+AwcnFwCS2jMdAAAAAElFTkSuQmCC	2026-02-17 10:59:19.185
39	23	12	\N	\N	\N	TKT-0023-0012-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALjSURBVO3BQW7sWAwEwSxC979yjpdcPUCQusfmZ0T8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoFw8l4ZtUTpLQqZwkoVPpkvBNKk8Ua5RijVKsUS5epvKmJJwkoVP5JJU3JeFNxRqlWKMUa5SLD0vCHSp3qHRJ6FS6JLwpCXeofFKxRinWKMUa5WIYlX9ZsUYp1ijFGuXij0tCp9Il4V9SrFGKNUqxRrn4MJVPUumS0Kl0SehUnlD5TYo1SrFGKdYoFy9LwjcloVPpktCpdEnoVE6S8JsVa5RijVKsUeIPBktCpzJZsUYp1ijFGuXioSR0Kl0SOpUuCZ1Kl4RO5SQJncpJEjqVO5LQqZwkoVN5U7FGKdYoxRrl4iGVO5LQqZyodEnoVO5IQqfSJaFT6ZLQqXRJOFH5pGKNUqxRijXKxS+XhE6lS0Kn8oRKl4ROpUtCp3KShE7lTcUapVijFGuU+IMvSkKn0iWhU7kjCZ1Kl4Q7VO5IwhMqTxRrlGKNUqxRLh5KQqdyotIloVPpknCi8oTKHUk4UemS0Kl0SXhTsUYp1ijFGiX+4A9LwolKl4ROpUtCp3KShE7l/1SsUYo1SrFGuXgoCd+k0ql0SeiS0Kl0SehU3pSEO1SeKNYoxRqlWKNcvEzlTUl4QqVLQqfSJaFTuSMJnUqXhE7lTcUapVijFGuUiw9Lwh0qdyThJAmdSpeETqVLwonKSRI6lU8q1ijFGqVYo1z8cSpdEjqVLgmdyhNJOFHpktCpvKlYoxRrlGKNcvHHJeEkCZ3Km1ROktCpdEnoVJ4o1ijFGqVYo1x8mMonqdyRhE6lS0Kn0iWhS8KJSpeETyrWKMUapVijXLwsCd+UhBOVTqVLQqfSJaFT6ZLQqXRJ6FS6JLypWKMUa5RijRJ/sMYo1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijXKf9uhNPQVYPieAAAAAElFTkSuQmCC	2026-02-17 10:59:19.188
40	24	6	\N	\N	\N	TKT-0024-0006-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALMSURBVO3BQY6YUAwFwW6L+1/5ZZZefQkBo8RxlfnBGqNYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1igXD6n8piTcodIloVPpktCp/KYkPFGsUYo1SrFGuXhZEt6kcqLSJeFE5YkkvEnlTcUapVijFGuUi4+p3JGEO5LQqXRJOFF5QuWOJHypWKMUa5RijXLxn1GZrFijFGuUYo1y8Y9TOVH5nxRrlGKNUqxRLj6WhC8loVO5IwlPJOFvUqxRijVKsUa5eJnKb1LpktCpdEnoVLoknKj8zYo1SrFGKdYo5geDqXRJmKxYoxRrlGKNcvGQSpeETqVLQqfSJaFT6ZJwonKHSpeEO1S6JJyodEl4U7FGKdYoxRrl4qEkfCkJncpJEk5UuiR0Kl0SOpUuCZ3KSRK+VKxRijVKsUa5eEilS8IdSThRuUPliSR0Kl0SOpUuCScqXRLeVKxRijVKsUYxP3iRyhNJ+JLKHUm4Q+WJJDxRrFGKNUqxRrn4ZUnoVDqVNyXhJAknKnckoVPpktCpvKlYoxRrlGKNcvGyJNyRhCdUvpSEE5WTJJwk4U3FGqVYoxRrlIuHVH5TErokdConSehUuiR0Kl0S7lC5IwlPFGuUYo1SrFEuXpaEN6m8SaVLwptUuiR0Kl0S3lSsUYo1SrFGufiYyh1JuEPljiR0KneonCShU+mS8KVijVKsUYo1ysU/LgmdSqdykoQTlS4JnUqn0iWhU+mS8KZijVKsUYo1ysU/TuUkCW9S6ZJwotIloVPpkvBEsUYp1ijFGuXiY0n4UhI6lROVLgmdSpeETqVTOUlCp/KlYo1SrFGKNcrFy1R+k8qJSpeETqVLQqfSJaFT6ZLQqXRJ6FTeVKxRijVKsUYxP1hjFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUa5Q8wmBAWiglV8gAAAABJRU5ErkJggg==	2026-02-17 10:59:19.19
41	36	5	D	11	9	TKT-0036-0005-D11	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALiSURBVO3BQW7gSAwEwSxC//9yro88NSBI8o4JRsQfrDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1y8VASfpPKSRKeUOmS8JtUnijWKMUapVijXLxM5U1JOEnCiUqXhCdU3pSENxVrlGKNUqxRLj6WhDtU7lA5ScKXknCHypeKNUqxRinWKBfDJOEOlUmKNUqxRinWKBd/XBI6lZMkdEnoVP6yYo1SrFGKNcrFx1S+pHKShBOVJ1T+JcUapVijFGuUi5cl4TcloVM5UemS0KmcJOFfVqxRijVKsUaJPxgsCZ3KZMUapVijFGuUi4eS0Kl0SehUuiR0Kl0SOpU7VE6S0KnckYRO5SQJncqbijVKsUYp1ijxBy9KQqfSJeEOlZMkdCpdEk5UuiR0Kl0SOpUuCScqXyrWKMUapVijXDyUhDtUTpLQJaFTOUlCp9Il4USlS0Kn0iWhUzlJQqfypmKNUqxRijXKxUMqJ0m4Q+U3JeFE5USlS8IdSehUnijWKMUapVijXDyUhE6lU+mS0KmcJKFTuSMJJyonSbhDpUtCp9Il4U3FGqVYoxRrlPiDPywJncpJEjqVJ5LQqfyfijVKsUYp1igXDyXhN6l0Kl0STlS6JHQqXRI6lTuScKLypmKNUqxRijXKxctU3pSEO1ROknCShE7ljiR0Kl0SvlSsUYo1SrFGufhYEu5QuSMJncqJSpeETuUkCZ3KSRI6lS8Va5RijVKsUS7+OJUuCZ1Kl4ROpUvCHUk4UemS0Km8qVijFGuUYo1y8ccloVM5UemS8CaVLgmdSpeETuWJYo1SrFGKNcrFx1S+pNIloVM5UemS0Kl0SehUuiR0Kl0SvlSsUYo1SrFGuXhZEn5TEjqVLgl3qNyRhE6lS0Kn0iXhTcUapVijFGuU+IM1RrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUf4DP88u+vE8550AAAAASUVORK5CYII=	2026-02-17 11:01:24.19
43	38	3	G	10	6	TKT-0038-0003-G10	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALOSURBVO3BQW7gSAwEwSxC//9yro88NSBI8o4JRsQfrDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1y8VASfpPKSRJOVO5Iwm9SeaJYoxRrlGKNcvEylTcl4SQJJypvUnlTEt5UrFGKNUqxRrn4WBLuULlD5SQJnUqXhE7ljiTcofKlYo1SrFGKNcrFMEk4SUKnMkmxRinWKMUa5eKPS8ITSehU/rJijVKsUYo1ysXHVL6kcpKEE5UnVP4lxRqlWKMUa5SLlyXhNyWhUzlR6ZLQqZwk4V9WrFGKNUqxRok/GCwJncpkxRqlWKMUa5SLh5LQqXRJ6FS6JHQqXRI6lZMk3JGETuWOJHQqJ0noVN5UrFGKNUqxRrl4SOVLKk+odEnoVLokdCpdEjqVLgknKl8q1ijFGqVYo1w8lIQ3JeEOlTepdEnoVLokdConSehU3lSsUYo1SrFGuXhI5U0qdyThiSScqJyodEm4IwmdyhPFGqVYoxRrlIuHkvCmJJyodCpdEu5QOUnCHSpdEjqVLglvKtYoxRqlWKPEH/xhSXhCpUtCp3KShE7l/1SsUYo1SrFGuXgoCb9JpVM5SUKn0iWhU3lTEk5U3lSsUYo1SrFGuXiZypuScEcSOpUuCZ3KSRI6lZMkdCpdEr5UrFGKNUqxRrn4WBLuULkjCZ1Kl4ROpUtCp3KShE7lJAmdypeKNUqxRinWKBd/nEqXhE6lS0Kn0iWhUzlJwolKl4RO5U3FGqVYoxRrlIs/LgknSehU7kjCHSpdEjqVLgmdyhPFGqVYoxRrlIuPqXxJpUtCp9IloVPpVE6S0Kl0SehUuiR8qVijFGuUYo1y8bIk/KYk3KHypiR0Kl0SOpUuCW8q1ijFGqVYo8QfrDGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo3yH8UrHAFV47hbAAAAAElFTkSuQmCC	2026-02-17 12:18:27.986
44	39	3	H	10	6	TKT-0039-0003-H10	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKZSURBVO3BQW7sWAwEwSxC979yjpdcPUCQusfmZ0T8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoFw8l4ZtUuiR0KidJOFHpkvBNKk8Ua5RijVKsUS5epvKmJJyodEk4UXlC5U1JeFOxRinWKMUa5eLDknCHyptUTpLQqdyRhDtUPqlYoxRrlGKNcvHHJaFT6ZLwLynWKMUapVijXAyn0iVhsmKNUqxRijXKxYepfFMSOpVOpUvCEyq/SbFGKdYoxRrl4mVJ+D+pdEnoVJ5Iwm9WrFGKNUqxRok/+MOScIfKZMUapVijFGuUi4eS0KnckYROpUvCHSpdEk6S8EkqJ0noVJ4o1ijFGqVYo1w8pNIloVM5UTlR6ZJwkoRPUvnNijVKsUYp1igXDyWhU+mScKLSJeFNKneonCThNyvWKMUapVijXHyYyh0qb0rCm1S6JNyh0iXhTcUapVijFGuUi5cloVPpktCpnCShU3mTSpeEO1ROktAl4ZOKNUqxRinWKPEHf1gSTlROkvBNKl0SOpUnijVKsUYp1igXDyXhm1ROVE6S0KmcJOEJlS4Jn1SsUYo1SrFGuXiZypuScKLSJeGJJJyonCThROWTijVKsUYp1igXH5aEO1TuSEKnckcS7khCp9KpdEk4UXlTsUYp1ijFGuXij1PpktCpvEnlTUnoVJ4o1ijFGqVYo1wMo9Il4USlS0Kn0iWhU+mS0Kl8U7FGKdYoxRrl4sNUvikJJypdEp5IwhNJ6FSeKNYoxRqlWKNcvCwJ35SETuUkCZ3KEyonSfimYo1SrFGKNUr8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYo/wFy5/Hvo6P+sQAAAABJRU5ErkJggg==	2026-02-17 15:34:10.699
45	40	3	H	13	6	TKT-0040-0003-H13	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKMSURBVO3BQY6kAAwEwSyL/385d44+ISGgp8friPiDNUaxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFEObkrCJ6mcScIdKl0SPknljmKNUqxRijXKwcNUnpSEO1TOJOEKlScl4UnFGqVYoxRrlIOXJeEKlSuScEUSOpU7knCFypuKNUqxRinWKAfDqJxR6ZLQqfxlxRqlWKMUa5SD4ZLwPynWKMUapVijHLxM5TepnEnCHSrfpFijFGuUYo1y8LAkfJMkdCp3JOGbFWuUYo1SrFEOblL5ZipdEq5Q+UuKNUqxRinWKAc3JaFT6ZLwJJVOpUvCGZUuCWeS8CSVNxVrlGKNUqxRDl6mckUSOpUuCVeo3KHSJaFTuSIJncqTijVKsUYp1igHH5aEMypdEs6oXJGETuU3JaFTuaNYoxRrlGKNEn/woiR0Knck4YxKl4RO5ZskoVO5o1ijFGuUYo0Sf3BDEn6TSpeEK1TelIRO5U3FGqVYoxRrlPiDPywJnUqXhE6lS0KnckUS7lB5UrFGKdYoxRrl4KYkfJJKp9IloVO5IwlnVM4k4UwSOpU7ijVKsUYp1igHD1N5UhLOJKFT6ZLQqXQqXRLOqHRJ6FTOqLypWKMUa5RijXLwsiRcofKmJJxRuULljiR0KncUa5RijVKsUQ6GUzmThCuScEblCpUnFWuUYo1SrFEOhknCGZUzSehU/pJijVKsUYo1ysHLVN6k0iWhU+mS0Kl0STij8qQkdCp3FGuUYo1SrFEOHpaET0rCm5LQqTxJ5UnFGqVYoxRrlPiDNUaxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFH+AWOi8tlw4Sc+AAAAAElFTkSuQmCC	2026-02-17 15:43:48.105
46	41	3	H	14	6	TKT-0041-0003-H14	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKHSURBVO3BQW4rWQwEwSyi73/lHC/5Nw8QuiXLHEbEH6wxijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNcnFTEj5J5RVJOFE5ScInqdxRrFGKNUqxRrl4mMqTkvCKJJyodEnoVE5UnpSEJxVrlGKNUqxRLt4sCa9QeUUSflMSXqHyTsUapVijFGuUi+FUuiRMVqxRijVKsUa5GEbl/6xYoxRrlGKNcvFmKt9EpUvCHSrfpFijFGuUYo1y8bAkfJMkdCp3JOGbFWuUYo1SrFEublL5ZipdEl6h8pcUa5RijVKsUS5uSkKn0iXhSSqdSpeEE5UuCSdJeJLKOxVrlGKNUqxRLm5SOVHpkvAKlZMknKjcodIloVN5RRI6lScVa5RijVKsUS5uSsKJSqfSJeEkCZ1Kp3KShBOV35SETuWOYo1SrFGKNUr8wQcloVPpktCpnCShU/lLktCp3FGsUYo1SrFGuXhYEk5UuiR0Kl0SOpU7ktCpvFMSOpVO5UnFGqVYoxRrlPiDPywJJyonSehUXpGEO1SeVKxRijVKsUa5uCkJn6TSqbxTEk5UTpJwkoRO5Y5ijVKsUYo1ysXDVJ6UhJMkdCpdEjqVkyScqHRJ6FROVN6pWKMUa5RijXLxZkl4hconqfymJHQqdxRrlGKNUqxRLoZJQqdykoRO5SQJT1J5UrFGKdYoxRrlYv0jCZ3KX1KsUYo1SrFGuXgzlXdSeUUSOpUuCScqT0pCp3JHsUYp1ijFGuXiYUn4pCScqNyRhE7lSSpPKtYoxRqlWKPEH6wxijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKN8h+yau7aVMQ1RAAAAABJRU5ErkJggg==	2026-02-17 15:50:09.017
49	44	12	\N	\N	\N	TKT-0044-0012-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALQSURBVO3BQQ6cAAwEwR6L/3+5s0efkBCwyTquih+sMYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijXJwUxK+SeWKJHQqVyThm1TuKNYoxRqlWKMcPEzlSUk4k4QrknBG5YzKk5LwpGKNUqxRijXKwcuScIXKFSpnktCpdEm4IwlXqLypWKMUa5RijXIwnEqXhMmKNUqxRinWKAc/LgmdSpeE/0mxRinWKMUa5eBlKm9SOaPSJaFTuUPlX1KsUYo1SrFGOXhYEr4pCZ1Kl4ROpUtCp3ImCf+yYo1SrFGKNUr8YLAkdCqTFWuUYo1SrFEObkpCp9IloVPpktCpdEnoVM4k4YokdCpXJKFTOZOETuVJxRqlWKMUa5SDm1S6JDxJ5UwSOpUuCV0SOpUuCZ1Kl4ROpUvCGZU3FWuUYo1SrFHiBy9KwhUqXRI6lTNJ6FS6JHQqZ5LQqXRJ6FTOJKFTeVKxRinWKMUaJX7woCR0Kl0SOpUnJeFJKlck4Q6VO4o1SrFGKdYoBw9T6ZJwRRK+SeWKJJxR6ZLQqXRJeFKxRinWKMUaJX7ww5Jwh0qXhE7lTBI6lb+pWKMUa5RijXJwUxK+SaVTOZOETqVLQqfypCRcoXJHsUYp1ijFGuXgYSpPSsIdKl0SOpUuCZ3KFUnoVLokdCpPKtYoxRqlWKMcvCwJV6hckYROpUtCp9IloVPpknCFSpeETuVNxRqlWKMUa5SDH6dyRRI6lTtUuiR0Kl0SOpUnFWuUYo1SrFEOflwSOpUzKm9S6ZLQqXRJ6FTuKNYoxRqlWKMcvEzlTSpdEs4koVPpktCpXJGETqVLwpuKNUqxRinWKAcPS8I3JeEKlS4JnUqXhCtUuiR0Kl0SnlSsUYo1SrFGiR+sMYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijfIHKEEj9g0n8LoAAAAASUVORK5CYII=	2026-02-21 10:40:27.495
64	59	6	\N	\N	\N	TKT-0059-0006-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKfSURBVO3BQW7sWAwEwSxC979yjpdcPUCQusfmZ0T8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoFw8l4ZtU7kjCHSpdEr5J5YlijVKsUYo1ysXLVN6UhDepPKHypiS8qVijFGuUYo1y8WFJuEPliSR0Kl0SOpUnknCHyicVa5RijVKsUS7+MSpdEjqVv6xYoxRrlGKNcjFcEv4lxRqlWKMUa5SLD1P5pCR0Kt+k8psUa5RijVKsUS5eloTfJAmdSpeETuUkCb9ZsUYp1ijFGiX+YJAkdCr/kmKNUqxRijXKxUNJ6FROktCpdEk4UemScJKEJ1S6JHQqv0mxRinWKMUa5eLLVLokdConSehUuiR0Kl0SOpUuCU8k4UTlk4o1SrFGKdYoFx+WhE7ljiScJOEkCU8koVM5Ufk/FWuUYo1SrFHiD74oCZ3KE0k4UTlJwh0qdyThROVNxRqlWKMUa5SLlyWhU7kjCScqnUqXhJMkdConSeiScKJyotIloVN5olijFGuUYo1y8TKVE5UTlTuS8KYkdCpPqHRJ6FTeVKxRijVKsUa5eCgJ36TSqTyRhE7ljiT8JsUapVijFGuUi5epvCkJJ0k4UTlROUlCp3KHSpeETyrWKMUapVijXHxYEu5QuUPlJAmdSpeETuUkCZ3KSRK+qVijFGuUYo1y8ccl4QmVE5UnVLokdEnoVJ4o1ijFGqVYo1z8cSonSXgiCXeodEnoVLokvKlYoxRrlGKNcvFhKr9JEjqVE5U7ktCpfFOxRinWKMUaJf7ggSR8k0qXhDepnCThCZVPKtYoxRqlWKPEH6wxijVKsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKN8h+B7/jokluawwAAAABJRU5ErkJggg==	2026-02-24 11:59:12.106
1	60	12	\N	\N	\N	TKT-0060-0012-01	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAALSSURBVO3BQWrEUAwFwX7C979yJ0utPhh7hkSoKv5ijVGsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5SLh5LwTSonSbhD5SQJ36TyRLFGKdYoxRrl4mUqb0rCSRJOVE6S0KmcqLwpCW8q1ijFGqVYo1x8WBLuULlD5SQJnUqn8kQS7lD5pGKNUqxRijXKxTBJOEnCicp/VqxRijVKsUa5+OeS0KmcJGGyYo1SrFGKNcrFh6l8kspJEk5UnlD5S4o1SrFGKdYoFy9LwjcloVM5UemS0KmcJOEvK9YoxRqlWKPEX6wxijVKsUYp1igXDyWhU+mS0Kl0SehUuiR0Km9KQqdyRxI6lZMkdCpvKtYoxRqlWKNcvCwJTyShU7kjCXeodEnoVLokdCpdEk5UPqlYoxRrlGKNcvFlSThR6ZLQqdyh0iXhRKVLQqfSJaFTOUlCp/KmYo1SrFGKNUr8xQNJOFH5piS8SeWOJDyh8kSxRinWKMUa5eIhlTcl4UTlROUkCZ3KHUk4UemS0Kl0SXhTsUYp1ijFGuXij1G5IwknKnckoVPpVLoknKicqLypWKMUa5RijXLxUBK+SaVT6ZLQJaFT6ZLQqbwpCXeoPFGsUYo1SrFGuXiZypuScIdKl4QuCZ1Kl4RO5Y4kdCpdEjqVNxVrlGKNUqxRLj4sCXeo3JGEO1S6JHQqXRLuUOmS0Kl8UrFGKdYoxRrl4p9TOUlCl4RO5Q6VLgldEjqVLgmdypuKNUqxRinWKBf/XBJOVN6UhBOVLgmdSpeETuWJYo1SrFGKNcrFh6l8kkqXhJMkdCpdEjqVLgmdSpeETqVLwicVa5RijVKsUS5eloRvSsIdKl0SOpUuCZ3KiUqXhE6lS8KbijVKsUYp1ijxF2uMYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRinWKMUapVij/ADYWiH7HuriqgAAAABJRU5ErkJggg==	2026-03-27 14:13:20.761204
\.


--
-- Data for Name: upgrade_offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.upgrade_offers (offer_id, purchase_id, user_id, event_id, from_zone_id, to_zone_id, new_row, new_seat, token, status, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (user_id, name, email, password, role, created_at, reset_token, reset_token_expires) FROM stdin;
2	Test User	test@ticket.com	$2b$10$U6KSrszj7MVgBosIOu5OMeHlUwjRZ5z0aQNL0fgA5cSAUVS8bDXjy	admin	2026-01-09 08:56:29.946	\N	\N
3	User Three	user3@ticket.com	$2b$10$9J7SPII.1u6/CsQQhgiDzeh8otjImDaCHM6SjyLEIJsrWaVvlP5na	client	2026-01-09 08:56:29.946	\N	\N
4	Emma De Lai	delaiemma0@gmail.com	$2b$10$RXq6AhI3fsuFngKTUMUHqeuGtUDA8MkGecqYPIGZiNJ21qGiboMIG	client	2026-01-30 08:53:58.465	\N	\N
1	Administrator	demma9604@gmail.com	$2b$10$3/pRjEH3qtaLjFwY.E0/yOhtuNBXsfwwP2KTpPdLaRXxI8KvoOHCK	admin	2026-01-09 08:56:29.946	\N	\N
5	Maria Ion	delaiemma6@gmail.com	$2b$10$eYwkf2fuUzEWonNVfZjOwe9x.4YBw2cPh2aRrfrWLc.yjQKe/Zw6q	client	2026-02-26 16:33:24.136	\N	\N
\.


--
-- Data for Name: venue_layouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.venue_layouts (layout_id, name, description, created_by, created_at) FROM stdin;
1	Test Layout	\N	1	2026-02-06 11:20:33.859
2	Outdoor Cinema - Seats	\N	1	2026-02-06 11:22:18.034
3	Outdoor Cinema - Seats	\N	1	2026-02-11 21:16:18.399
4	Plavia Auto Show - Seats	\N	2	2026-02-11 21:18:22.788
5	Astro Book Club - Seats	\N	1	2026-02-11 21:26:49.79
6	Big Apple Brunch - Seats	\N	1	2026-02-16 13:00:55.074
7	Friendo - Seats	\N	1	2026-02-19 11:08:42.565
8	Rooftop Soirée - Seats	\N	1	2026-02-19 15:15:38.249
9	Miami Social Club - Seats	\N	1	2026-02-19 15:21:31.983
10	bcshbkaj - Seats	\N	1	2026-02-24 15:22:39.581
11	non - Seats	\N	1	2026-02-24 15:25:54.465
12	njlanc - Seats	\N	1	2026-02-24 15:32:09.876
13	Opera Națională București	Sala principală a Operei Naționale București - 860 locuri	1	2026-03-25 09:57:27.556823
14	Teatrul Nottara București	Sala Mare a Teatrului Nottara - 460 locuri	1	2026-03-25 09:57:27.58561
15	Filarmonica Brașov	Sala de Concerte a Filarmonicii Brașov - 600 locuri	1	2026-03-25 09:57:27.596378
16	Venetian Masquerade Ball - Seats	\N	1	2026-03-26 18:29:57.873942
\.


--
-- Data for Name: waitlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.waitlist (waitlist_id, event_id, user_id, status, notified_at, expires_at, created_at) FROM stdin;
\.


--
-- Name: cart_cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_cart_id_seq', 4, true);


--
-- Name: cart_reservations_reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_reservations_reservation_id_seq', 4, true);


--
-- Name: discount_codes_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discount_codes_code_id_seq', 1, false);


--
-- Name: event_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_event_id_seq', 20, true);


--
-- Name: event_layouts_event_layout_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_layouts_event_layout_id_seq', 19, true);


--
-- Name: event_zone_pricing_pricing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_zone_pricing_pricing_id_seq', 63, true);


--
-- Name: favorites_favorite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorites_favorite_id_seq', 1, true);


--
-- Name: layout_rows_row_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.layout_rows_row_id_seq', 681, true);


--
-- Name: newsletter_subscribers_subscriber_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.newsletter_subscribers_subscriber_id_seq', 1, false);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 1, false);


--
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 29, true);


--
-- Name: purchases_purchase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchases_purchase_id_seq', 61, true);


--
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 1, false);


--
-- Name: seat_reservations_reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seat_reservations_reservation_id_seq', 5, true);


--
-- Name: seat_zones_zone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seat_zones_zone_id_seq', 47, true);


--
-- Name: ticket_seats_ticket_seat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_seats_ticket_seat_id_seq', 2, true);


--
-- Name: upgrade_offers_offer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.upgrade_offers_offer_id_seq', 1, true);


--
-- Name: user_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_user_id_seq', 1, false);


--
-- Name: venue_layouts_layout_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.venue_layouts_layout_id_seq', 16, true);


--
-- Name: waitlist_waitlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.waitlist_waitlist_id_seq', 7, true);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (cart_id);


--
-- Name: cart_reservations cart_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_reservations
    ADD CONSTRAINT cart_reservations_pkey PRIMARY KEY (reservation_id);


--
-- Name: discount_codes discount_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_pkey PRIMARY KEY (code_id);


--
-- Name: event_layouts event_layouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_layouts
    ADD CONSTRAINT event_layouts_pkey PRIMARY KEY (event_layout_id);


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (event_id);


--
-- Name: event_zone_pricing event_zone_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_zone_pricing
    ADD CONSTRAINT event_zone_pricing_pkey PRIMARY KEY (pricing_id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (favorite_id);


--
-- Name: layout_rows layout_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layout_rows
    ADD CONSTRAINT layout_rows_pkey PRIMARY KEY (row_id);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (subscriber_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (purchase_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: seat_reservations seat_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_reservations
    ADD CONSTRAINT seat_reservations_pkey PRIMARY KEY (reservation_id);


--
-- Name: seat_zones seat_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_zones
    ADD CONSTRAINT seat_zones_pkey PRIMARY KEY (zone_id);


--
-- Name: ticket_seats ticket_seats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_seats
    ADD CONSTRAINT ticket_seats_pkey PRIMARY KEY (ticket_seat_id);


--
-- Name: upgrade_offers upgrade_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upgrade_offers
    ADD CONSTRAINT upgrade_offers_pkey PRIMARY KEY (offer_id);


--
-- Name: upgrade_offers upgrade_offers_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upgrade_offers
    ADD CONSTRAINT upgrade_offers_token_key UNIQUE (token);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id);


--
-- Name: venue_layouts venue_layouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venue_layouts
    ADD CONSTRAINT venue_layouts_pkey PRIMARY KEY (layout_id);


--
-- Name: waitlist waitlist_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- Name: waitlist waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_pkey PRIMARY KEY (waitlist_id);


--
-- Name: cart_reservations_user_event_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cart_reservations_user_event_key ON public.cart_reservations USING btree (user_id, event_id);


--
-- Name: cart_user_id_event_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cart_user_id_event_id_key ON public.cart USING btree (user_id, event_id);


--
-- Name: discount_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX discount_codes_code_key ON public.discount_codes USING btree (code);


--
-- Name: event_layouts_event_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX event_layouts_event_id_key ON public.event_layouts USING btree (event_id);


--
-- Name: event_zone_pricing_event_id_zone_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX event_zone_pricing_event_id_zone_id_key ON public.event_zone_pricing USING btree (event_id, zone_id);


--
-- Name: favorites_user_id_event_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX favorites_user_id_event_id_key ON public.favorites USING btree (user_id, event_id);


--
-- Name: idx_cart_reservations_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_reservations_event ON public.cart_reservations USING btree (event_id);


--
-- Name: idx_cart_reservations_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_reservations_expires ON public.cart_reservations USING btree (expires_at);


--
-- Name: idx_cart_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_user ON public.cart USING btree (user_id);


--
-- Name: idx_discount_codes_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discount_codes_active ON public.discount_codes USING btree (is_active);


--
-- Name: idx_discount_codes_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discount_codes_code ON public.discount_codes USING btree (code);


--
-- Name: idx_event_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_date ON public.event USING btree (date, "time");


--
-- Name: idx_event_layouts_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_layouts_event ON public.event_layouts USING btree (event_id);


--
-- Name: idx_event_zone_pricing_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_zone_pricing_event ON public.event_zone_pricing USING btree (event_id);


--
-- Name: idx_favorites_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_favorites_user ON public.favorites USING btree (user_id);


--
-- Name: idx_layout_rows_layout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_layout_rows_layout ON public.layout_rows USING btree (layout_id);


--
-- Name: idx_newsletter_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers USING btree (email);


--
-- Name: idx_payments_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_created ON public.payments USING btree (created_at);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_stripe_intent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_stripe_intent ON public.payments USING btree (stripe_payment_intent_id);


--
-- Name: idx_payments_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_user ON public.payments USING btree (user_id);


--
-- Name: idx_purchases_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchases_event ON public.purchases USING btree (event_id);


--
-- Name: idx_purchases_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchases_user ON public.purchases USING btree (user_id);


--
-- Name: idx_seat_reservations_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_seat_reservations_event ON public.seat_reservations USING btree (event_id);


--
-- Name: idx_seat_reservations_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_seat_reservations_expires ON public.seat_reservations USING btree (expires_at);


--
-- Name: idx_seat_reservations_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_seat_reservations_user ON public.seat_reservations USING btree (user_id);


--
-- Name: idx_seat_zones_layout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_seat_zones_layout ON public.seat_zones USING btree (layout_id);


--
-- Name: idx_ticket_seats_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ticket_seats_event ON public.ticket_seats USING btree (event_id);


--
-- Name: idx_ticket_seats_purchase; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ticket_seats_purchase ON public.ticket_seats USING btree (purchase_id);


--
-- Name: idx_user_reset_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_reset_token ON public."user" USING btree (reset_token);


--
-- Name: layout_rows_layout_id_row_letter_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX layout_rows_layout_id_row_letter_key ON public.layout_rows USING btree (layout_id, row_letter);


--
-- Name: layout_rows_layout_id_row_order_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX layout_rows_layout_id_row_order_key ON public.layout_rows USING btree (layout_id, row_order);


--
-- Name: newsletter_subscribers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);


--
-- Name: payments_stripe_payment_intent_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payments_stripe_payment_intent_id_key ON public.payments USING btree (stripe_payment_intent_id);


--
-- Name: reviews_user_id_event_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX reviews_user_id_event_id_key ON public.reviews USING btree (user_id, event_id);


--
-- Name: seat_reservations_event_id_row_letter_seat_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX seat_reservations_event_id_row_letter_seat_number_key ON public.seat_reservations USING btree (event_id, row_letter, seat_number);


--
-- Name: seat_zones_layout_id_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX seat_zones_layout_id_name_key ON public.seat_zones USING btree (layout_id, name);


--
-- Name: ticket_seats_event_id_row_letter_seat_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ticket_seats_event_id_row_letter_seat_number_key ON public.ticket_seats USING btree (event_id, row_letter, seat_number);


--
-- Name: ticket_seats_ticket_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ticket_seats_ticket_id_key ON public.ticket_seats USING btree (ticket_id);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: cart cart_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: cart_reservations cart_reservations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_reservations
    ADD CONSTRAINT cart_reservations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: cart_reservations cart_reservations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_reservations
    ADD CONSTRAINT cart_reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE CASCADE;


--
-- Name: cart cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE CASCADE;


--
-- Name: event_layouts event_layouts_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_layouts
    ADD CONSTRAINT event_layouts_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: event_layouts event_layouts_layout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_layouts
    ADD CONSTRAINT event_layouts_layout_id_fkey FOREIGN KEY (layout_id) REFERENCES public.venue_layouts(layout_id);


--
-- Name: event event_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE SET NULL;


--
-- Name: event_zone_pricing event_zone_pricing_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_zone_pricing
    ADD CONSTRAINT event_zone_pricing_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: event_zone_pricing event_zone_pricing_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_zone_pricing
    ADD CONSTRAINT event_zone_pricing_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.seat_zones(zone_id) ON DELETE CASCADE;


--
-- Name: favorites favorites_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE CASCADE;


--
-- Name: layout_rows layout_rows_layout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layout_rows
    ADD CONSTRAINT layout_rows_layout_id_fkey FOREIGN KEY (layout_id) REFERENCES public.venue_layouts(layout_id) ON DELETE CASCADE;


--
-- Name: layout_rows layout_rows_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layout_rows
    ADD CONSTRAINT layout_rows_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.seat_zones(zone_id) ON DELETE CASCADE;


--
-- Name: notifications notifications_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE CASCADE;


--
-- Name: payments payments_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(purchase_id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE CASCADE;


--
-- Name: purchases purchases_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: purchases purchases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE CASCADE;


--
-- Name: seat_reservations seat_reservations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_reservations
    ADD CONSTRAINT seat_reservations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: seat_reservations seat_reservations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_reservations
    ADD CONSTRAINT seat_reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE CASCADE;


--
-- Name: seat_reservations seat_reservations_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_reservations
    ADD CONSTRAINT seat_reservations_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.seat_zones(zone_id) ON DELETE CASCADE;


--
-- Name: seat_zones seat_zones_layout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_zones
    ADD CONSTRAINT seat_zones_layout_id_fkey FOREIGN KEY (layout_id) REFERENCES public.venue_layouts(layout_id) ON DELETE CASCADE;


--
-- Name: ticket_seats ticket_seats_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_seats
    ADD CONSTRAINT ticket_seats_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: ticket_seats ticket_seats_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_seats
    ADD CONSTRAINT ticket_seats_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(purchase_id) ON DELETE CASCADE;


--
-- Name: ticket_seats ticket_seats_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_seats
    ADD CONSTRAINT ticket_seats_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.seat_zones(zone_id);


--
-- Name: upgrade_offers upgrade_offers_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upgrade_offers
    ADD CONSTRAINT upgrade_offers_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(purchase_id);


--
-- Name: venue_layouts venue_layouts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venue_layouts
    ADD CONSTRAINT venue_layouts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(user_id) ON DELETE SET NULL;


--
-- Name: waitlist waitlist_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;


--
-- Name: waitlist waitlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

