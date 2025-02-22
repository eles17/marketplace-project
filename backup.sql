--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    sub1_id integer
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    price numeric(15,2) NOT NULL,
    category integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    image_url text,
    subcategory integer
);


ALTER TABLE public.listings OWNER TO postgres;

--
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.listings_id_seq OWNER TO postgres;

--
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer,
    receiver_id integer,
    listing_id integer NOT NULL,
    listing_type character varying(50),
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_listing_type_check CHECK (((listing_type)::text = ANY ((ARRAY['Product'::character varying, 'Vehicle'::character varying, 'RealEstate'::character varying])::text[])))
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: real_estate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.real_estate (
    id integer NOT NULL,
    user_id integer,
    category_id integer,
    name character varying(255) NOT NULL,
    type character varying(255),
    description text,
    address text,
    price_per_month numeric(10,2) NOT NULL,
    rental_period character varying(50),
    advance_payment numeric(10,2),
    available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT real_estate_advance_payment_check CHECK ((advance_payment >= (0)::numeric)),
    CONSTRAINT real_estate_price_per_month_check CHECK ((price_per_month > (0)::numeric))
);


ALTER TABLE public.real_estate OWNER TO postgres;

--
-- Name: real_estate_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.real_estate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.real_estate_id_seq OWNER TO postgres;

--
-- Name: real_estate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.real_estate_id_seq OWNED BY public.real_estate.id;


--
-- Name: requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requests (
    id integer NOT NULL,
    sender_id integer,
    receiver_id integer,
    listing_id integer NOT NULL,
    listing_type character varying(50),
    message text NOT NULL,
    status character varying(50) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT requests_listing_type_check CHECK (((listing_type)::text = ANY ((ARRAY['Product'::character varying, 'Vehicle'::character varying, 'RealEstate'::character varying])::text[]))),
    CONSTRAINT requests_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Accepted'::character varying, 'Declined'::character varying])::text[])))
);


ALTER TABLE public.requests OWNER TO postgres;

--
-- Name: requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.requests_id_seq OWNER TO postgres;

--
-- Name: requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.requests_id_seq OWNED BY public.requests.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    full_name character varying(255),
    address text,
    is_admin boolean DEFAULT false,
    is_banned boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    user_id integer,
    category_id integer,
    name character varying(255) NOT NULL,
    model character varying(255),
    vehicle_type character varying(255),
    description text,
    price numeric(10,2) NOT NULL,
    first_registration date,
    mileage integer,
    fuel_type character varying(50),
    color character varying(50),
    condition character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vehicles_condition_check CHECK (((condition)::text = ANY ((ARRAY['New'::character varying, 'Used'::character varying, 'Broken'::character varying])::text[]))),
    CONSTRAINT vehicles_mileage_check CHECK ((mileage >= 0)),
    CONSTRAINT vehicles_price_check CHECK ((price > (0)::numeric))
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vehicles_id_seq OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: listings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings ALTER COLUMN id SET DEFAULT nextval('public.listings_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: real_estate id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.real_estate ALTER COLUMN id SET DEFAULT nextval('public.real_estate_id_seq'::regclass);


--
-- Name: requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests ALTER COLUMN id SET DEFAULT nextval('public.requests_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, sub1_id) FROM stdin;
1	Vehicles	\N
2	Real Estate	\N
3	Retail	\N
4	Cars	1
5	Motorcycles	1
6	Trucks	1
7	Apartments	2
8	Houses	2
9	Commercial Properties	2
10	Land	2
11	Clothing	3
12	Sports & Outdoor	3
13	Electronics	3
14	Furniture	3
15	Beauty & Health	3
16	Home & Kitchen	3
17	Toys & Games	3
18	Books & Media	3
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listings (id, title, description, price, category, created_at, user_id, image_url, subcategory) FROM stdin;
13	Test 2 edit	test desc	85.00	5	2025-02-21 14:56:42.425589	6	/uploads/1740146202410-sub end screen.jpeg	\N
14	AUDI	audi a7	20000.00	5	2025-02-21 15:14:30.109718	6	/uploads/1740147270088-IMG_1738.jpeg	\N
18	agsr	sg	3435.00	4	2025-02-21 17:57:34.284364	6	\N	\N
19	macbook	as	21324.00	13	2025-02-21 18:00:10.528958	6	\N	\N
2	iPhone 13	128GB, like new	700.00	3	2025-02-17 21:30:00.665692	2	\N	\N
1	MacBook Pro M1	16-inch, 16GB RAM, 512GB SSD	1800.00	3	2025-02-17 21:30:00.665692	2	\N	13
15	Iphone 15	wie neu	700.00	3	2025-02-21 15:15:34.092771	6	/uploads/1740147334079-sub end screen.jpeg	11
25	BMW 2	AVTO avto	60000.00	4	2025-02-21 19:36:00.112532	6	/uploads/1740162960095-sub end screen.jpeg	\N
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, receiver_id, listing_id, listing_type, message, is_read, created_at) FROM stdin;
1	3	2	1	Product	Hey, is the MacBook still available?	f	2025-02-17 21:32:54.563761
2	2	3	1	Product	Yes, still available. Let me know if you’re interested!	f	2025-02-17 21:32:54.563761
3	3	2	3	Vehicle	Can I see the car this weekend?	f	2025-02-17 21:32:54.563761
4	2	3	3	Vehicle	Sure, what time works for you?	f	2025-02-17 21:32:54.563761
5	3	2	1	Product	Hey, is the MacBook still available?	f	2025-02-17 21:36:05.524429
6	2	3	1	Product	Yes, still available. Let me know if you’re interested!	f	2025-02-17 21:36:05.524429
7	3	2	2	Product	Would you accept 600€ for the iPhone?	f	2025-02-17 21:36:05.524429
8	2	3	2	Product	Sorry, I can only go down to 650€.	f	2025-02-17 21:36:05.524429
9	3	2	3	Vehicle	Can I see the Toyota this weekend?	f	2025-02-17 21:36:05.533529
10	2	3	3	Vehicle	Sure, what time works for you?	f	2025-02-17 21:36:05.533529
11	3	2	4	Vehicle	Is the Harley still available?	f	2025-02-17 21:36:05.533529
12	2	3	4	Vehicle	Yes, do you want to schedule a test ride?	f	2025-02-17 21:36:05.533529
13	3	2	5	RealEstate	Is the apartment available for viewing?	f	2025-02-17 21:36:05.534114
14	2	3	5	RealEstate	Yes, I am available this Saturday.	f	2025-02-17 21:36:05.534114
15	3	2	6	RealEstate	Is the house still up for rent?	f	2025-02-17 21:36:05.534114
16	2	3	6	RealEstate	Yes, but I have another person interested. When do you want to visit?	f	2025-02-17 21:36:05.534114
\.


--
-- Data for Name: real_estate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.real_estate (id, user_id, category_id, name, type, description, address, price_per_month, rental_period, advance_payment, available, created_at) FROM stdin;
1	2	\N	Modern Apartment	Apartment	2-bedroom, fully furnished	789 City Center St	1200.00	Monthly	2400.00	t	2025-02-17 21:30:20.830563
2	2	\N	Family House	House	4-bedroom, garden included	456 Suburb Lane	2500.00	Yearly	5000.00	t	2025-02-17 21:30:20.830563
\.


--
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requests (id, sender_id, receiver_id, listing_id, listing_type, message, status, created_at) FROM stdin;
1	3	2	1	Product	Is the MacBook still available?	Pending	2025-02-17 21:30:28.699413
2	3	2	2	Product	Can you lower the price for the iPhone?	Pending	2025-02-17 21:30:28.699413
3	3	2	3	Vehicle	Interested in test-driving the Toyota?	Pending	2025-02-17 21:30:28.699413
4	3	2	4	RealEstate	Is the apartment available for viewing?	Pending	2025-02-17 21:30:28.699413
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, full_name, address, is_admin, is_banned, created_at) FROM stdin;
1	admin@example.com	$2b$10$wJlFzrj5P7/qZCmt.9n3WeYrflTK4J1ObQK.wQ5fnd5lxM7m9jIfG	Admin User	street 1	t	f	2025-02-17 21:29:19.749174
2	seller@example.com	$2b$10$wJlFzrj5P7/qZCmt.9n3WeYrflTK4J1ObQK.wQ5fnd5lxM7m9jIfG	Seller Name	street 2	f	f	2025-02-17 21:29:19.749174
3	buyer@example.com	$2b$10$wJlFzrj5P7/qZCmt.9n3WeYrflTK4J1ObQK.wQ5fnd5lxM7m9jIfG	Buyer Name	street 3	f	f	2025-02-17 21:29:19.749174
4	lev.starman1@gmail.com	$2b$12$obXq4nM/AYs5vmIAs9ADoOdPZVA0pOY3OVMEUGorSZlkvMOi0S.h.	lev	klagenfurt 5	f	f	2025-02-19 22:10:02.875778
5	eles@gmail.com	$2b$12$WGbQk/CReda2JDb5/ABaqO.iXCMR2A/pHuyrje70gyT5gje0Hqx4q	eles	kalgenfurt 87	f	f	2025-02-19 22:27:40.885774
6	test@lev.com	$2b$12$1aHS6I0..iehURMObgvAGeqXDvSvtXDtYMNpw85LaGsKQIL8d4sMO	Test Lev	klagenfurt 33	t	f	2025-02-19 22:39:19.259852
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, user_id, category_id, name, model, vehicle_type, description, price, first_registration, mileage, fuel_type, color, condition, created_at) FROM stdin;
1	2	\N	Toyota Corolla	2021	Sedan	Well-maintained car	15000.00	2021-03-15	30000	Petrol	White	Used	2025-02-17 21:30:15.162041
2	2	\N	Harley Davidson	Iron 883	Motorcycle	Custom exhaust, blacked-out	9000.00	2019-08-22	15000	Petrol	Black	Used	2025-02-17 21:30:15.162041
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 18, true);


--
-- Name: listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.listings_id_seq', 26, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 16, true);


--
-- Name: real_estate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.real_estate_id_seq', 2, true);


--
-- Name: requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.requests_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 2, true);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: real_estate real_estate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.real_estate
    ADD CONSTRAINT real_estate_pkey PRIMARY KEY (id);


--
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: idx_real_estate_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_real_estate_category ON public.real_estate USING btree (category_id);


--
-- Name: idx_real_estate_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_real_estate_user ON public.real_estate USING btree (user_id);


--
-- Name: idx_requests_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_receiver ON public.requests USING btree (receiver_id);


--
-- Name: idx_requests_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_sender ON public.requests USING btree (sender_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_vehicles_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicles_category ON public.vehicles USING btree (category_id);


--
-- Name: idx_vehicles_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicles_user ON public.vehicles USING btree (user_id);


--
-- Name: categories categories_sub1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_sub1_id_fkey FOREIGN KEY (sub1_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: listings listings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: real_estate real_estate_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.real_estate
    ADD CONSTRAINT real_estate_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: requests requests_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: requests requests_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vehicles vehicles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

