--
-- PostgreSQL database dump
--

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_submitted_by_fkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_request_id_fkey;
ALTER TABLE IF EXISTS ONLY public.submission_files DROP CONSTRAINT IF EXISTS submission_files_submission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.requests DROP CONSTRAINT IF EXISTS requests_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.requests DROP CONSTRAINT IF EXISTS requests_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.requests DROP CONSTRAINT IF EXISTS requests_assigned_to_fkey;
ALTER TABLE IF EXISTS ONLY public.requests DROP CONSTRAINT IF EXISTS requests_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.request_deliverables DROP CONSTRAINT IF EXISTS request_deliverables_request_id_fkey;
ALTER TABLE IF EXISTS ONLY public.request_attachments DROP CONSTRAINT IF EXISTS request_attachments_uploaded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.request_attachments DROP CONSTRAINT IF EXISTS request_attachments_request_id_fkey;
ALTER TABLE IF EXISTS ONLY public.public_sample_showcases DROP CONSTRAINT IF EXISTS public_sample_showcases_batch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_request_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_ticket_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_submission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_request_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_read_by DROP CONSTRAINT IF EXISTS message_read_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_read_by DROP CONSTRAINT IF EXISTS message_read_by_message_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_attachments DROP CONSTRAINT IF EXISTS message_attachments_message_id_fkey;
ALTER TABLE IF EXISTS ONLY public.magic_login_tokens DROP CONSTRAINT IF EXISTS magic_login_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.integration_events DROP CONSTRAINT IF EXISTS integration_events_batch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.integration_assets DROP CONSTRAINT IF EXISTS integration_assets_claimed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.company_leads DROP CONSTRAINT IF EXISTS company_leads_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_key_people DROP CONSTRAINT IF EXISTS company_key_people_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_company_id_fkey;
DROP INDEX IF EXISTS public.uq_showcase_external_id;
DROP INDEX IF EXISTS public.idx_submissions_request_id;
DROP INDEX IF EXISTS public.idx_submission_files_submission_id;
DROP INDEX IF EXISTS public.idx_requests_status;
DROP INDEX IF EXISTS public.idx_requests_service_type;
DROP INDEX IF EXISTS public.idx_requests_created_at;
DROP INDEX IF EXISTS public.idx_requests_company_id;
DROP INDEX IF EXISTS public.idx_requests_assigned_to;
DROP INDEX IF EXISTS public.idx_request_deliverables_request_id;
DROP INDEX IF EXISTS public.idx_request_attachments_request_id;
DROP INDEX IF EXISTS public.idx_public_samples_status;
DROP INDEX IF EXISTS public.idx_public_samples_slug;
DROP INDEX IF EXISTS public.idx_public_samples_demo;
DROP INDEX IF EXISTS public.idx_public_sample_inquiries_slug;
DROP INDEX IF EXISTS public.idx_public_sample_inquiries_created_at;
DROP INDEX IF EXISTS public.idx_payments_status;
DROP INDEX IF EXISTS public.idx_payments_request_id;
DROP INDEX IF EXISTS public.idx_payments_gateway_order;
DROP INDEX IF EXISTS public.idx_payments_company_id;
DROP INDEX IF EXISTS public.idx_notifications_user_read;
DROP INDEX IF EXISTS public.idx_messages_request_id;
DROP INDEX IF EXISTS public.idx_messages_created_at;
DROP INDEX IF EXISTS public.idx_magic_tokens_hash;
DROP INDEX IF EXISTS public.idx_integration_assets_client;
DROP INDEX IF EXISTS public.idx_idemp_expires;
DROP INDEX IF EXISTS public.idx_events_batch;
DROP INDEX IF EXISTS public.idx_company_leads_company_id;
DROP INDEX IF EXISTS public.idx_batches_campaign;
DROP INDEX IF EXISTS public.idx_api_clients_hash;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.submission_files DROP CONSTRAINT IF EXISTS submission_files_pkey;
ALTER TABLE IF EXISTS ONLY public.service_channel_settings DROP CONSTRAINT IF EXISTS service_channel_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.requests DROP CONSTRAINT IF EXISTS requests_ticket_id_key;
ALTER TABLE IF EXISTS ONLY public.requests DROP CONSTRAINT IF EXISTS requests_pkey;
ALTER TABLE IF EXISTS ONLY public.request_deliverables DROP CONSTRAINT IF EXISTS request_deliverables_pkey;
ALTER TABLE IF EXISTS ONLY public.request_attachments DROP CONSTRAINT IF EXISTS request_attachments_pkey;
ALTER TABLE IF EXISTS ONLY public.public_sample_showcases DROP CONSTRAINT IF EXISTS public_sample_showcases_slug_key;
ALTER TABLE IF EXISTS ONLY public.public_sample_showcases DROP CONSTRAINT IF EXISTS public_sample_showcases_pkey;
ALTER TABLE IF EXISTS ONLY public.public_sample_inquiries DROP CONSTRAINT IF EXISTS public_sample_inquiries_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_invoice_number_key;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_token_key;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.message_read_by DROP CONSTRAINT IF EXISTS message_read_by_pkey;
ALTER TABLE IF EXISTS ONLY public.message_read_by DROP CONSTRAINT IF EXISTS message_read_by_message_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.message_attachments DROP CONSTRAINT IF EXISTS message_attachments_pkey;
ALTER TABLE IF EXISTS ONLY public.magic_login_tokens DROP CONSTRAINT IF EXISTS magic_login_tokens_token_hash_key;
ALTER TABLE IF EXISTS ONLY public.magic_login_tokens DROP CONSTRAINT IF EXISTS magic_login_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.integration_idempotency_keys DROP CONSTRAINT IF EXISTS integration_idempotency_keys_pkey;
ALTER TABLE IF EXISTS ONLY public.integration_events DROP CONSTRAINT IF EXISTS integration_events_pkey;
ALTER TABLE IF EXISTS ONLY public.integration_batches DROP CONSTRAINT IF EXISTS integration_batches_pkey;
ALTER TABLE IF EXISTS ONLY public.integration_assets DROP CONSTRAINT IF EXISTS integration_assets_pkey;
ALTER TABLE IF EXISTS ONLY public.integration_assets DROP CONSTRAINT IF EXISTS integration_assets_asset_key_key;
ALTER TABLE IF EXISTS ONLY public.company_leads DROP CONSTRAINT IF EXISTS company_leads_pkey;
ALTER TABLE IF EXISTS ONLY public.company_key_people DROP CONSTRAINT IF EXISTS company_key_people_pkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_pkey;
ALTER TABLE IF EXISTS ONLY public.api_clients DROP CONSTRAINT IF EXISTS api_clients_pkey;
ALTER TABLE IF EXISTS ONLY public.api_clients DROP CONSTRAINT IF EXISTS api_clients_client_id_key;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.submissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.submission_files ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.request_deliverables ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.request_attachments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.public_sample_showcases ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.public_sample_inquiries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.password_reset_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_read_by ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_attachments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.magic_login_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.integration_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.integration_assets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.company_leads ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.company_key_people ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.companies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.api_clients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_logs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.submissions_id_seq;
DROP TABLE IF EXISTS public.submissions;
DROP SEQUENCE IF EXISTS public.submission_files_id_seq;
DROP TABLE IF EXISTS public.submission_files;
DROP TABLE IF EXISTS public.service_channel_settings;
DROP TABLE IF EXISTS public.role_permissions;
DROP SEQUENCE IF EXISTS public.requests_id_seq;
DROP TABLE IF EXISTS public.requests;
DROP SEQUENCE IF EXISTS public.request_deliverables_id_seq;
DROP TABLE IF EXISTS public.request_deliverables;
DROP SEQUENCE IF EXISTS public.request_attachments_id_seq;
DROP TABLE IF EXISTS public.request_attachments;
DROP SEQUENCE IF EXISTS public.public_sample_showcases_id_seq;
DROP TABLE IF EXISTS public.public_sample_showcases;
DROP SEQUENCE IF EXISTS public.public_sample_inquiries_id_seq;
DROP TABLE IF EXISTS public.public_sample_inquiries;
DROP SEQUENCE IF EXISTS public.payments_id_seq;
DROP TABLE IF EXISTS public.payments;
DROP SEQUENCE IF EXISTS public.password_reset_tokens_id_seq;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.messages_id_seq;
DROP TABLE IF EXISTS public.messages;
DROP SEQUENCE IF EXISTS public.message_read_by_id_seq;
DROP TABLE IF EXISTS public.message_read_by;
DROP SEQUENCE IF EXISTS public.message_attachments_id_seq;
DROP TABLE IF EXISTS public.message_attachments;
DROP SEQUENCE IF EXISTS public.magic_login_tokens_id_seq;
DROP TABLE IF EXISTS public.magic_login_tokens;
DROP TABLE IF EXISTS public.integration_idempotency_keys;
DROP SEQUENCE IF EXISTS public.integration_events_id_seq;
DROP TABLE IF EXISTS public.integration_events;
DROP TABLE IF EXISTS public.integration_batches;
DROP SEQUENCE IF EXISTS public.integration_assets_id_seq;
DROP TABLE IF EXISTS public.integration_assets;
DROP SEQUENCE IF EXISTS public.company_leads_id_seq;
DROP TABLE IF EXISTS public.company_leads;
DROP SEQUENCE IF EXISTS public.company_key_people_id_seq;
DROP TABLE IF EXISTS public.company_key_people;
DROP SEQUENCE IF EXISTS public.companies_id_seq;
DROP TABLE IF EXISTS public.companies;
DROP SEQUENCE IF EXISTS public.api_clients_id_seq;
DROP TABLE IF EXISTS public.api_clients;
DROP SEQUENCE IF EXISTS public.activity_logs_id_seq;
DROP TABLE IF EXISTS public.activity_logs;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    user_name character varying(255),
    company_id integer,
    action character varying(255) NOT NULL,
    details text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: api_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_clients (
    id integer NOT NULL,
    client_id character varying(64) NOT NULL,
    client_name character varying(100) NOT NULL,
    api_key_hash character varying(64) NOT NULL,
    scopes text[] DEFAULT ARRAY['prospects:read'::text, 'prospects:write'::text],
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    allow_auto_publish boolean DEFAULT false,
    allowed_sender_emails text[] DEFAULT ARRAY[]::text[],
    created_at timestamp with time zone DEFAULT now(),
    last_used_at timestamp with time zone
);


--
-- Name: api_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_clients_id_seq OWNED BY public.api_clients.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    contact_person character varying(255),
    email character varying(255),
    phone character varying(100),
    website character varying(500),
    industry character varying(255),
    company_info text,
    research_summary text,
    created_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_key_people; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_key_people (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(255),
    department character varying(255),
    contact character varying(255),
    social_profile character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: company_key_people_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_key_people_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_key_people_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_key_people_id_seq OWNED BY public.company_key_people.id;


--
-- Name: company_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_leads (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    title character varying(255),
    lead_company character varying(255),
    email character varying(255),
    linkedin character varying(500),
    location character varying(255),
    status character varying(100) DEFAULT 'Unverified'::character varying,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    logo_url text,
    website text
);


--
-- Name: company_leads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_leads_id_seq OWNED BY public.company_leads.id;


--
-- Name: integration_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration_assets (
    id integer NOT NULL,
    asset_key text NOT NULL,
    client_id character varying(64) NOT NULL,
    sha256 character varying(64),
    size bigint NOT NULL,
    mime_type character varying(100) DEFAULT 'application/pdf'::character varying,
    status character varying(30) DEFAULT 'STAGED'::character varying NOT NULL,
    claimed_by integer,
    expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: integration_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.integration_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: integration_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.integration_assets_id_seq OWNED BY public.integration_assets.id;


--
-- Name: integration_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration_batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id character varying(64) NOT NULL,
    external_campaign_id character varying(255) NOT NULL,
    pushed_by_email character varying(255) NOT NULL,
    total_count integer DEFAULT 0 NOT NULL,
    success_count integer DEFAULT 0 NOT NULL,
    fail_count integer DEFAULT 0 NOT NULL,
    status character varying(30) DEFAULT 'RECEIVED'::character varying NOT NULL,
    idempotency_key character varying(128),
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: integration_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration_events (
    id bigint NOT NULL,
    batch_id uuid,
    event_type character varying(50) NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: integration_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.integration_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: integration_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.integration_events_id_seq OWNED BY public.integration_events.id;


--
-- Name: integration_idempotency_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration_idempotency_keys (
    client_id character varying(64) NOT NULL,
    idempotency_key character varying(128) NOT NULL,
    status character varying(20) DEFAULT 'IN_PROGRESS'::character varying NOT NULL,
    body_hash character varying(64) NOT NULL,
    response_status integer,
    response_body jsonb,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval)
);


--
-- Name: magic_login_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.magic_login_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: magic_login_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.magic_login_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: magic_login_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.magic_login_tokens_id_seq OWNED BY public.magic_login_tokens.id;


--
-- Name: message_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_attachments (
    id integer NOT NULL,
    message_id integer NOT NULL,
    name character varying(500),
    url text,
    size character varying(50),
    type character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: message_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_attachments_id_seq OWNED BY public.message_attachments.id;


--
-- Name: message_read_by; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_read_by (
    id integer NOT NULL,
    message_id integer NOT NULL,
    user_id integer NOT NULL,
    read_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: message_read_by_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_read_by_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_read_by_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_read_by_id_seq OWNED BY public.message_read_by.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    request_id integer NOT NULL,
    sender_id integer,
    sender_name character varying(255),
    sender_role character varying(100),
    text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(100) NOT NULL,
    title character varying(500),
    message text,
    ticket_id integer,
    ticket_code character varying(50),
    submission_id integer,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(500) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    invoice_number character varying(100),
    request_id integer,
    user_id integer,
    company_id integer,
    amount numeric(10,2) DEFAULT 0 NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    payment_method character varying(255),
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    gateway character varying(50) DEFAULT 'MANUAL'::character varying,
    gateway_order_id character varying(255),
    gateway_payment_id character varying(255),
    gateway_signature character varying(500),
    metadata jsonb
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: public_sample_inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_sample_inquiries (
    id integer NOT NULL,
    slug character varying(255) NOT NULL,
    company_name character varying(255),
    sender_name character varying(255),
    sender_email character varying(255) NOT NULL,
    message text,
    status character varying(50) DEFAULT 'NEW'::character varying,
    super_admin_notified boolean DEFAULT false,
    app_email_notified boolean DEFAULT false,
    sender_notified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: public_sample_inquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.public_sample_inquiries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: public_sample_inquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.public_sample_inquiries_id_seq OWNED BY public.public_sample_inquiries.id;


--
-- Name: public_sample_showcases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_sample_showcases (
    id integer NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    company_name character varying(255) NOT NULL,
    description text,
    logo_url text,
    status character varying(50) DEFAULT 'PUBLISHED'::character varying NOT NULL,
    company_study jsonb DEFAULT '{}'::jsonb,
    leads jsonb DEFAULT '[]'::jsonb,
    lead_studies jsonb DEFAULT '[]'::jsonb,
    pitch_deck jsonb DEFAULT '{}'::jsonb,
    published_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    logo_asset_key text,
    source_platform character varying(50) DEFAULT 'MANUAL'::character varying,
    external_campaign_id character varying(255),
    external_prospect_id character varying(255),
    batch_id uuid,
    created_by_email character varying(255),
    outreach_mail_template jsonb DEFAULT '{}'::jsonb,
    is_demo boolean DEFAULT false,
    view_count integer DEFAULT 0
);


--
-- Name: public_sample_showcases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.public_sample_showcases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: public_sample_showcases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.public_sample_showcases_id_seq OWNED BY public.public_sample_showcases.id;


--
-- Name: request_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request_attachments (
    id integer NOT NULL,
    request_id integer NOT NULL,
    name character varying(500) NOT NULL,
    url text NOT NULL,
    size character varying(50),
    type character varying(255),
    uploaded_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: request_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.request_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: request_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.request_attachments_id_seq OWNED BY public.request_attachments.id;


--
-- Name: request_deliverables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request_deliverables (
    id integer NOT NULL,
    request_id integer NOT NULL,
    title character varying(500) NOT NULL,
    url text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    delivered_at timestamp with time zone DEFAULT now()
);


--
-- Name: request_deliverables_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.request_deliverables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: request_deliverables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.request_deliverables_id_seq OWNED BY public.request_deliverables.id;


--
-- Name: requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requests (
    id integer NOT NULL,
    ticket_id character varying(50) NOT NULL,
    user_id integer NOT NULL,
    company_id integer,
    service_type character varying(100) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    priority character varying(50) DEFAULT 'MEDIUM'::character varying NOT NULL,
    status character varying(100) DEFAULT 'REQUEST_CREATED'::character varying NOT NULL,
    price numeric(10,2) DEFAULT 0,
    payment_status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    assigned_team character varying(255),
    assigned_to integer,
    current_submission_version integer DEFAULT 0,
    due_date timestamp with time zone,
    notes text,
    approved_at timestamp with time zone,
    approved_by integer,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.requests_id_seq OWNED BY public.requests.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role character varying(50) NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_channel_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_channel_settings (
    id character varying(100) NOT NULL,
    channel character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    is_channel boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: submission_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submission_files (
    id integer NOT NULL,
    submission_id integer NOT NULL,
    name character varying(500) NOT NULL,
    url text NOT NULL,
    size character varying(50),
    type character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: submission_files_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.submission_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submission_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.submission_files_id_seq OWNED BY public.submission_files.id;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id integer NOT NULL,
    request_id integer NOT NULL,
    ticket_code character varying(50),
    version integer DEFAULT 1 NOT NULL,
    title character varying(500),
    description text,
    external_link text,
    notes text,
    submitted_by integer,
    submitted_by_name character varying(255),
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(100) DEFAULT 'PENDING_REVIEW'::character varying NOT NULL,
    reviewed_by integer,
    reviewer_name character varying(255),
    review_status character varying(100),
    review_feedback text,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'USER'::character varying NOT NULL,
    company_boost boolean DEFAULT false NOT NULL,
    company_lead boolean DEFAULT false NOT NULL,
    company_ui boolean DEFAULT false NOT NULL,
    company_id integer,
    phone character varying(100),
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    avatar text,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: api_clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_clients ALTER COLUMN id SET DEFAULT nextval('public.api_clients_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_key_people id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_key_people ALTER COLUMN id SET DEFAULT nextval('public.company_key_people_id_seq'::regclass);


--
-- Name: company_leads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_leads ALTER COLUMN id SET DEFAULT nextval('public.company_leads_id_seq'::regclass);


--
-- Name: integration_assets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_assets ALTER COLUMN id SET DEFAULT nextval('public.integration_assets_id_seq'::regclass);


--
-- Name: integration_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_events ALTER COLUMN id SET DEFAULT nextval('public.integration_events_id_seq'::regclass);


--
-- Name: magic_login_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magic_login_tokens ALTER COLUMN id SET DEFAULT nextval('public.magic_login_tokens_id_seq'::regclass);


--
-- Name: message_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments ALTER COLUMN id SET DEFAULT nextval('public.message_attachments_id_seq'::regclass);


--
-- Name: message_read_by id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_read_by ALTER COLUMN id SET DEFAULT nextval('public.message_read_by_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: public_sample_inquiries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_sample_inquiries ALTER COLUMN id SET DEFAULT nextval('public.public_sample_inquiries_id_seq'::regclass);


--
-- Name: public_sample_showcases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_sample_showcases ALTER COLUMN id SET DEFAULT nextval('public.public_sample_showcases_id_seq'::regclass);


--
-- Name: request_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_attachments ALTER COLUMN id SET DEFAULT nextval('public.request_attachments_id_seq'::regclass);


--
-- Name: request_deliverables id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_deliverables ALTER COLUMN id SET DEFAULT nextval('public.request_deliverables_id_seq'::regclass);


--
-- Name: requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requests ALTER COLUMN id SET DEFAULT nextval('public.requests_id_seq'::regclass);


--
-- Name: submission_files id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_files ALTER COLUMN id SET DEFAULT nextval('public.submission_files_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, user_id, user_name, company_id, action, details, created_at) FROM stdin;
682	188	Flow Test Client	128	LOGIN	Flow Test Client (USER) logged in.	2026-10-12 11:51:40.067299+05:30
683	39	CreativeGini Super Admin	\N	LOGIN	CreativeGini Super Admin (SUPER_ADMIN) logged in.	2026-10-12 12:13:34.424905+05:30
685	93	Data I2I Client	56	LOGIN	Data I2I Client (USER) logged in.	2026-10-12 14:06:03.223245+05:30
686	93	Data I2I Client	56	LOGIN	Data I2I Client (USER) logged in.	2026-10-12 14:06:19.661484+05:30
687	93	Data I2I Client	56	LOGIN	Data I2I Client (USER) logged in.	2026-10-12 14:12:16.209471+05:30
688	93	Data I2I Client	56	LOGIN	Data I2I Client (USER) logged in.	2026-10-12 14:53:51.48381+05:30
689	1	CreativeGini Admin	\N	LOGIN	CreativeGini Admin (ADMIN) logged in.	2026-10-12 22:03:14.781747+05:30
690	93	Data I2I Client	56	LOGIN	Data I2I Client (USER) logged in.	2026-10-12 22:03:29.008643+05:30
691	2	Company Lead Specialist	\N	LOGIN	Company Lead Specialist (COMPANY_LEAD) logged in.	2026-10-12 22:03:34.550969+05:30
684	\N	Growth & Boost Strategist	\N	LOGIN	Growth & Boost Strategist (COMPANY_BOOST) logged in.	2026-10-12 13:53:28.801746+05:30
692	93	Data I2I Client	56	LOGIN	Data I2I Client (USER) logged in.	2026-10-22 12:26:32.875339+05:30
693	93	Data I2I Client	56	REQUEST_CREATED	[Req #203] Ticket CG-1001 created for COMPANY LEAD.	2026-10-22 12:49:32.328706+05:30
694	93	Data I2I Client	56	REQUEST_CREATED	[Req #204] Ticket CG-1002 created for COMPANY LEAD.	2026-10-22 12:50:13.57069+05:30
695	93	Data I2I Client	56	REQUEST_CREATED	[Req #205] Ticket CG-1003 created for COMPANY LEAD.	2026-10-22 12:50:50.263761+05:30
696	93	Data I2I Client	56	LOGIN	Data I2I Client (USER) logged in.	2026-10-22 15:09:45.900679+05:30
697	2	Lead Specialist	\N	LOGIN	Lead Specialist (COMPANY_LEAD) logged in.	2026-10-22 15:37:17.356934+05:30
698	93	Data I2I Client	56	LOGIN	Data I2I Client (USER) logged in.	2026-10-22 15:38:03.736671+05:30
699	93	Data I2I Client	56	REQUEST_CREATED	[Req #206] Ticket CG-1004 created for COMPANY LEAD.	2026-10-22 15:41:34.217622+05:30
700	93	Data I2I Client	56	REQUEST_CREATED	[Req #207] Ticket CG-1005 created for COMPANY LEAD.	2026-10-22 15:42:23.852941+05:30
701	39	DiziGini Super Admin	\N	LOGIN	DiziGini Super Admin (SUPER_ADMIN) logged in.	2026-10-22 15:58:30.921441+05:30
702	39	DiziGini Super Admin	\N	LOGIN	DiziGini Super Admin (SUPER_ADMIN) logged in.	2026-10-22 16:05:36.52525+05:30
703	93	Data I2I Client	56	LOGIN	Data I2I Client (USER) logged in.	2026-10-22 16:59:42.997512+05:30
704	93	Data I2I Client	56	REQUEST_CREATED	[Req #208] Ticket CG-1006 created for COMPANY LEAD.	2026-10-22 17:00:01.645717+05:30
705	39	DiziGini Super Admin	\N	LOGIN	DiziGini Super Admin (SUPER_ADMIN) logged in.	2026-10-22 17:56:32.175915+05:30
706	93	Data I2I Client	56	LOGIN	Data I2I Client (USER) logged in.	2026-10-23 11:16:26.356181+05:30
707	93	Data I2I Client	56	REQUEST_CREATED	[Req #209] Ticket CG-1007 created for COMPANY LEAD.	2026-10-23 11:17:21.560012+05:30
708	93	Data I2I Client	56	REQUEST_CREATED	[Req #210] Ticket CG-1008 created for COMPANY LEAD.	2026-10-23 11:19:27.267351+05:30
\.


--
-- Data for Name: api_clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_clients (id, client_id, client_name, api_key_hash, scopes, status, allow_auto_publish, allowed_sender_emails, created_at, last_used_at) FROM stdin;
335	client_4185e32aa03fa98e	Client to Revoke	61963b56f420d3abff8d256ba7cb85462c74cd659c3c634bdcb3dadc5c7ed3c1	{prospects:write}	REVOKED	f	{}	2026-11-12 17:13:44.117252+05:30	\N
327	client_219c91d5b52a43d1	Client to Revoke	50596546a4bda6622da2ba002b3c3804f38f51457fbd3f80e741554cff07c3a8	{prospects:write}	REVOKED	f	{}	2026-11-12 17:12:06.704758+05:30	\N
336	client_f0fd7a301fd04676	Revoked Test Client	e7d0fed6606d60ab67dc6889091399b948c38bdfd6488660862f83f0f7e8f435	{prospects:write,assets:write}	REVOKED	f	{}	2026-11-12 17:13:44.189036+05:30	\N
328	client_35a3ab2d01fb9433	Revoked Test Client	c3356ba628b969894ea371a095a6121d4d45bd3c125d413d47b690aafd3b2fba	{prospects:write,assets:write}	REVOKED	f	{}	2026-11-12 17:12:06.750974+05:30	\N
329	client_08cb257a503c6708	Asset Only Client	72b44a7b5cf353eec67c835f8c480a61db0f4ce45055a7db6943b3baded35ab8	{assets:write}	ACTIVE	f	{}	2026-11-12 17:12:06.756489+05:30	2026-11-12 17:12:06.760167+05:30
337	client_3c1947bf36673efc	Asset Only Client	ecea00429918a29c1533eb71a8c6136ae469f5c426b7304fd40ebfaabb899d17	{assets:write}	ACTIVE	f	{}	2026-11-12 17:13:44.193225+05:30	2026-11-12 17:13:44.195587+05:30
326	client_ae76c879bf2ce0c8	Phase2A Test Client	ef3c2b47f14ff17c14e6c9951ac76b67608c7f8df78a25f261c5120ea3999585	{prospects:write,assets:write}	ACTIVE	f	{}	2026-11-12 17:12:06.682725+05:30	2026-11-12 17:12:06.809692+05:30
331	client_82e7c3d1ac547dc9	Client to Revoke	fc38cd282a867f7bd0eae15952d5b6af38b68951413af9dc3deb54553d3539d7	{prospects:write}	REVOKED	f	{}	2026-11-12 17:12:42.36429+05:30	\N
332	client_f3de450f7c17be18	Revoked Test Client	93179bddb86c1440a41c889885944006cf03cc0f3c35cd415b4d907530b8ef36	{prospects:write,assets:write}	REVOKED	f	{}	2026-11-12 17:12:42.433918+05:30	\N
333	client_78c6e863d92968c5	Asset Only Client	fd2af4e8a32249092f728bb460e36ce415821567296bc1e69756acde55cb9500	{assets:write}	ACTIVE	f	{}	2026-11-12 17:12:42.440071+05:30	2026-11-12 17:12:42.443823+05:30
334	client_be35eddfd98fc209	Phase2A Test Client	33b715aa30d7c30e5678f90f2eb1739f79c9f49d3aa3a307dab927fef834339a	{prospects:write,assets:write}	ACTIVE	f	{}	2026-11-12 17:13:44.108955+05:30	2026-11-12 17:13:44.223762+05:30
330	client_e6d91eca38904384	Phase2A Test Client	8d05e5f58ada5d76a22d785546bb24b57ad147fb919699b9b842644a7cdc65c4	{prospects:write,assets:write}	ACTIVE	f	{}	2026-11-12 17:12:42.350702+05:30	2026-11-12 17:12:42.471075+05:30
447	client_1077974bd07e1c95	DOCS_AUDIT_CLIENT	5a877d5ddada8e967505227ad6e023ec39a2fc71b17b5a53455b2a641520370d	{prospects:write,assets:write}	ACTIVE	f	{allowed@dizitalgini.com}	2026-11-12 22:36:50.978187+05:30	2026-11-12 22:36:51.58264+05:30
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, contact_person, email, phone, website, industry, company_info, research_summary, created_by, created_at, updated_at) FROM stdin;
125	saas	Test Client	test_client_new_99@datai2i.com	\N	\N	Technology/SaaS	\N	\N	\N	2026-10-12 11:47:06.561211+05:30	2026-10-12 11:47:06.561211+05:30
126	saas	Akshay New User	akshay.new.user@datai2i.com	\N	\N	Technology/SaaS	\N	\N	\N	2026-10-12 11:48:37.59335+05:30	2026-10-12 11:48:37.59335+05:30
127	saas	Proxy Verification User	proxy.verification@datai2i.com	\N	\N	Technology/SaaS	\N	\N	\N	2026-10-12 11:50:34.120789+05:30	2026-10-12 11:50:34.120789+05:30
128	Flow Test Corp	Flow Test Client	flow.client@datai2i.com	\N	\N	Technology/SaaS	\N	\N	\N	2026-10-12 11:51:39.80384+05:30	2026-10-12 11:51:39.80384+05:30
56	Data I2I	Data I2I Client	testclient@datai2i.com	\N	https://datai2i.com	AI & Data Intelligence	\N	\N	\N	2026-10-07 20:02:19.446555+05:30	2026-10-07 20:02:19.446555+05:30
53	Data I2I	Data I2I Client	client@creativegini.com	\N	https://datai2i.com	AI & Data Intelligence	\N	\N	\N	2026-10-07 17:49:07.38174+05:30	2026-10-07 17:49:07.38174+05:30
\.


--
-- Data for Name: company_key_people; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_key_people (id, company_id, name, role, department, contact, social_profile, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: company_leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_leads (id, company_id, name, title, lead_company, email, linkedin, location, status, notes, created_at, updated_at, logo_url, website) FROM stdin;
\.


--
-- Data for Name: integration_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.integration_assets (id, asset_key, client_id, sha256, size, mime_type, status, claimed_by, expires_at, created_at) FROM stdin;
217	dzg_ast_273602d5-e0ce-4e93-8ae3-b05eecfda317	client_4be206344c9b5389	1002e531deb83bb9c9ad27dc5cae891e065db52fda5735af2148e64f4740c557	44	application/pdf	STAGED	\N	2026-11-13 17:04:28.193784+05:30	2026-11-12 17:04:28.193784+05:30
219	dzg_ast_6411c7b0-4903-4817-800e-8e817130d7c3	client_c2e901c41cbdfae9	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	STAGED	\N	2026-11-13 17:05:41.784895+05:30	2026-11-12 17:05:41.784895+05:30
220	dzg_ast_ba2c39b4-7e6b-4ef5-b477-f8a768ab4af7	client_c2e901c41cbdfae9	49f2ec491d3d1633ea271f56de4c8d5f9a6e8192cd005f35070889b0cfe8ec8c	38	application/pdf	STAGED	\N	2026-11-13 17:05:41.795919+05:30	2026-11-12 17:05:41.795919+05:30
222	dzg_ast_3bd6baf5-a6ee-479b-8098-2d960b862bad	client_1132ef75a0820acd	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 17:06:06.72941+05:30	2026-11-12 17:06:06.72941+05:30
223	dzg_ast_aa651cb8-327f-4d04-a6fe-5fba7978cd58	client_1132ef75a0820acd	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 17:06:06.747671+05:30	2026-11-12 17:06:06.747671+05:30
224	dzg_ast_d23397c2-9aeb-4b52-ae83-ec8ba1f919be	client_1132ef75a0820acd	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 17:06:06.759421+05:30	2026-11-12 17:06:06.759421+05:30
317	dzg_ast_76e26a55-e7ed-4d5e-8f3e-665f317fa2d7	client_4d1ff476ec2a0d5e	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 22:20:23.336626+05:30	2026-11-12 22:20:23.336626+05:30
318	dzg_ast_9e51e162-5bc9-4a70-a12a-99eeb0dc7513	client_4d1ff476ec2a0d5e	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 22:20:23.348027+05:30	2026-11-12 22:20:23.348027+05:30
275	dzg_ast_d29a68e7-6197-46c6-aa62-e56049ca66b9	client_40102d69c4c8ab39	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 17:41:26.918157+05:30	2026-11-12 17:41:26.918157+05:30
276	dzg_ast_e7e49b39-fffb-4389-80ff-e535be05c7cb	client_40102d69c4c8ab39	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 17:41:26.927329+05:30	2026-11-12 17:41:26.927329+05:30
234	dzg_ast_bf5a9617-2dc4-47cf-a1d3-d77daaae446f	client_cb9ab56898a81073	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 17:06:24.272799+05:30	2026-11-12 17:06:24.272799+05:30
235	dzg_ast_2ae6bf5f-c77a-4286-8e36-dad4d878a8fc	client_cb9ab56898a81073	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 17:06:24.298987+05:30	2026-11-12 17:06:24.298987+05:30
236	dzg_ast_1866b883-1cf9-4a59-a008-e636e42ca7a3	client_cb9ab56898a81073	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 17:06:24.314311+05:30	2026-11-12 17:06:24.314311+05:30
274	dzg_ast_93a59dcc-9424-4951-8bb9-251d4d4fbbad	client_40102d69c4c8ab39	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 17:41:26.90948+05:30	2026-11-12 17:41:26.90948+05:30
319	dzg_ast_03b5a3cb-ae73-4bdf-a56d-0b2a5aa2e0c1	client_4d1ff476ec2a0d5e	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 22:20:23.356892+05:30	2026-11-12 22:20:23.356892+05:30
238	dzg_ast_84e23edb-72f3-4740-a673-6a04b09438cf	client_ae76c879bf2ce0c8	0c82f06f119d18fbd133c14e5d562291885af71ba73dac4ea2c8684e481617fc	57	application/pdf	STAGED	\N	2026-11-13 17:12:06.860632+05:30	2026-11-12 17:12:06.860632+05:30
239	dzg_ast_493d38e8-1d8d-47c9-87c0-d0c806eb3f32	client_e6d91eca38904384	0c82f06f119d18fbd133c14e5d562291885af71ba73dac4ea2c8684e481617fc	57	application/pdf	STAGED	\N	2026-11-13 17:12:42.530526+05:30	2026-11-12 17:12:42.530526+05:30
240	dzg_ast_14778c50-bb89-482c-9c26-0e51d7f07ec8	client_be35eddfd98fc209	0c82f06f119d18fbd133c14e5d562291885af71ba73dac4ea2c8684e481617fc	57	application/pdf	STAGED	\N	2026-11-13 17:13:44.281976+05:30	2026-11-12 17:13:44.281976+05:30
286	dzg_ast_b46f3ba6-5052-4c8f-a449-eee301ba1a3d	client_3dd00c4938d20d98	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 22:11:26.671418+05:30	2026-11-12 22:11:26.671418+05:30
287	dzg_ast_058bad7e-7f70-4879-97e8-2f57a03bf0a1	client_3dd00c4938d20d98	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 22:11:26.680603+05:30	2026-11-12 22:11:26.680603+05:30
288	dzg_ast_86e75039-dd1e-4c32-bd7a-d386f047ba26	client_3dd00c4938d20d98	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 22:11:26.691445+05:30	2026-11-12 22:11:26.691445+05:30
255	dzg_ast_8bb9709e-5a05-43f5-9d03-9f8f9738b667	client_6610f6e5cbb410bd	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 17:15:07.950821+05:30	2026-11-12 17:15:07.950821+05:30
256	dzg_ast_37e5d703-f399-4620-9ccd-c91e6ed5e7d3	client_6610f6e5cbb410bd	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 17:15:07.962374+05:30	2026-11-12 17:15:07.962374+05:30
257	dzg_ast_b4950b82-d28a-4143-90e4-e61b345bbf9e	client_6610f6e5cbb410bd	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 17:15:07.968789+05:30	2026-11-12 17:15:07.968789+05:30
290	dzg_ast_beb319cc-4bf1-417f-9a41-b5a9a393aeca	client_ac7206c40cd9edb9	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 22:12:30.687746+05:30	2026-11-12 22:12:30.687746+05:30
291	dzg_ast_8ab54ae6-64e0-4a5b-86a5-3016b0dc49f2	client_ac7206c40cd9edb9	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 22:12:30.699941+05:30	2026-11-12 22:12:30.699941+05:30
292	dzg_ast_92dbcaf4-1dd4-481d-b528-7864ea54c3fc	client_ac7206c40cd9edb9	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 22:12:30.705504+05:30	2026-11-12 22:12:30.705504+05:30
307	dzg_ast_3a7b87b9-5fd6-42e3-9ff2-f63bd54c59de	client_64793915df876aa7	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 22:18:16.543226+05:30	2026-11-12 22:18:16.543226+05:30
305	dzg_ast_4859c63e-4602-431e-9010-17992924f815	client_64793915df876aa7	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 22:18:16.520226+05:30	2026-11-12 22:18:16.520226+05:30
306	dzg_ast_9c39b6fb-8fb1-4b9c-ad1a-4379173a0fc2	client_64793915df876aa7	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 22:18:16.533442+05:30	2026-11-12 22:18:16.533442+05:30
329	dzg_ast_976ca143-3542-4ae8-ad91-35cbbe696379	client_a1076b56c7020697	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 22:36:26.445421+05:30	2026-11-12 22:36:26.445421+05:30
330	dzg_ast_59c1ceb2-0207-4a98-9bce-6c294bc9cd16	client_a1076b56c7020697	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 22:36:26.452302+05:30	2026-11-12 22:36:26.452302+05:30
331	dzg_ast_1596ff22-6fa1-4523-a2f6-3dcc8d39302b	client_a1076b56c7020697	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 22:36:26.462145+05:30	2026-11-12 22:36:26.462145+05:30
341	dzg_ast_491e4397-4073-4304-a40e-905dd7844ecc	client_4644854669a800f9	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 22:38:51.920004+05:30	2026-11-12 22:38:51.920004+05:30
342	dzg_ast_99326799-c3fa-402c-a1a2-d9e3a4342f54	client_4644854669a800f9	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 22:38:51.928342+05:30	2026-11-12 22:38:51.928342+05:30
343	dzg_ast_455d17aa-b705-4844-81c7-b8daae575b50	client_4644854669a800f9	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 22:38:51.937167+05:30	2026-11-12 22:38:51.937167+05:30
353	dzg_ast_9cd9623e-2ee5-4bb4-bc37-040c07a36855	client_66b0de4a778f6698	c2d5fd5c436a9e1c2597c1020c94d5f00f583a0ad47c7f6f36caea587d5231a3	41	application/pdf	CLAIMED	\N	2026-11-13 22:40:48.429843+05:30	2026-11-12 22:40:48.429843+05:30
354	dzg_ast_ab6b2c34-c095-4ed6-bab1-78bd787bffa4	client_66b0de4a778f6698	9768848d01cc06edc325888f40c2d6a9c19a4c812d1fbe17ff0c5d019469b32f	47	application/pdf	CLAIMED	\N	2026-11-13 22:40:48.439164+05:30	2026-11-12 22:40:48.439164+05:30
355	dzg_ast_5d8782b4-b63b-4d70-a2e3-c72d973789a9	client_66b0de4a778f6698	6dfc1f466cc4a04be83fba0856f2bd27bdcbd48eda8063743ae77700e595b231	43	application/pdf	CLAIMED	\N	2026-11-13 22:40:48.448612+05:30	2026-11-12 22:40:48.448612+05:30
\.


--
-- Data for Name: integration_batches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.integration_batches (id, client_id, external_campaign_id, pushed_by_email, total_count, success_count, fail_count, status, idempotency_key, created_at, completed_at) FROM stdin;
629edb6c-fcee-481c-a547-1154f5d35f9b	client_1077974bd07e1c95	c1	allowed@dizitalgini.com	1	0	1	FAILED	\N	2026-11-12 22:36:51.494234+05:30	2026-11-12 22:36:51.53171+05:30
5d8a3a47-caac-44a9-9141-583f28ac227f	client_1077974bd07e1c95	c1	allowed@dizitalgini.com	1	0	1	FAILED	\N	2026-11-12 22:36:51.559284+05:30	2026-11-12 22:36:51.565086+05:30
\.


--
-- Data for Name: integration_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.integration_events (id, batch_id, event_type, payload, created_at) FROM stdin;
2693	629edb6c-fcee-481c-a547-1154f5d35f9b	BATCH_RECEIVED	{"campaignName": "", "operatorEmail": "allowed@dizitalgini.com", "prospectCount": 1, "externalCampaignId": "c1"}	2026-11-12 22:36:51.50654+05:30
2694	629edb6c-fcee-481c-a547-1154f5d35f9b	PROSPECT_FAILED	{"error": "INVALID_ASSET_KEY", "message": "Referenced asset key 'dzg_ast_invalid' does not exist.", "externalProspectId": "p1"}	2026-11-12 22:36:51.530692+05:30
2695	629edb6c-fcee-481c-a547-1154f5d35f9b	BATCH_COMPLETED	{"total": 1, "failed": 1, "status": "FAILED", "success": 0}	2026-11-12 22:36:51.532793+05:30
2696	5d8a3a47-caac-44a9-9141-583f28ac227f	BATCH_RECEIVED	{"campaignName": "", "operatorEmail": "allowed@dizitalgini.com", "prospectCount": 1, "externalCampaignId": "c1"}	2026-11-12 22:36:51.560871+05:30
2697	5d8a3a47-caac-44a9-9141-583f28ac227f	PROSPECT_FAILED	{"error": "SSRF_PRIVATE_IP_BLOCKED", "message": "Logo URL is rejected for security: SSRF_PRIVATE_IP_BLOCKED", "externalProspectId": "p1"}	2026-11-12 22:36:51.564141+05:30
2698	5d8a3a47-caac-44a9-9141-583f28ac227f	BATCH_COMPLETED	{"total": 1, "failed": 1, "status": "FAILED", "success": 0}	2026-11-12 22:36:51.566075+05:30
\.


--
-- Data for Name: integration_idempotency_keys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.integration_idempotency_keys (client_id, idempotency_key, status, body_hash, response_status, response_body, created_at, expires_at) FROM stdin;
client_1077974bd07e1c95	audit_1	COMPLETED	35f1320a8641262e4ca8df85f6e6bd04b150f58f957848a37f41b2524bac267d	400	{"error": "EMPTY_PROSPECTS_ARRAY", "message": "prospects must be a non-empty array of prospect objects.", "success": false}	2026-11-12 22:36:51.432683+05:30	2026-11-13 22:36:51.432683+05:30
client_1077974bd07e1c95	audit_2	COMPLETED	715948037fc3d24eef0fa677b95c8957ff0d5cdaf5775065e430aa46199d6630	400	{"error": "SENDER_EMAIL_NOT_ALLOWED", "message": "Sender email 'unauthorized@dizitalgini.com' is not in the allowed sender emails list for this API client.", "success": false}	2026-11-12 22:36:51.47981+05:30	2026-11-13 22:36:51.47981+05:30
client_1077974bd07e1c95	audit_3	COMPLETED	840ac0a8f7764ce0bb150d6b8d5e470a31435f5acd56df49841a3be7bcaebf5b	207	{"status": "FAILED", "batchId": "629edb6c-fcee-481c-a547-1154f5d35f9b", "results": [{"error": "INVALID_ASSET_KEY", "index": 0, "status": "FAILED", "message": "Referenced asset key 'dzg_ast_invalid' does not exist.", "externalProspectId": "p1"}], "success": true, "summary": {"total": 1, "failed": 1, "created": 0, "existing": 0}}	2026-11-12 22:36:51.490905+05:30	2026-11-13 22:36:51.490905+05:30
client_1077974bd07e1c95	audit_4	COMPLETED	e66538dd88e6dd2c67de7e7c68ee6e5ae078f5ae2ea2e7c4368e862cb446e025	207	{"status": "FAILED", "batchId": "5d8a3a47-caac-44a9-9141-583f28ac227f", "results": [{"error": "SSRF_PRIVATE_IP_BLOCKED", "index": 0, "status": "FAILED", "message": "Logo URL is rejected for security: SSRF_PRIVATE_IP_BLOCKED", "externalProspectId": "p1"}], "success": true, "summary": {"total": 1, "failed": 1, "created": 0, "existing": 0}}	2026-11-12 22:36:51.558751+05:30	2026-11-13 22:36:51.558751+05:30
\.


--
-- Data for Name: magic_login_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.magic_login_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
1	39	f6cc19bd7dae5b1a938b116ac34d52deb317b4dcdffbe8fac8fbd8fe512a4846	2026-10-08 17:45:47.008+05:30	2026-10-07 17:45:56.948255+05:30	2026-10-07 17:45:47.172696+05:30
\.


--
-- Data for Name: message_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_attachments (id, message_id, name, url, size, type, created_at) FROM stdin;
\.


--
-- Data for Name: message_read_by; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_read_by (id, message_id, user_id, read_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, request_id, sender_id, sender_name, sender_role, text, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, message, ticket_id, ticket_code, submission_id, is_read, created_at) FROM stdin;
639	1	INQUIRY_CREATED	New Lead Unlock Request: siift-ai	Akshay Deepak (akshay.m@datai2i.com) requested lead unlock & intelligence briefing for siift-ai	\N	\N	\N	f	2026-10-12 18:35:40.79474+05:30
640	39	INQUIRY_CREATED	New Lead Unlock Request: siift-ai	Akshay Deepak (akshay.m@datai2i.com) requested lead unlock & intelligence briefing for siift-ai	\N	\N	\N	f	2026-10-12 18:35:40.827997+05:30
641	1	INQUIRY_CREATED	New Lead Unlock Request: siift-ai	Akshay M (akshay.m@datai2i.com) requested lead unlock & intelligence briefing for siift-ai	\N	\N	\N	f	2026-10-12 18:37:04.457938+05:30
642	39	INQUIRY_CREATED	New Lead Unlock Request: siift-ai	Akshay M (akshay.m@datai2i.com) requested lead unlock & intelligence briefing for siift-ai	\N	\N	\N	f	2026-10-12 18:37:04.462093+05:30
643	93	ASSIGNMENT	Request Ticket Submitted	Your request CG-1001 ("Key People Research: saas") has been received and assigned to the specialist team.	203	CG-1001	\N	f	2026-10-22 12:49:32.341444+05:30
644	93	ASSIGNMENT	Request Ticket Submitted	Your request CG-1002 ("Lead Research: d") has been received and assigned to the specialist team.	204	CG-1002	\N	f	2026-10-22 12:50:13.586024+05:30
865	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 43b5a6fb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.106447+05:30
646	93	ASSIGNMENT	Request Ticket Submitted	Your request CG-1004 ("Lead Research: 1") has been received and assigned to the specialist team.	206	CG-1004	\N	f	2026-10-22 15:41:34.227125+05:30
647	93	ASSIGNMENT	Request Ticket Submitted	Your request CG-1005 ("Key People Research: s") has been received and assigned to the specialist team.	207	CG-1005	\N	f	2026-10-22 15:42:23.858022+05:30
648	93	ASSIGNMENT	Request Ticket Submitted	Your request CG-1006 ("Key People Research: 1") has been received and assigned to the specialist team.	208	CG-1006	\N	f	2026-10-22 17:00:01.658724+05:30
649	93	ASSIGNMENT	Request Ticket Submitted	Your request CG-1007 ("Company Study: d") has been received and assigned to the specialist team.	209	CG-1007	\N	f	2026-10-23 11:17:21.567665+05:30
650	93	ASSIGNMENT	Request Ticket Submitted	Your request CG-1008 ("Company Study: d") has been received and assigned to the specialist team.	210	CG-1008	\N	f	2026-10-23 11:19:27.278548+05:30
651	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794475078776 | Prospect: prosp-1794475078776 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:47:58.910016+05:30
652	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794475078776 | Prospect: prosp-1794475078776 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:47:58.925311+05:30
866	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794476239978 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.109515+05:30
654	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794475079056 | Prospect: prosp-asset-1794475079056 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:47:59.116331+05:30
655	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794475079056 | Prospect: prosp-asset-1794475079056 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:47:59.118951+05:30
1173	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch ab7a0d79: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:24.266702+05:30
657	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794475079256 | Prospect: prosp-forced-1794475079256 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:47:59.29017+05:30
658	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794475079256 | Prospect: prosp-forced-1794475079256 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:47:59.294321+05:30
1174	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794476423911 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.306747+05:30
660	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794475079301 | Prospect: prosp-auto-1794475079301 | Status: PUBLISHED	\N	\N	\N	f	2026-11-12 14:47:59.313983+05:30
661	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794475079301 | Prospect: prosp-auto-1794475079301 | Status: PUBLISHED	\N	\N	\N	f	2026-11-12 14:47:59.315657+05:30
869	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 43b5a6fb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.114346+05:30
663	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794475151689 | Prospect: prosp-1794475151689 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:49:11.808228+05:30
664	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794475151689 | Prospect: prosp-1794475151689 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:49:11.810916+05:30
870	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794476239978 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.116895+05:30
666	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794475151925 | Prospect: prosp-asset-1794475151925 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:49:11.964127+05:30
667	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794475151925 | Prospect: prosp-asset-1794475151925 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:49:11.966468+05:30
669	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794475152092 | Prospect: prosp-forced-1794475152092 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:49:12.120656+05:30
670	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794475152092 | Prospect: prosp-forced-1794475152092 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:49:12.123334+05:30
672	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794475152126 | Prospect: prosp-auto-1794475152126 | Status: PUBLISHED	\N	\N	\N	f	2026-11-12 14:49:12.1359+05:30
673	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794475152126 | Prospect: prosp-auto-1794475152126 | Status: PUBLISHED	\N	\N	\N	f	2026-11-12 14:49:12.137075+05:30
675	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794475152150 | Prospect: prosp-b1-1794475152150 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:49:12.164505+05:30
676	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794475152150 | Prospect: prosp-b1-1794475152150 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:49:12.165154+05:30
678	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794475152166 | Prospect: prosp-b2-1794475152166 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:49:12.179673+05:30
679	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794475152166 | Prospect: prosp-b2-1794475152166 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:49:12.180291+05:30
871	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 7e2bbcb7: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:07:20.171004+05:30
681	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794475213957 | Prospect: prosp-1794475213957 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:50:14.188336+05:30
682	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794475213957 | Prospect: prosp-1794475213957 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:50:14.203118+05:30
872	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794476239978 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.1717+05:30
684	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794475214347 | Prospect: prosp-asset-1794475214347 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:50:14.391119+05:30
685	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794475214347 | Prospect: prosp-asset-1794475214347 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:50:14.393411+05:30
1461	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 136643d4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.36597+05:30
687	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794475214521 | Prospect: prosp-forced-1794475214521 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:50:14.551742+05:30
688	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794475214521 | Prospect: prosp-forced-1794475214521 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:50:14.554009+05:30
1462	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477059218 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.387658+05:30
690	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794475214554 | Prospect: prosp-auto-1794475214554 | Status: PUBLISHED	\N	\N	\N	f	2026-11-12 14:50:14.566874+05:30
691	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794475214554 | Prospect: prosp-auto-1794475214554 | Status: PUBLISHED	\N	\N	\N	f	2026-11-12 14:50:14.567765+05:30
875	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 7e2bbcb7: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:07:20.174078+05:30
693	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794475214587 | Prospect: prosp-b1-1794475214587 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:50:14.612396+05:30
694	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794475214587 | Prospect: prosp-b1-1794475214587 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:50:14.614614+05:30
876	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794476239978 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.17475+05:30
696	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794475214613 | Prospect: prosp-b2-1794475214613 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:50:14.629142+05:30
697	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794475214613 | Prospect: prosp-b2-1794475214613 | Status: DRAFT	\N	\N	\N	f	2026-11-12 14:50:14.630054+05:30
877	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch c7ff7e54: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.256121+05:30
699	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 4e25bfee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.085495+05:30
700	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 4e25bfee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.101267+05:30
878	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794476240216 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.256765+05:30
702	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch ddf7421f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.128489+05:30
703	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch ddf7421f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.129022+05:30
1177	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch ab7a0d79: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:24.314525+05:30
705	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d0166ead: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.16054+05:30
706	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d0166ead: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.16118+05:30
1178	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794476423911 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.316314+05:30
708	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch fe2e5046: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.180418+05:30
709	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch fe2e5046: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.183383+05:30
881	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch c7ff7e54: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.258493+05:30
711	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 5784dd1f: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:02:08.208741+05:30
712	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 5784dd1f: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:02:08.20924+05:30
882	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794476240216 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.259069+05:30
714	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch da10fe4b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.228272+05:30
715	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch da10fe4b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.228795+05:30
889	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 7530b31b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:07:20.330068+05:30
717	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch f429a257: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.250002+05:30
890	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794476240319 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.332436+05:30
718	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch f429a257: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:08.250405+05:30
883	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 4820eee4: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:07:20.309859+05:30
884	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794476240279 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.31239+05:30
1463	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 136643d4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.388768+05:30
1464	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477059218 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.390189+05:30
887	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 4820eee4: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:07:20.315912+05:30
888	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794476240279 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.316692+05:30
895	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 3e20bd3e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:07:20.357086+05:30
896	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794476239978 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.357861+05:30
1181	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 82eb92fe: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:24.516421+05:30
1182	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794476423911 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.518213+05:30
899	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 3e20bd3e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:07:20.359873+05:30
900	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794476239978 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.360356+05:30
901	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 4198cc4d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.389099+05:30
902	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794476240372 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.38998+05:30
2157	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 08875f33: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.104158+05:30
2158	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.106412+05:30
905	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 4198cc4d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.391576+05:30
906	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794476240372 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.39228+05:30
907	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch e9e7e812: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.410941+05:30
908	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794476240395 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.412438+05:30
1185	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 82eb92fe: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:24.528604+05:30
1186	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794476423911 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.530723+05:30
911	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch e9e7e812: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.417994+05:30
912	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794476240395 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.418735+05:30
919	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 96721057: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.470053+05:30
920	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794476240455 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.47063+05:30
1467	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 8e10de8b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:20:59.428537+05:30
1468	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477059218 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.429394+05:30
923	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 96721057: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.47263+05:30
924	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794476240455 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.473361+05:30
985	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch d1ac0f88: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:11.960686+05:30
986	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:11.963082+05:30
1197	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 00fc1abc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:24.764705+05:30
1198	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794476424648 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.768234+05:30
989	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch d1ac0f88: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:11.965493+05:30
990	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:11.96618+05:30
991	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 907d29b2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:11.989547+05:30
992	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:11.990187+05:30
1469	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 8e10de8b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:20:59.43007+05:30
1470	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477059218 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.431057+05:30
720	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch d9d3e601: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:02:08.261519+05:30
721	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch d9d3e601: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:02:08.262144+05:30
1189	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch e0b400e8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:24.739188+05:30
1190	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.748758+05:30
723	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 2baf2450: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.793772+05:30
724	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 2baf2450: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.796072+05:30
893	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 7530b31b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:07:20.335722+05:30
726	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 58ce6e01: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.823418+05:30
727	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 58ce6e01: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.823983+05:30
894	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794476240319 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.336447+05:30
729	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 27cb2861: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.857956+05:30
730	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 27cb2861: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.858512+05:30
913	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 7582725e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.451915+05:30
732	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch cefec660: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.8767+05:30
733	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch cefec660: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.879016+05:30
914	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794476240435 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.452636+05:30
735	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch d74ebdcf: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:02:28.906026+05:30
736	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch d74ebdcf: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:02:28.906542+05:30
2159	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 08875f33: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.107316+05:30
738	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 838e21a4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.926886+05:30
739	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 838e21a4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.927986+05:30
2160	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.108149+05:30
741	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 5178da74: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.954076+05:30
742	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 5178da74: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:02:28.955946+05:30
917	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 7582725e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:07:20.454128+05:30
744	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 7c5732e0: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:02:28.981317+05:30
745	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 7c5732e0: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:02:28.982602+05:30
918	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794476240435 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:07:20.454526+05:30
995	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 907d29b2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:11.992292+05:30
996	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:11.992902+05:30
748	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 917ffdb2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.387225+05:30
749	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 917ffdb2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.390134+05:30
997	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch dad4b5dc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:12.023903+05:30
751	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 5051eea3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.417698+05:30
752	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 5051eea3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.418191+05:30
998	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.02485+05:30
754	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch ff6d606a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.460384+05:30
755	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch ff6d606a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.461923+05:30
1193	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch e0b400e8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:24.757322+05:30
757	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch c8612a5c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.487357+05:30
758	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch c8612a5c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.490743+05:30
760	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 2900a5d5: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:04:29.51936+05:30
761	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 2900a5d5: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:04:29.521491+05:30
925	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch f5709661: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:03.735045+05:30
769	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 920a706f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:04:29.575265+05:30
926	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794476283595 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.73815+05:30
770	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 920a706f: 0 drafts ready for review (1 failed).	\N	\N	\N	t	2026-11-12 15:04:29.57604+05:30
1194	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.758865+05:30
1473	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 40d4404a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.487055+05:30
929	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch f5709661: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:03.741337+05:30
930	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794476283595 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.742575+05:30
931	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 90d12e06: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:03.793589+05:30
932	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794476283595 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.794339+05:30
1474	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477059455 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.487798+05:30
1205	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 4f7add22: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:24.846636+05:30
935	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 90d12e06: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:03.802221+05:30
936	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794476283595 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.803484+05:30
937	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch ce0b070b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:03.886366+05:30
938	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794476283838 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.887337+05:30
1206	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.848101+05:30
1475	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 40d4404a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.488478+05:30
941	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch ce0b070b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:03.891535+05:30
942	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794476283838 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.894141+05:30
949	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 72c7e11d: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:03.959367+05:30
950	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794476283943 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.959989+05:30
1476	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477059455 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.489288+05:30
1209	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 4f7add22: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:24.852861+05:30
953	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 72c7e11d: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:03.961913+05:30
954	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794476283943 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.962403+05:30
961	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 67d52f35: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:04.020593+05:30
962	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794476283995 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:04.021356+05:30
1210	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.854309+05:30
3214	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Tech Enterprise Outreach	Batch 5a2a2d0a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:10:13.706721+05:30
965	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 67d52f35: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:04.023702+05:30
966	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794476283995 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:04.024521+05:30
967	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 6850e696: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:04.041622+05:30
968	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794476284018 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:04.042789+05:30
3215	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Acme Technologies	Campaign: camp_tech_q4_2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:10:13.711969+05:30
1229	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 7123fb6b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:24.999621+05:30
971	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 6850e696: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:04.0458+05:30
972	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794476284018 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:04.047736+05:30
973	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 21a98dc4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:04.082946+05:30
1230	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.002756+05:30
943	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch cf288293: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:03.944528+05:30
763	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 12d36163: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.545197+05:30
764	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 12d36163: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.547418+05:30
944	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794476283903 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.946517+05:30
766	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 156721b9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.562856+05:30
767	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 156721b9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:04:29.563346+05:30
1201	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 00fc1abc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:24.776698+05:30
772	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch e61124da: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:31.873899+05:30
773	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch e61124da: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:31.875304+05:30
1202	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794476424648 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.779734+05:30
775	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch b6ed3d40: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:31.909751+05:30
776	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch b6ed3d40: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:31.910307+05:30
947	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch cf288293: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:03.948521+05:30
778	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 7322cbac: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:31.955345+05:30
779	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 7322cbac: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:31.955894+05:30
948	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794476283903 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.949086+05:30
781	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch dada61ee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:31.988206+05:30
782	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch dada61ee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:31.989536+05:30
955	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 543b1fd5: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:03.990677+05:30
784	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch e4e4b642: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:32.027257+05:30
785	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch e4e4b642: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:32.028157+05:30
956	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794476283595 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.991183+05:30
787	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 26b61289: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:32.055634+05:30
788	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 26b61289: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:32.056283+05:30
1479	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 6ca68ed3: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:20:59.521574+05:30
790	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 139ff757: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:32.077093+05:30
791	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 139ff757: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:32.07798+05:30
1480	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477059502 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.524036+05:30
793	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch dc4748ef: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:32.092862+05:30
959	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 543b1fd5: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:03.992689+05:30
794	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch dc4748ef: 0 drafts ready for review (1 failed).	\N	\N	\N	t	2026-11-12 15:05:32.093598+05:30
960	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794476283595 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:03.99309+05:30
796	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 0627d850: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.008562+05:30
979	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 21a98dc4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:04.107769+05:30
798	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 0627d850: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.011777+05:30
980	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794476284081 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:04.108742+05:30
800	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 3ca6c8ee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.060855+05:30
1221	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 8fd79707: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:24.975616+05:30
802	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 3ca6c8ee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.066361+05:30
1222	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794476424943 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.977862+05:30
804	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 1448ed82: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.090368+05:30
974	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794476284058 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:04.083664+05:30
806	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 1448ed82: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.099983+05:30
1213	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch c5d529a0: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:24.907372+05:30
816	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 7e1df4a4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.225459+05:30
1214	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794476424861 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.913952+05:30
818	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 7e1df4a4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.227965+05:30
977	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 21a98dc4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:04.085423+05:30
832	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 3470bbc4: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.328953+05:30
978	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794476284058 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:04.085932+05:30
834	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 3470bbc4: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.334059+05:30
1481	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 6ca68ed3: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:20:59.524968+05:30
852	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 036fab84: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.421894+05:30
1001	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch dad4b5dc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:12.027515+05:30
1002	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.028206+05:30
854	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 036fab84: 1 drafts ready for review (0 failed).	\N	\N	\N	t	2026-11-12 15:05:49.424027+05:30
856	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 7a11e0e6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.564899+05:30
1009	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 8fb78a1e: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:12.067959+05:30
858	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 7a11e0e6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.567504+05:30
862	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch d535b76f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.635091+05:30
1010	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.068757+05:30
864	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch d535b76f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.637079+05:30
1482	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477059502 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.525857+05:30
1217	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch c5d529a0: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:24.923783+05:30
1013	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 8fb78a1e: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:12.07049+05:30
1014	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.071001+05:30
1021	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 0995c7b0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:12.122463+05:30
1022	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.123666+05:30
1218	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794476424861 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.92748+05:30
3216	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Tech Enterprise Outreach	Batch 5a2a2d0a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:10:13.7127+05:30
1025	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 0995c7b0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:12.126385+05:30
1026	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.127319+05:30
1033	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 8fe51cef: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.145881+05:30
1034	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794476307960 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.149858+05:30
2163	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 2d38f758: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.129992+05:30
1253	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 777cc912: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.144649+05:30
1254	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794476425106 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.147621+05:30
1039	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 8fe51cef: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.157983+05:30
1040	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794476307960 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.158808+05:30
1048	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.230811+05:30
1049	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 1b05ed37: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.240182+05:30
1050	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794476307960 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.241869+05:30
983	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 21a98dc4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:04.11133+05:30
808	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 64b5958d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.124357+05:30
984	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794476284081 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:04.111998+05:30
810	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 64b5958d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.127718+05:30
1003	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 8e01a125: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:12.044637+05:30
812	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch ff14e574: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.192821+05:30
1004	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.046573+05:30
814	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch ff14e574: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.195614+05:30
1485	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 43434f29: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:20:59.53847+05:30
820	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch f16ed589: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.236866+05:30
1486	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477059527 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.539211+05:30
822	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch f16ed589: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.239874+05:30
1007	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 8e01a125: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:12.04847+05:30
824	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 509daa23: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.289085+05:30
1008	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.049302+05:30
826	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 509daa23: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.291726+05:30
1015	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 5e73b022: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:12.096058+05:30
828	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 2043e76a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.298722+05:30
1016	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.09758+05:30
830	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 2043e76a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.303639+05:30
1225	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 8fd79707: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:24.984876+05:30
836	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 1828236a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.337947+05:30
1226	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794476424943 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:10:24.986552+05:30
838	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 1828236a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.341043+05:30
1019	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 5e73b022: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:12.100724+05:30
1020	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.101858+05:30
841	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 7ee1ebd6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.371089+05:30
842	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch f7a30dac: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.371746+05:30
1027	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch b922ae58: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:12.142221+05:30
1028	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:12.143327+05:30
845	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 7ee1ebd6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.373643+05:30
846	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch f7a30dac: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.374055+05:30
848	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 47f7764a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.395892+05:30
850	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 47f7764a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:05:49.399829+05:30
1031	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch b922ae58: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:12.146539+05:30
859	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 88e79dc2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.619577+05:30
861	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 88e79dc2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:05:49.620933+05:30
1032	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 15:08:12.147559+05:30
1041	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 7b878d5b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.216125+05:30
1042	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.22077+05:30
1047	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 7b878d5b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.2295+05:30
1487	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 43434f29: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:20:59.539958+05:30
1488	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477059527 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.541007+05:30
1237	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 09921fea: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:25.067782+05:30
1238	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794476423911 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.069767+05:30
1055	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 1b05ed37: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.250507+05:30
1056	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794476307960 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.252582+05:30
1073	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch b5f2c496: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.357329+05:30
1074	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794476308298 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.358594+05:30
2164	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.130528+05:30
2165	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 2d38f758: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.132283+05:30
1241	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 09921fea: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:25.075317+05:30
1242	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794476423911 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.077875+05:30
1079	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch b5f2c496: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.366104+05:30
1080	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794476308298 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.367985+05:30
1105	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 053fc0ad: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.460806+05:30
1106	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794476308440 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.462146+05:30
1497	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch b18759fe: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.579612+05:30
1498	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477059566 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.580101+05:30
1288	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 9a23a15e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.270178+05:30
1290	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794476425239 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.271612+05:30
1111	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 053fc0ad: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.47004+05:30
1112	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794476308440 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.471284+05:30
1143	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 8ba1b061: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.571695+05:30
1145	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794476308531 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.573453+05:30
1499	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch b18759fe: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.580539+05:30
1500	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477059566 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.580948+05:30
1295	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 9a23a15e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.276155+05:30
1297	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794476425239 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.279766+05:30
1151	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 8ba1b061: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.578325+05:30
2166	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.133318+05:30
1152	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794476308531 | 1 drafts created	\N	\N	\N	t	2026-11-12 15:08:28.579256+05:30
3217	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Acme Technologies	Campaign: camp_tech_q4_2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:10:13.713571+05:30
1317	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch f8053f95: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:35.995367+05:30
1318	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794476495805 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:35.998568+05:30
1319	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch f8053f95: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.000134+05:30
1320	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794476495805 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.001349+05:30
1503	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 9dec2dfd: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.591788+05:30
1504	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477059581 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.592446+05:30
1505	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 9dec2dfd: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.592957+05:30
1325	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 605698e8: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.077452+05:30
1326	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794476495805 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.079236+05:30
1057	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch aa2e4531: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.276511+05:30
1058	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.278173+05:30
1491	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch f85de66a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:20:59.56019+05:30
1492	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477059218 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.560839+05:30
1233	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 7123fb6b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.010437+05:30
1234	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.012536+05:30
1063	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch aa2e4531: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.287388+05:30
1064	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.288699+05:30
1065	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch c0c17e14: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.339903+05:30
1066	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.341505+05:30
1493	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch f85de66a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:20:59.561393+05:30
1494	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477059218 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.561968+05:30
1261	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 2019a4d9: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:25.167066+05:30
1262	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.168235+05:30
1071	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch c0c17e14: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.350903+05:30
1072	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.352926+05:30
1081	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 4c351fee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.384047+05:30
1082	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.388586+05:30
3218	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 4ce14c61: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:05.761996+05:30
2169	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 97272ea8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.161778+05:30
1265	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 2019a4d9: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:25.173361+05:30
1266	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.175036+05:30
1087	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 4c351fee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.406685+05:30
1088	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.407758+05:30
1089	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 875e24bc: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.424932+05:30
1090	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794476308389 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.428674+05:30
1509	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 357feec8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.619802+05:30
1510	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477059606 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.620429+05:30
1285	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch f3005311: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.267473+05:30
1286	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.268398+05:30
1095	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 875e24bc: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.438005+05:30
1096	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794476308389 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.439155+05:30
1097	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 900e7713: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.439527+05:30
1098	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.44033+05:30
1511	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 357feec8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.621064+05:30
1512	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477059606 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.6216+05:30
1291	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch f3005311: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.272484+05:30
1294	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.274893+05:30
1103	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 900e7713: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.445802+05:30
1104	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.447212+05:30
1113	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch e289df36: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.482419+05:30
1114	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.484469+05:30
1245	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch ca7d91e4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.099695+05:30
1246	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.103727+05:30
1506	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477059581 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.593736+05:30
2170	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.162573+05:30
1119	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch e289df36: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.491384+05:30
1120	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.49259+05:30
1137	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 379b8f72: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.562879+05:30
1138	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.563844+05:30
1249	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch ca7d91e4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.110636+05:30
1250	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.113592+05:30
2171	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 97272ea8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.163397+05:30
1515	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 357feec8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.633238+05:30
1144	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 379b8f72: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.572309+05:30
1146	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.573433+05:30
1277	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch d3ae9f6e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.224026+05:30
1278	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.226726+05:30
1516	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477059621 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.633735+05:30
1517	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 357feec8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:20:59.634362+05:30
1281	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch d3ae9f6e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.231476+05:30
1282	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.232791+05:30
1518	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477059621 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:20:59.634907+05:30
2172	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.164091+05:30
1301	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 49f9b6af: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:25.305085+05:30
1302	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.309626+05:30
3219	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794483905614 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.781697+05:30
1587	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch f125d66c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:22.247569+05:30
1305	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 49f9b6af: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:10:25.314774+05:30
1306	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.315584+05:30
1588	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477082224 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.249966+05:30
1589	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch f125d66c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:22.25078+05:30
1327	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 605698e8: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.080291+05:30
1328	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794476495805 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.081476+05:30
1590	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477082224 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.251764+05:30
3220	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 4ce14c61: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:05.782827+05:30
2181	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 03d12ec5: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:14.213112+05:30
1599	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 2c191966: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:22.286273+05:30
1341	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 9d12bac1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.183377+05:30
1342	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794476496133 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.185036+05:30
1343	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 9d12bac1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.186408+05:30
1344	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794476496133 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.187837+05:30
1600	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477082001 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.286768+05:30
2182	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.213919+05:30
1121	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch aafaaf12: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.505712+05:30
1122	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794476307960 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.507314+05:30
2175	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 7dd492ee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.184928+05:30
2176	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.187686+05:30
1257	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 777cc912: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.151862+05:30
1258	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794476425106 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.153142+05:30
1127	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch aafaaf12: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:08:28.515206+05:30
1128	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794476307960 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.517727+05:30
1159	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 271ab4bc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.71437+05:30
1160	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794476308582 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.715586+05:30
1167	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 71de48c7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.848035+05:30
1168	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794476308834 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.848888+05:30
2177	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 7dd492ee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.18879+05:30
2178	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.189694+05:30
1171	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 71de48c7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.852124+05:30
1172	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794476308834 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.852583+05:30
1269	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 78c388ee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.194659+05:30
1270	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794476425160 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.197488+05:30
1605	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 083ea5dc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.304218+05:30
1606	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477082295 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.304583+05:30
1273	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 78c388ee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.201568+05:30
1274	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794476425160 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.202737+05:30
1607	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 083ea5dc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.304905+05:30
1608	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477082295 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.305294+05:30
1307	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 9a23a15e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.315776+05:30
1309	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794476425286 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.316803+05:30
3221	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794483905614 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.783954+05:30
1313	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 9a23a15e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:10:25.320219+05:30
1314	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794476425286 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:10:25.321444+05:30
1611	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch efa4256b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.317446+05:30
1612	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477082307 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.318197+05:30
1613	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch efa4256b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.318781+05:30
1333	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 8a14e243: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.159205+05:30
1334	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.163541+05:30
1335	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 8a14e243: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.16626+05:30
1336	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.168654+05:30
1614	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477082307 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.319323+05:30
1623	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch ec9b394f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.353678+05:30
1624	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477082344 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.354217+05:30
1625	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch ec9b394f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.354751+05:30
1129	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch fd586f3f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.522773+05:30
1130	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.524525+05:30
1521	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch dae90d0c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:07.913349+05:30
1522	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:07.916069+05:30
1523	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch dae90d0c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:07.917086+05:30
1524	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:07.918177+05:30
1135	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch fd586f3f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.530108+05:30
1136	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.531917+05:30
1153	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 271ab4bc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.687333+05:30
1154	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794476308582 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.689936+05:30
1349	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 2cd328ad: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.215392+05:30
1350	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.216546+05:30
1351	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 2cd328ad: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.218361+05:30
1161	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 71de48c7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.829154+05:30
1162	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794476308798 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.831188+05:30
1352	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.220025+05:30
2183	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 03d12ec5: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:14.215367+05:30
1165	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 71de48c7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:08:28.834859+05:30
1166	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794476308798 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:08:28.835473+05:30
2184	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.216455+05:30
1527	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 2f74cafc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:07.942665+05:30
1528	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:07.94359+05:30
1357	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 86857f8b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.258943+05:30
1358	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794476496224 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.264985+05:30
1359	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 86857f8b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.266394+05:30
1360	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794476496224 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.268168+05:30
1529	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 2f74cafc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:07.944866+05:30
1530	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:07.945699+05:30
3224	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 20762ca2: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:05.822557+05:30
1365	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 9109ba39: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.302317+05:30
1366	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 5c580aef: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.303752+05:30
1367	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794476496280 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.30431+05:30
1368	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.305459+05:30
1369	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 9109ba39: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.305718+05:30
1370	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 5c580aef: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.306666+05:30
1371	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794476496280 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.307445+05:30
1372	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.308347+05:30
1533	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 9ea5230f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:07.9699+05:30
1534	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:07.970477+05:30
1535	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 9ea5230f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:07.971187+05:30
1536	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:07.971977+05:30
2187	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch bee562d0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.234352+05:30
2188	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.23534+05:30
1404	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 9f6a0e16: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.413285+05:30
1406	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.414045+05:30
1407	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 9f6a0e16: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.414996+05:30
1408	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.416133+05:30
1545	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch ca521599: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:08.013924+05:30
1546	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:08.014527+05:30
1547	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch ca521599: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:08.015203+05:30
1548	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:08.015811+05:30
1429	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 9bd6bd6c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.490923+05:30
1430	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.49289+05:30
1431	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 9bd6bd6c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.494672+05:30
1432	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.496263+05:30
2189	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch bee562d0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.236289+05:30
2190	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.23717+05:30
1557	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 2ea6d52f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:08.047238+05:30
1558	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:08.047997+05:30
1559	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 2ea6d52f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:08.048639+05:30
1560	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:08.0493+05:30
1601	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 2c191966: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:22.287321+05:30
1602	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477082001 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.287937+05:30
2199	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch f683536c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:14.264002+05:30
2200	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.264761+05:30
1617	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch ec9b394f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.341632+05:30
1618	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477082330 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.34223+05:30
1619	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch ec9b394f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.342754+05:30
1620	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477082330 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.34323+05:30
2201	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch f683536c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:14.265575+05:30
2202	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.266188+05:30
1629	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch f74ac1f3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:23.888921+05:30
1630	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:23.891214+05:30
1631	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch f74ac1f3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:23.892128+05:30
1632	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:23.893331+05:30
1635	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch c1c1332d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:23.917739+05:30
1636	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:23.918421+05:30
1637	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch c1c1332d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:23.919203+05:30
2511	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch f1552668: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.280603+05:30
2512	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.282757+05:30
2513	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch f1552668: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.283603+05:30
2514	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.284371+05:30
1539	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 0b6d927d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:07.988263+05:30
1540	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:07.990856+05:30
1397	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 693833a9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.404359+05:30
1398	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794476496382 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.405199+05:30
1399	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 693833a9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.406166+05:30
1400	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794476496382 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.408006+05:30
1541	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 0b6d927d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:07.991955+05:30
1542	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:07.993093+05:30
2193	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch f086e8fa: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.25186+05:30
2194	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.252725+05:30
1413	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch e16c3730: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.436766+05:30
1414	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794476496416 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.437701+05:30
1415	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch e16c3730: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.438414+05:30
1416	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794476496416 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.439307+05:30
1551	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 558b1a35: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:08.031682+05:30
1552	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:08.032357+05:30
1553	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 558b1a35: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:08.032993+05:30
1554	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:08.033627+05:30
1434	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 1379a91c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.499012+05:30
1436	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794476496468 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.501405+05:30
1438	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 1379a91c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.502695+05:30
1440	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794476496468 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.503663+05:30
2195	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch f086e8fa: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:14.253498+05:30
2196	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:14.254202+05:30
1563	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch bc6c32f6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:08.059543+05:30
1564	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:08.060126+05:30
1565	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch bc6c32f6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:08.060937+05:30
1566	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:08.06145+05:30
3225	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794483905614 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.823366+05:30
3226	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 20762ca2: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:05.824157+05:30
3227	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794483905614 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.825043+05:30
1626	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477082344 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.35528+05:30
1638	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:23.919969+05:30
2523	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 4c534c57: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.33043+05:30
2524	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.331311+05:30
1641	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 5c41683f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:23.947071+05:30
1642	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:23.947761+05:30
1643	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 5c41683f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:23.948314+05:30
1644	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:23.948753+05:30
2525	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 4c534c57: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.332114+05:30
1381	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch efe34a2e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.356666+05:30
1382	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794476495805 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.35848+05:30
1383	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch efe34a2e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.360264+05:30
1384	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794476495805 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.36129+05:30
1569	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 14a76be5: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.11129+05:30
1570	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477082001 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.11543+05:30
1571	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 14a76be5: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.116221+05:30
1572	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477082001 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.116877+05:30
1388	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch ce3d33b7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.364593+05:30
1390	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.368104+05:30
1391	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch ce3d33b7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.370785+05:30
1392	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.372358+05:30
2205	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 6dc2c4e3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.620771+05:30
2206	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477623527 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.624143+05:30
1575	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 0b670218: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:22.152642+05:30
1576	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477082001 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.153188+05:30
1421	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 92c280bb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.452181+05:30
1422	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.45349+05:30
1423	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 92c280bb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.454311+05:30
1424	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.455124+05:30
1577	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 0b670218: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:22.15375+05:30
1578	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477082001 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.154365+05:30
2207	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 6dc2c4e3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.625408+05:30
2208	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477623527 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.626383+05:30
1445	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 55fc4b30: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.526719+05:30
1446	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.527984+05:30
1447	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 55fc4b30: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:11:36.529735+05:30
1448	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.532248+05:30
1581	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 8c6e67fd: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.207716+05:30
1582	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477082180 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.208513+05:30
1583	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 8c6e67fd: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:22.209173+05:30
1584	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477082180 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.20991+05:30
1453	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 1379a91c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.616529+05:30
1454	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794476496511 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.618838+05:30
1455	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 1379a91c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:11:36.620022+05:30
1456	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794476496511 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:11:36.621123+05:30
3230	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch e1f18603: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:05.879619+05:30
1593	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch ec5fac29: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:22.267819+05:30
1594	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477082258 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.268402+05:30
1595	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch ec5fac29: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:22.269207+05:30
1596	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477082258 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:22.269848+05:30
2211	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch aecd2f32: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:23.667213+05:30
1647	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch a24aa6d6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:23.965448+05:30
1648	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:23.967874+05:30
1649	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch a24aa6d6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:23.968777+05:30
1650	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:23.96982+05:30
2212	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477623527 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.668117+05:30
2213	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch aecd2f32: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:23.668972+05:30
1653	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 750e9823: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:23.997703+05:30
1654	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:23.998471+05:30
1655	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 750e9823: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:23.999251+05:30
1656	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:24.000064+05:30
2214	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477623527 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.671624+05:30
3231	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794483905849 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.880665+05:30
1659	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 7d9f1c27: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:24.020294+05:30
1660	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:24.021061+05:30
1661	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 7d9f1c27: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:24.0218+05:30
1662	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:24.02243+05:30
3232	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch e1f18603: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:05.881659+05:30
2217	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 0161098e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.732776+05:30
1665	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 2baccd37: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:24.037461+05:30
1666	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:24.038225+05:30
1667	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 2baccd37: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:21:24.038863+05:30
1668	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:21:24.039535+05:30
2218	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477623699 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.733349+05:30
2219	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 0161098e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.733908+05:30
1671	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 0a799d2a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:24.05066+05:30
1672	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:24.05139+05:30
1673	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 0a799d2a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:21:24.0521+05:30
1674	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:21:24.052656+05:30
2220	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477623699 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.734435+05:30
3233	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794483905849 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.88253+05:30
2229	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch ef37ff6e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:23.781859+05:30
2230	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477623768 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.782485+05:30
1679	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 272b278b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.436644+05:30
1680	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477150332 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.437608+05:30
1681	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 272b278b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.438654+05:30
1682	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477150332 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.439584+05:30
2231	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch ef37ff6e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:23.783195+05:30
2232	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477623768 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.783787+05:30
1685	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch b5dc3f1c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:30.475119+05:30
1686	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477150332 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.475769+05:30
1687	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch b5dc3f1c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:30.476409+05:30
1688	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477150332 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.477184+05:30
2223	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch c9fe7467: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:23.7686+05:30
2224	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477623739 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.77051+05:30
1691	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 2112d460: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.536667+05:30
1692	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477150494 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.537582+05:30
1693	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 2112d460: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.538559+05:30
1694	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477150494 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.539556+05:30
2225	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch c9fe7467: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:23.771243+05:30
2226	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477623739 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.771862+05:30
1697	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch f8f12e97: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:30.561105+05:30
1698	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477150540 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.56168+05:30
1699	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch f8f12e97: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:30.562181+05:30
1700	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477150540 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.562724+05:30
3236	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 4bfe94fe: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:05.909142+05:30
1703	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 7ec63840: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:30.582037+05:30
1704	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477150553 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.584021+05:30
1705	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 7ec63840: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:30.584717+05:30
1706	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477150553 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.585227+05:30
2235	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 38a1cc02: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:23.799491+05:30
2236	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477623527 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.800022+05:30
1709	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch b3b323fd: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:30.608999+05:30
1710	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477150332 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.609826+05:30
1711	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch b3b323fd: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:30.610506+05:30
1712	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477150332 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.611161+05:30
2237	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 38a1cc02: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:23.800464+05:30
2238	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477623527 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.800919+05:30
1715	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 254d87de: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.632562+05:30
1716	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477150606 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.633393+05:30
1717	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 254d87de: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.634296+05:30
1718	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477150606 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.635032+05:30
3237	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794483905895 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.909972+05:30
3238	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 4bfe94fe: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:05.910819+05:30
1721	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 398f20e0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.650953+05:30
1722	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477150626 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.651987+05:30
1723	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 398f20e0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.653885+05:30
1724	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477150626 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.654757+05:30
2259	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e4875dc2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.866074+05:30
2260	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477623848 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.866735+05:30
1727	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e53a7a78: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.681314+05:30
1728	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477150654 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.682247+05:30
1729	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e53a7a78: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.683084+05:30
1730	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477150654 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.683966+05:30
3239	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794483905895 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.911496+05:30
2241	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 876706b1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.815887+05:30
2242	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477623800 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.81628+05:30
2243	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 876706b1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.81665+05:30
2244	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477623800 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.817142+05:30
3248	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 1309592b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:05.958653+05:30
2247	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 4a55604f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.827488+05:30
2248	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477623812 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.828095+05:30
2249	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 4a55604f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.828615+05:30
2250	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477623812 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.829094+05:30
3249	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794483905614 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.959438+05:30
3250	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 1309592b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:05.960156+05:30
2253	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e4875dc2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.851509+05:30
2254	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477623835 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.85207+05:30
2255	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e4875dc2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.852574+05:30
2256	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477623835 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.853059+05:30
3251	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794483905614 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.960818+05:30
2526	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.332901+05:30
3266	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch d6813cc3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:06.03072+05:30
2535	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 91fe4cd7: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:46.360562+05:30
2536	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.361155+05:30
2537	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 91fe4cd7: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:46.361659+05:30
2538	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.362205+05:30
3267	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794483906014 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:06.031537+05:30
3268	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch d6813cc3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:06.032386+05:30
3269	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794483906014 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:06.033308+05:30
2657	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch a05a958d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.197482+05:30
2658	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.19825+05:30
2661	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 662619ed: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.229844+05:30
2662	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.230786+05:30
2663	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 662619ed: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.231961+05:30
2664	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.232884+05:30
3602	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch ab0def9a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.2908+05:30
3603	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.293594+05:30
3604	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch ab0def9a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.294541+05:30
3605	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.295424+05:30
2261	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e4875dc2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:23.867426+05:30
2262	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477623848 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:23.868022+05:30
1733	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e53a7a78: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.699418+05:30
1734	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477150675 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.701064+05:30
1735	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e53a7a78: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:30.70193+05:30
1736	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477150675 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:30.702624+05:30
3242	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch e64d5e8e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:05.935719+05:30
3243	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794483905911 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.938106+05:30
1739	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 7b9fe7ba: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.180519+05:30
1740	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.182354+05:30
1741	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 7b9fe7ba: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.183159+05:30
1742	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.183874+05:30
2541	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 4ad5ff38: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.804146+05:30
2542	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.808445+05:30
1745	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 95b6857d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.205715+05:30
1746	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.206432+05:30
1747	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 95b6857d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.207162+05:30
1748	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.20775+05:30
2543	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 4ad5ff38: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.809364+05:30
2544	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.810161+05:30
1751	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 78023828: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.235975+05:30
1752	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.236901+05:30
1753	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 78023828: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.237888+05:30
1754	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.238803+05:30
3244	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch e64d5e8e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:05.939144+05:30
3245	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794483905911 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.940229+05:30
1757	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 65b7ce88: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.260215+05:30
1758	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.26116+05:30
1759	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 65b7ce88: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.26238+05:30
1760	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.263688+05:30
2547	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch f3a9564d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.832905+05:30
2548	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.833388+05:30
1763	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 5e949062: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:32.28597+05:30
1764	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.286756+05:30
1765	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 5e949062: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:32.287522+05:30
1766	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.288214+05:30
2549	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch f3a9564d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.833846+05:30
1769	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch e7d03615: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.306192+05:30
1770	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.306908+05:30
1771	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch e7d03615: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.307555+05:30
1772	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.308177+05:30
2265	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 5033d9d0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.319876+05:30
2266	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.323426+05:30
1775	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch a2053979: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.323538+05:30
1776	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.324116+05:30
1777	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch a2053979: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:22:32.324696+05:30
1778	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.325291+05:30
2267	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 5033d9d0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.324369+05:30
2268	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.325248+05:30
2271	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 23540dcc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.347116+05:30
2272	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.347715+05:30
2273	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 23540dcc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.348366+05:30
2274	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.349122+05:30
3254	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch c668dcce: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:05.983445+05:30
3255	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794483905964 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.984557+05:30
2277	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 3338a2ba: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.375301+05:30
2278	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.375924+05:30
2279	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 3338a2ba: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.376423+05:30
2280	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.377124+05:30
3256	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch c668dcce: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:05.985546+05:30
3257	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794483905964 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:05.986409+05:30
2289	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 763f0b00: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:25.423406+05:30
2290	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.424339+05:30
2291	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 763f0b00: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:25.4252+05:30
2292	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.426065+05:30
2301	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch ef7b6e0e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.462579+05:30
2302	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.463291+05:30
2303	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch ef7b6e0e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.464029+05:30
2304	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.46485+05:30
3260	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 5beb3891: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:06.002192+05:30
3261	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794483905985 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:06.003088+05:30
2550	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.834395+05:30
3262	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 5beb3891: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:06.003914+05:30
3263	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794483905985 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:06.00468+05:30
2553	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 47a4c37b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.860207+05:30
2554	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.860918+05:30
2555	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 47a4c37b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.86156+05:30
2556	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.862125+05:30
2283	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch f6ac5779: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.394753+05:30
2284	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.396912+05:30
1781	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch f92be320: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:32.335972+05:30
1782	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:22:32.336563+05:30
1783	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch f92be320: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:22:32.337152+05:30
2285	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch f6ac5779: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.397883+05:30
1784	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 15:22:32.33776+05:30
2286	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.398777+05:30
1787	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 0f8e70d7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.718104+05:30
1788	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.718961+05:30
1789	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 0f8e70d7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.719714+05:30
1790	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.720894+05:30
3272	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch d6813cc3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:06.055407+05:30
2295	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch fcac20ca: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.444996+05:30
1793	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 5fcb445a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.748451+05:30
1794	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.749234+05:30
1795	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 5fcb445a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.750015+05:30
1796	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.750982+05:30
2296	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.445813+05:30
2297	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch fcac20ca: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:30:25.446526+05:30
1799	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 7b8c36a4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.780323+05:30
1800	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.781092+05:30
1801	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 7b8c36a4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.781896+05:30
1802	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.782663+05:30
2298	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.447384+05:30
3273	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794483906031 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:06.056102+05:30
1805	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 2ff92da6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.802269+05:30
1806	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.803018+05:30
1807	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 2ff92da6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.804166+05:30
1808	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.805299+05:30
3274	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch d6813cc3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:06.056831+05:30
2307	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch a30780af: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:25.476544+05:30
1811	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 04d97f42: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:46.829693+05:30
1812	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.830562+05:30
1813	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 04d97f42: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:46.831437+05:30
1814	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.832196+05:30
2308	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.477375+05:30
2309	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch a30780af: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:30:25.478051+05:30
1817	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 675d8b30: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.851297+05:30
1818	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.853508+05:30
1819	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 675d8b30: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.854207+05:30
1820	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.854983+05:30
2310	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:30:25.478891+05:30
3275	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794483906031 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:06.057468+05:30
1829	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch eb124a5b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:46.882536+05:30
1830	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.883376+05:30
1831	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch eb124a5b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:46.884044+05:30
1832	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 15:24:46.884675+05:30
3608	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch adfbd7b4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.318165+05:30
2565	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch a1a930a1: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:51:49.900212+05:30
2566	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.900956+05:30
2567	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch a1a930a1: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:51:49.901841+05:30
2568	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.902723+05:30
3609	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.318996+05:30
3610	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch adfbd7b4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.31978+05:30
2577	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 906c5f6b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.931064+05:30
2578	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.93172+05:30
2579	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 906c5f6b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.932569+05:30
2580	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.933223+05:30
3611	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.320642+05:30
3614	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 64984dc8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.348033+05:30
2673	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 2c5f6b01: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:06.276545+05:30
2674	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.27706+05:30
2675	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 2c5f6b01: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:06.277626+05:30
2676	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.278269+05:30
3615	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.348824+05:30
3616	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 64984dc8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.349512+05:30
2685	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 818dcb8b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.308748+05:30
2686	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.309421+05:30
2687	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 818dcb8b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.309995+05:30
2688	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.310433+05:30
3617	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.350124+05:30
3626	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 8aaa6394: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:26.381384+05:30
2715	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch fd25d880: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:13.64011+05:30
2716	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794479113626 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.64073+05:30
2717	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch fd25d880: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:13.641349+05:30
2718	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794479113626 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.641999+05:30
2313	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 5eba5ec6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.553772+05:30
2314	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794478697424 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.571964+05:30
1823	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 48dd60c8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.869617+05:30
1824	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.87041+05:30
1825	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 48dd60c8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:46.871241+05:30
1826	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:46.872033+05:30
1833	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 6cd6b59f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.351188+05:30
1834	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477297143 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.35326+05:30
2315	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 5eba5ec6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.572919+05:30
2316	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794478697424 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.573839+05:30
1837	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 6cd6b59f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.355471+05:30
1838	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477297143 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.35618+05:30
1839	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 04ff4d4a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:57.38789+05:30
1840	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477297143 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.388626+05:30
3278	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch b20fb5ab: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.525555+05:30
3279	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.528568+05:30
1843	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 04ff4d4a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:57.390945+05:30
1844	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477297143 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.39158+05:30
1845	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch db6159cc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.436651+05:30
1846	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477297396 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.437327+05:30
2319	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch f05e4af1: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:48:17.610394+05:30
2320	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794478697424 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.611218+05:30
1849	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch db6159cc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.439384+05:30
1850	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477297396 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.440137+05:30
1851	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 302f4c32: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:57.470404+05:30
1852	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477297439 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.47252+05:30
2321	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch f05e4af1: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:48:17.611976+05:30
2322	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794478697424 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.61289+05:30
1855	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 302f4c32: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:57.474872+05:30
1856	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477297439 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.475633+05:30
1857	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 1321264f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:57.485659+05:30
1858	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477297462 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.486225+05:30
3280	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch b20fb5ab: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.52968+05:30
1861	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 1321264f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:57.48849+05:30
1862	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477297462 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.488994+05:30
1863	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 69587ded: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:57.503281+05:30
1864	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477297143 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.503833+05:30
2325	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch e6b55078: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.670249+05:30
1867	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 69587ded: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:57.505567+05:30
1868	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477297143 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.506064+05:30
1887	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e8c663b3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.570822+05:30
1869	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch b9683102: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.522018+05:30
1870	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477297496 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.522805+05:30
2326	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794478697644 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.671301+05:30
2327	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch e6b55078: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.672296+05:30
1873	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch b9683102: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.524394+05:30
1874	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477297496 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.524933+05:30
1875	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 7987d853: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.535142+05:30
1876	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477297511 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.535856+05:30
2328	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794478697644 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.67301+05:30
3281	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.53083+05:30
1879	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 7987d853: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.537534+05:30
1880	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477297511 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.538043+05:30
1881	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e8c663b3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.556682+05:30
1882	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477297533 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.55726+05:30
2337	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch d3fa1cf3: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:48:17.728889+05:30
1885	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e8c663b3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.558781+05:30
1886	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477297533 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.559287+05:30
2338	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794478697719 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.729733+05:30
2339	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch d3fa1cf3: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:48:17.730566+05:30
2340	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794478697719 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.731438+05:30
3284	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 4705b5e9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.555117+05:30
2361	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 525457fa: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.815447+05:30
2362	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794478697803 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.816291+05:30
2363	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 525457fa: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.817092+05:30
2364	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794478697803 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.817857+05:30
3285	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.555927+05:30
3286	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 4705b5e9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.55664+05:30
2559	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 75c98574: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.879111+05:30
2560	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.881266+05:30
2561	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 75c98574: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.882085+05:30
2562	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.882864+05:30
3287	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.557454+05:30
2571	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 98eda675: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.91837+05:30
2572	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.918808+05:30
2573	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 98eda675: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:51:49.919259+05:30
2574	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.919597+05:30
3290	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch fa78256e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.584431+05:30
1888	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477297545 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.571358+05:30
2331	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 7053d32a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:48:17.711312+05:30
2332	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794478697694 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.713724+05:30
1891	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e8c663b3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:57.573078+05:30
1892	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477297545 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:57.573408+05:30
1893	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch ee886f75: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:58.97099+05:30
1894	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:58.97345+05:30
2333	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 7053d32a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:48:17.714632+05:30
2334	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794478697694 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.715478+05:30
1897	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch ee886f75: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:58.976219+05:30
1898	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:58.978373+05:30
1899	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch b0304081: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:59.000509+05:30
1900	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.001062+05:30
3291	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.585384+05:30
3292	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch fa78256e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.586431+05:30
1903	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch b0304081: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:59.002679+05:30
1904	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.003139+05:30
1905	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch e9f6af2d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:59.029913+05:30
1906	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.030822+05:30
2343	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch ed003fdd: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:48:17.747897+05:30
2344	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794478697424 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.748498+05:30
1909	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch e9f6af2d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:59.033897+05:30
1910	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.034822+05:30
1911	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch aa223d0c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:59.051235+05:30
1912	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.053009+05:30
2345	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch ed003fdd: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:48:17.749243+05:30
2346	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794478697424 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.749831+05:30
1915	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch aa223d0c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:59.055375+05:30
1916	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.060005+05:30
1917	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch a019e2b6: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:59.075066+05:30
1918	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.075983+05:30
3293	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.587362+05:30
1921	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch a019e2b6: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:59.079678+05:30
1922	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.080457+05:30
1923	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 59733448: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:59.097891+05:30
1924	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.098755+05:30
2349	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 6bf36830: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.766957+05:30
2350	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794478697755 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.767505+05:30
1927	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 59733448: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:59.100693+05:30
1928	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.101153+05:30
1929	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 1a5df54a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:59.114953+05:30
1930	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.115443+05:30
2351	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 6bf36830: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.768002+05:30
2352	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794478697755 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.768431+05:30
1933	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 1a5df54a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:24:59.117555+05:30
1934	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.11819+05:30
3302	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch afe7612e: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:07.630328+05:30
2355	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 3faddba3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.781146+05:30
2356	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794478697771 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.781935+05:30
2357	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 3faddba3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.782372+05:30
2358	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794478697771 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.782824+05:30
3303	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.630843+05:30
3304	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch afe7612e: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:07.631295+05:30
2367	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 525457fa: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.832604+05:30
2368	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794478697820 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.833536+05:30
2369	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 525457fa: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:48:17.834344+05:30
2370	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794478697820 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:48:17.834943+05:30
3305	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.631801+05:30
2583	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 6c3d8468: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:51:49.942729+05:30
2584	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.94332+05:30
2585	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 6c3d8468: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:51:49.943899+05:30
2586	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:51:49.944477+05:30
3314	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch b7a64a07: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.667133+05:30
3315	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.667821+05:30
2667	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 250aaba8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.253139+05:30
2668	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.255348+05:30
2669	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 250aaba8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.256426+05:30
2670	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.257396+05:30
3316	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch b7a64a07: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.668458+05:30
3317	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.669043+05:30
2679	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch dd708ff8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.295022+05:30
2680	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.295618+05:30
2681	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch dd708ff8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.296129+05:30
2682	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.296487+05:30
2691	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch a49fdc7f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:06.319179+05:30
2692	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.319846+05:30
2693	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch a49fdc7f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:06.320461+05:30
2694	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.321179+05:30
1935	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch d104e6b8: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:59.128776+05:30
1936	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:24:59.1298+05:30
2373	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch cdaf0743: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.067131+05:30
2374	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794478758957 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.083975+05:30
1939	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch d104e6b8: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:24:59.131274+05:30
2375	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch cdaf0743: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.084883+05:30
1940	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 15:24:59.131677+05:30
1941	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 1362b30c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.0579+05:30
1942	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477503949 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.061429+05:30
2376	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794478758957 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.085749+05:30
3296	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 314f3b63: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.606783+05:30
1945	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 1362b30c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.064442+05:30
1946	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477503949 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.065408+05:30
1947	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 0f00b189: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:24.099205+05:30
1948	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477503949 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.099985+05:30
3297	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.609519+05:30
2379	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 80f33a65: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:19.121397+05:30
1951	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 0f00b189: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:24.102772+05:30
1952	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477503949 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.103615+05:30
1953	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch d4993509: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.154485+05:30
1954	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477504119 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.155293+05:30
2380	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794478758957 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.122003+05:30
2381	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 80f33a65: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:19.122598+05:30
1957	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch d4993509: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.157946+05:30
1958	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477504119 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.158788+05:30
1959	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 36f8f19a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:24.182421+05:30
1960	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477504164 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.183156+05:30
2382	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794478758957 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.123297+05:30
3298	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 314f3b63: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.610612+05:30
1963	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 36f8f19a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:24.185671+05:30
1964	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477504164 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.186513+05:30
1965	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 57094953: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:24.204049+05:30
1966	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477504182 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.206423+05:30
3299	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.611792+05:30
2385	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 14a1812d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.182362+05:30
1969	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 57094953: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:24.20891+05:30
1970	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477504182 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.20952+05:30
1971	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 239ace2d: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:24.223121+05:30
1972	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477503949 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.2236+05:30
2386	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794478759150 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.183234+05:30
2387	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 14a1812d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.183939+05:30
1975	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 239ace2d: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:24.22486+05:30
1976	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477503949 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.22521+05:30
1995	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch a00b267c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.282474+05:30
1996	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477504269 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.2829+05:30
2388	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794478759150 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.18452+05:30
1999	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch a00b267c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.284321+05:30
2000	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477504269 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.284905+05:30
2391	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch f22471f2: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:19.210804+05:30
2392	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794478759199 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.211359+05:30
2393	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch f22471f2: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:19.21199+05:30
2394	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794478759199 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.213525+05:30
3308	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 7009cd97: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.647981+05:30
3309	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.648771+05:30
2403	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 5390bd0a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:19.256831+05:30
2404	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794478758957 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.257524+05:30
2405	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 5390bd0a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:19.25823+05:30
2406	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794478758957 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.258939+05:30
3310	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 7009cd97: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.649476+05:30
3311	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.65031+05:30
2427	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 5079154e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.344131+05:30
2428	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794478759330 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.34473+05:30
2429	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 5079154e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.346208+05:30
2430	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794478759330 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.347442+05:30
2589	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 958b50f3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.470582+05:30
2590	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794478924376 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.472911+05:30
2591	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 958b50f3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.473914+05:30
2592	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794478924376 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.474928+05:30
3320	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 294117ea: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:07.678209+05:30
3321	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.678919+05:30
2595	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 21647bbe: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:04.513273+05:30
2596	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794478924376 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.514029+05:30
2597	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 21647bbe: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:04.514791+05:30
2598	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794478924376 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.515567+05:30
3322	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 294117ea: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:15:07.679902+05:30
3323	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.680508+05:30
2601	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 1dd3ffdc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.570482+05:30
2602	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794478924540 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.571398+05:30
2603	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 1dd3ffdc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.572388+05:30
1977	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 3cf4d71c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.241381+05:30
1978	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477504224 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.242055+05:30
2397	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch cb8283b6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:19.234003+05:30
2398	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794478759213 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.236422+05:30
1981	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 3cf4d71c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.243148+05:30
1982	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477504224 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.243508+05:30
1983	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 6886f0ab: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.252768+05:30
1984	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477504239 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.253204+05:30
2399	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch cb8283b6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:19.237302+05:30
2400	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794478759213 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.238232+05:30
1987	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 6886f0ab: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.254523+05:30
1988	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477504239 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.2549+05:30
1989	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch a00b267c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.272267+05:30
1990	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477504258 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.272721+05:30
1993	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch a00b267c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:24.273891+05:30
1994	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477504258 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:24.274194+05:30
2001	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch fcaa72ad: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.846519+05:30
2002	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.848892+05:30
2409	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch d866c028: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.282206+05:30
2410	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794478759264 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.283143+05:30
2005	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch fcaa72ad: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.852753+05:30
2006	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.853706+05:30
2007	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 75eee294: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.877652+05:30
2008	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.878321+05:30
2411	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch d866c028: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.284172+05:30
2412	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794478759264 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.285156+05:30
2011	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 75eee294: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.880828+05:30
2012	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.881624+05:30
2013	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch be3d7d92: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.910108+05:30
2014	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.911121+05:30
3332	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794483907968	Batch 3f1f9764: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.996169+05:30
3333	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794483907968 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.996822+05:30
2017	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch be3d7d92: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.914393+05:30
2018	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.915783+05:30
2019	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 248175f7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.934429+05:30
2020	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.936836+05:30
2415	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 482f7031: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.301851+05:30
2416	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794478759286 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.302617+05:30
2023	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 248175f7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.940007+05:30
2024	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.94415+05:30
2031	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 6dda4460: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.978503+05:30
2032	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.979032+05:30
2417	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 482f7031: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.303406+05:30
2418	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794478759286 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.304313+05:30
2035	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 6dda4460: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.980446+05:30
2036	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.98092+05:30
2043	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 87fe24e7: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:26.002176+05:30
2044	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:28:26.00281+05:30
3326	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch a3480461: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.939334+05:30
3327	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794483907831 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.940042+05:30
2047	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 87fe24e7: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:26.004331+05:30
2421	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 5079154e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.329718+05:30
2048	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 15:28:26.00474+05:30
2422	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794478759314 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.330839+05:30
2423	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 5079154e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:19.331871+05:30
2424	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794478759314 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:19.332464+05:30
3328	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch a3480461: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.940662+05:30
3329	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794483907831 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.941307+05:30
2604	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794478924540 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.573433+05:30
2607	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch e07d7232: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:04.603093+05:30
2608	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794478924588 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.603894+05:30
2609	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch e07d7232: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:04.604724+05:30
2610	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794478924588 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.605421+05:30
3620	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d36c1ba5: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.363791+05:30
3621	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.365961+05:30
2619	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 1ef0a7f6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:04.665324+05:30
2620	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794478924376 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.665966+05:30
2621	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 1ef0a7f6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:04.666687+05:30
2622	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794478924376 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.667383+05:30
3622	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d36c1ba5: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.366644+05:30
2637	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e76e8a45: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.735909+05:30
2638	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794478924715 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.736687+05:30
2639	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e76e8a45: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.737447+05:30
2640	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794478924715 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.738127+05:30
2721	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch db51d650: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:13.660821+05:30
2722	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794479113641 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.662896+05:30
2723	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch db51d650: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:13.663762+05:30
2724	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794479113641 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.667138+05:30
2727	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch c4faf244: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:13.686956+05:30
2728	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794479113389 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.687599+05:30
2025	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch eca1e510: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:25.959952+05:30
2026	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.960891+05:30
2433	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch b5ecc466: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.423789+05:30
2434	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794478776323 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.42612+05:30
2029	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch eca1e510: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:28:25.963249+05:30
2030	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.963912+05:30
2037	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 623c3f81: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.991726+05:30
2038	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.992165+05:30
2435	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch b5ecc466: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.427003+05:30
2436	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794478776323 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.427829+05:30
2041	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 623c3f81: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:28:25.993439+05:30
2042	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:28:25.993872+05:30
2049	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 80a23780: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.277885+05:30
2050	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477572147 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.292209+05:30
3334	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794483907968	Batch 3f1f9764: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:15:07.997443+05:30
3335	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794483907968 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:15:07.998185+05:30
2053	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 80a23780: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.295248+05:30
2054	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794477572147 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.296307+05:30
2055	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 67cbb8b8: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:32.330875+05:30
2056	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477572147 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.331655+05:30
2439	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch da6bdae7: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:36.466998+05:30
2440	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794478776323 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.467684+05:30
2059	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 67cbb8b8: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:32.334078+05:30
2060	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794477572147 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.334896+05:30
2061	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch cd85b830: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.386286+05:30
2062	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477572347 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.387391+05:30
2441	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch da6bdae7: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:36.468329+05:30
2442	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794478776323 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.469152+05:30
2065	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch cd85b830: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.391319+05:30
2066	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794477572347 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.392291+05:30
2067	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch c1ba92ab: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:32.417607+05:30
2068	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477572391 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.418489+05:30
2071	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch c1ba92ab: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:32.422561+05:30
2072	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794477572391 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.423211+05:30
2073	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch d119d997: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:32.438552+05:30
2074	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477572413 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.440491+05:30
2445	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch d98d6678: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.5226+05:30
2446	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794478776488 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.52346+05:30
2077	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch d119d997: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:32.442812+05:30
2079	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch f1a4ff21: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:32.458033+05:30
2078	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794477572413 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.443352+05:30
2085	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 92c32b76: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.47613+05:30
2086	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477572453 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.476587+05:30
2447	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch d98d6678: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.524263+05:30
2448	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794478776488 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.52524+05:30
2089	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 92c32b76: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.477836+05:30
2090	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794477572453 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.478284+05:30
2091	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 7ee17477: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.490391+05:30
2092	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477572468 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.491158+05:30
3623	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.367361+05:30
2095	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 7ee17477: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.49389+05:30
2096	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794477572468 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.494681+05:30
2103	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e78e18fb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.529522+05:30
2104	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477572510 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.530012+05:30
2457	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 5d7b11fa: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:36.576466+05:30
2458	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794478776558 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.577001+05:30
2107	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e78e18fb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.531311+05:30
2108	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794477572510 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.531863+05:30
2459	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 5d7b11fa: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:36.577538+05:30
2460	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794478776558 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.578218+05:30
2469	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 2d27f6ff: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.614702+05:30
2470	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794478776593 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.615607+05:30
2471	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 2d27f6ff: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.616068+05:30
2472	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794478776593 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.616535+05:30
2475	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 86657d0d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.625343+05:30
2476	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794478776607 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.625729+05:30
2477	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 86657d0d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.626097+05:30
2478	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794478776607 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.628443+05:30
2487	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch b5a090dc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.676801+05:30
2488	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794478776656 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.677267+05:30
2489	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch b5a090dc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.677693+05:30
2490	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794478776656 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.678435+05:30
2613	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 71097fef: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:04.638033+05:30
2614	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794478924603 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.640454+05:30
2615	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 71097fef: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:52:04.641661+05:30
2616	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794478924603 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.642932+05:30
2625	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch cfad5017: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.688745+05:30
2626	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794478924668 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.689372+05:30
2627	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch cfad5017: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.69+05:30
2628	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794478924668 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.690804+05:30
2080	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477572147 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.458578+05:30
2451	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 46efe43c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:36.562797+05:30
2452	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794478776537 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.566119+05:30
2083	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch f1a4ff21: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:32.45988+05:30
2084	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794477572147 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.460197+05:30
2097	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e78e18fb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.517306+05:30
2098	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477572494 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.518159+05:30
2453	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 46efe43c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:36.566882+05:30
2454	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794478776537 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.567419+05:30
2101	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e78e18fb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:32.519579+05:30
2102	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794477572494 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:32.519992+05:30
2109	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch e1ac9c0a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:33.944772+05:30
2110	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:33.946757+05:30
2113	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch e1ac9c0a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:33.949407+05:30
2114	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:33.950188+05:30
2115	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 14ada3cc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:33.971637+05:30
2116	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:33.972359+05:30
2463	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 546b2cc8: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:36.594929+05:30
2464	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794478776323 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.59557+05:30
2119	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 14ada3cc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:33.97449+05:30
2120	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:33.975135+05:30
2121	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 737b0f9c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:33.999439+05:30
2122	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.00019+05:30
2465	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 546b2cc8: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:36.59627+05:30
2466	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794478776323 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.597229+05:30
2125	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 737b0f9c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:34.002113+05:30
2126	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.002867+05:30
2127	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d016bf0a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:34.021909+05:30
2128	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.024459+05:30
2131	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d016bf0a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:34.02737+05:30
2132	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.028293+05:30
2133	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 88ca2eb7: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:34.048649+05:30
2134	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.049429+05:30
2481	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch b5a090dc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.66147+05:30
2482	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794478776629 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.662388+05:30
2137	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 88ca2eb7: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:34.051866+05:30
2138	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.052741+05:30
2139	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 8fbf5ada: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:34.067951+05:30
3632	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 465dfb1b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.396546+05:30
3633	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.397016+05:30
3634	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 465dfb1b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.397628+05:30
2140	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.068628+05:30
2483	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch b5a090dc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:36.663272+05:30
2484	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794478776629 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:36.664911+05:30
2143	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 8fbf5ada: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:34.072617+05:30
2144	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.073243+05:30
2151	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 15124c13: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:34.099486+05:30
2152	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.100251+05:30
2155	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 15124c13: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:29:34.104524+05:30
2156	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 15:29:34.105911+05:30
2631	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch b4ddc227: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.705638+05:30
2632	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794478924689 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.70634+05:30
2633	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch b4ddc227: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.706975+05:30
2634	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794478924689 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.707623+05:30
2643	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e76e8a45: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.752447+05:30
2644	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794478924734 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.753166+05:30
2645	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e76e8a45: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:04.753887+05:30
2646	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794478924734 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:04.754567+05:30
2697	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 13b357e4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.509155+05:30
2698	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794479113389 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.520091+05:30
2699	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 13b357e4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.521379+05:30
2700	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794479113389 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.522572+05:30
3627	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.381918+05:30
3628	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 8aaa6394: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:26.382473+05:30
2703	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch d6839fb3: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:13.557454+05:30
2704	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794479113389 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.558243+05:30
2705	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch d6839fb3: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:13.558968+05:30
2706	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794479113389 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.559687+05:30
3629	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.382879+05:30
2709	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 62b0945c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.61071+05:30
2710	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794479113583 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.611461+05:30
2711	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 62b0945c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.612075+05:30
2712	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794479113583 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.612665+05:30
2145	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 52fefdf4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:34.085583+05:30
2146	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.08711+05:30
2493	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 91836570: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.195223+05:30
2494	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.197685+05:30
2149	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 52fefdf4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:29:34.089747+05:30
2150	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:29:34.090559+05:30
2495	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 91836570: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.198761+05:30
2496	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.199863+05:30
2499	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch d5617c90: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.226419+05:30
2500	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.227258+05:30
2501	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch d5617c90: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.228117+05:30
2502	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.229074+05:30
2505	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 2fd2acf2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.257634+05:30
2506	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.258488+05:30
2507	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 2fd2acf2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.259465+05:30
2508	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.260232+05:30
3638	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 0d532544: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.413456+05:30
2517	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch c4c5e00c: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:46.309891+05:30
2518	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.310676+05:30
2519	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch c4c5e00c: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:49:46.311377+05:30
2520	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.312141+05:30
3639	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.414316+05:30
3640	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 0d532544: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.415105+05:30
2529	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch dd8f6354: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.34816+05:30
2530	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.348874+05:30
2531	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch dd8f6354: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:49:46.349543+05:30
2532	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:49:46.350207+05:30
3641	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.415828+05:30
2649	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 694c931c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.165921+05:30
2650	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.168313+05:30
2651	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 694c931c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.169471+05:30
2652	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.170517+05:30
3656	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794501686689	Batch bb978919: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.718999+05:30
2655	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch a05a958d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:52:06.196021+05:30
2656	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:52:06.196746+05:30
3657	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794501686689 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.719593+05:30
3658	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794501686689	Batch bb978919: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.720143+05:30
3659	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794501686689 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.720693+05:30
3758	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 55e5565d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.81485+05:30
2729	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch c4faf244: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:13.688209+05:30
2730	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794479113389 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.68942+05:30
3354	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: SSRF Test	Batch 8c788505: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:29:43.410182+05:30
2745	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 1cf373c6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.759551+05:30
2746	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794479113743 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.760184+05:30
2747	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 1cf373c6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.760845+05:30
2748	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794479113743 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.761471+05:30
3356	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: SSRF Test	Batch 8c788505: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:29:43.428459+05:30
3635	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.39824+05:30
3644	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch faed0285: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:26.425015+05:30
3645	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.425657+05:30
3646	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch faed0285: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:26.42635+05:30
3647	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.426943+05:30
3650	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 60a458f4: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.658479+05:30
3651	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794501686554 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.659408+05:30
3652	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 60a458f4: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:26.660806+05:30
3653	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794501686554 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:11:26.662107+05:30
3759	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794501770795 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.815579+05:30
3760	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 55e5565d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.816224+05:30
3761	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794501770795 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.81692+05:30
3764	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 83afa035: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.832102+05:30
3765	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794501770813 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.832888+05:30
3766	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 83afa035: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.833527+05:30
3767	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794501770813 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.834065+05:30
3776	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch ac6c0d3e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.882312+05:30
3777	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794501770865 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.884041+05:30
3778	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch ac6c0d3e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.884949+05:30
3779	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794501770865 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.885627+05:30
2733	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 36a5ab32: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.717157+05:30
2734	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794479113693 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.717889+05:30
2735	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 36a5ab32: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.718482+05:30
2736	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794479113693 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.719116+05:30
2739	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 125ce1a2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.732602+05:30
2740	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794479113719 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.733382+05:30
2741	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 125ce1a2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.734083+05:30
2742	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794479113719 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.734822+05:30
2751	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 1cf373c6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.773515+05:30
2752	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794479113760 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.774193+05:30
2753	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 1cf373c6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:13.774963+05:30
2754	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794479113760 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:13.775717+05:30
2757	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch e7be4c0d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.138909+05:30
2758	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.141188+05:30
2759	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch e7be4c0d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.14221+05:30
2760	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.143228+05:30
2763	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch d756f43c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.165692+05:30
2764	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.166634+05:30
2765	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch d756f43c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.167542+05:30
2766	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.168817+05:30
3794	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch bbce0e4d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:16:03.379938+05:30
3795	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:16:03.383241+05:30
2769	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 8542a767: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.19534+05:30
2770	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.196367+05:30
2771	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 8542a767: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.197232+05:30
2772	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.198244+05:30
3796	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch bbce0e4d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:16:03.384934+05:30
3797	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:16:03.386277+05:30
2775	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 44264569: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.217899+05:30
2776	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.219936+05:30
2777	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 44264569: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.22077+05:30
2778	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.221536+05:30
3809	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:17:43.351243+05:30
3362	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 3346fdde: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:58.559135+05:30
2787	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 145fc0d1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.261406+05:30
2788	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.262254+05:30
2789	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 145fc0d1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.263039+05:30
2790	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.263905+05:30
3363	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794485458366 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:58.589294+05:30
3364	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 3346fdde: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:58.591583+05:30
2799	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 13525085: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:15.292118+05:30
2800	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.29286+05:30
2801	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 13525085: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:15.293455+05:30
2802	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.294349+05:30
3365	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794485458366 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:58.595216+05:30
3368	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 8baf61d4: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:40:58.697955+05:30
3369	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794485458366 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:40:58.700103+05:30
3370	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 8baf61d4: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:40:58.702109+05:30
3371	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794485458366 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:40:58.70411+05:30
3374	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 6479c494: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:58.831994+05:30
3375	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794485458776 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:58.833503+05:30
3376	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 6479c494: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:58.834985+05:30
3377	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794485458776 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:58.836765+05:30
3386	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch d03fa61f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:40:58.970471+05:30
3387	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794485458949 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:40:58.972199+05:30
3388	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch d03fa61f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:40:58.973902+05:30
3389	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794485458949 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:40:58.975621+05:30
3398	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch dfbe424f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:59.075057+05:30
3399	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794485459045 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:59.077563+05:30
3400	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch dfbe424f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:59.07951+05:30
3401	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794485459045 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:59.080833+05:30
3404	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 182e6dd3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:59.115914+05:30
3405	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794485459088 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:59.117475+05:30
3406	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 182e6dd3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:59.118807+05:30
2781	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 980475fc: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:15.243053+05:30
2782	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.243839+05:30
2783	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 980475fc: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:55:15.244661+05:30
2784	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.245303+05:30
3380	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 9b9cc79a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:40:58.935203+05:30
3381	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794485458895 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:40:58.938557+05:30
2793	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 38bc5ae3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.2781+05:30
2794	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.278773+05:30
2795	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 38bc5ae3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:55:15.279794+05:30
2796	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:55:15.28078+05:30
3382	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 9b9cc79a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:40:58.939864+05:30
3383	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794485458895 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:40:58.941102+05:30
2805	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 4daeb296: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:09.872421+05:30
2806	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794479349738 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:09.876135+05:30
2807	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 4daeb296: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:09.877127+05:30
2808	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794479349738 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:09.877981+05:30
2811	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 90a64886: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:09.931547+05:30
2812	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794479349738 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:59:09.932563+05:30
2813	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 90a64886: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:09.933648+05:30
2814	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794479349738 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:59:09.934778+05:30
3392	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch f718af89: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:40:59.020579+05:30
3393	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794485458366 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:40:59.021707+05:30
2817	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 2f31fec8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:10.000946+05:30
2818	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794479349972 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.001859+05:30
2819	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 2f31fec8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:10.002567+05:30
2820	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794479349972 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.003243+05:30
3394	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch f718af89: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:40:59.02285+05:30
3395	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794485458366 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:40:59.024001+05:30
2823	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 409b3c53: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:10.036231+05:30
2824	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794479350026 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.037536+05:30
2825	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 409b3c53: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:10.038414+05:30
2826	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794479350026 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.039612+05:30
2829	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch a38bbbcb: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:10.06478+05:30
2830	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794479350044 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.067617+05:30
2831	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch a38bbbcb: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:10.068753+05:30
2832	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794479350044 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.06977+05:30
2835	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 138fadbc: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:10.102375+05:30
3407	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794485459088 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:59.119906+05:30
2841	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 422428a0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:10.150769+05:30
2842	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794479350123 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.152068+05:30
2843	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 422428a0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:10.154969+05:30
2844	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794479350123 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.156815+05:30
2847	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch a1604fd2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:10.183251+05:30
2848	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794479350163 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.18438+05:30
2849	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch a1604fd2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:10.185512+05:30
2850	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794479350163 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.186576+05:30
3416	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e380aa77: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:59.213802+05:30
3417	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794485459188 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:59.21526+05:30
2859	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 12c92f01: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:10.277942+05:30
2860	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794479350241 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.279124+05:30
2861	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 12c92f01: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:10.280358+05:30
2862	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794479350241 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.281247+05:30
3418	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch e380aa77: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:59.216508+05:30
3419	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794485459188 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:59.217709+05:30
3662	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 92439cf6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.147441+05:30
3663	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.152849+05:30
3664	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 92439cf6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.153979+05:30
3665	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.155209+05:30
3668	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 2b2238cc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.179613+05:30
3669	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.18033+05:30
3670	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 2b2238cc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.181029+05:30
3671	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.181905+05:30
3674	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch b7b56cdb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.207497+05:30
3675	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.207985+05:30
3676	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch b7b56cdb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.208688+05:30
3677	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.209365+05:30
3686	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 74bfa199: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:30.244299+05:30
3687	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.244837+05:30
2836	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794479349738 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.103516+05:30
2837	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 138fadbc: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:10.10506+05:30
2838	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794479349738 | 0 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.107045+05:30
3410	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e380aa77: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:59.18149+05:30
3411	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794485459152 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:59.183132+05:30
2853	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 12c92f01: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:10.232882+05:30
2854	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794479350212 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.233896+05:30
2855	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 12c92f01: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:10.234927+05:30
2856	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794479350212 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:10.236577+05:30
3412	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch e380aa77: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:40:59.184133+05:30
3413	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794485459152 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:40:59.184948+05:30
2865	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 58ce6451: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.551424+05:30
2866	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.5567+05:30
2867	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 58ce6451: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.559243+05:30
2868	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.561296+05:30
2871	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 3363fb0f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.616531+05:30
2872	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.618602+05:30
2873	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 3363fb0f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.620312+05:30
2874	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.622884+05:30
3680	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 8a866b0e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.224561+05:30
3681	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.226224+05:30
2877	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d796e8a4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.676726+05:30
2878	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.679108+05:30
2879	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d796e8a4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.680363+05:30
2880	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.682101+05:30
3682	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 8a866b0e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.226767+05:30
3683	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.227216+05:30
2883	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 01c57a11: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.718254+05:30
2884	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.722826+05:30
2885	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 01c57a11: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.724578+05:30
2886	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.72707+05:30
2889	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 86b7d747: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:12.786325+05:30
2890	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.788935+05:30
2891	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 86b7d747: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:12.790949+05:30
2892	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.792746+05:30
3692	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 9d607a57: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.26616+05:30
3693	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.266979+05:30
2895	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch d2c57c30: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.839877+05:30
2896	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.841617+05:30
2897	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch d2c57c30: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.844608+05:30
2898	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.847024+05:30
3422	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 9b4a95d3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.457989+05:30
3423	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794485477308 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.463208+05:30
2907	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch a25d452d: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:12.924473+05:30
2908	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.926582+05:30
2909	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch a25d452d: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 15:59:12.928228+05:30
2910	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.93026+05:30
3424	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 9b4a95d3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.464304+05:30
3425	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794485477308 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.465501+05:30
3428	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 1a4ff12f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:17.51445+05:30
3429	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794485477308 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.515503+05:30
3430	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 1a4ff12f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:17.516373+05:30
3431	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794485477308 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.517348+05:30
3434	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch cdacacaa: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.58871+05:30
3435	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794485477551 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.589719+05:30
3436	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch cdacacaa: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.591064+05:30
3437	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794485477551 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.592134+05:30
3440	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 70250aee: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:17.63996+05:30
3441	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794485477621 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.641151+05:30
3442	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 70250aee: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:17.642477+05:30
3443	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794485477621 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.645152+05:30
3458	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 13705b56: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.728022+05:30
3459	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794485477708 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.728768+05:30
3460	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 13705b56: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.729465+05:30
3461	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794485477708 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.730184+05:30
3464	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 7c1678c0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.748264+05:30
3465	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794485477728 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.749408+05:30
3466	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 7c1678c0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.750487+05:30
3467	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794485477728 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.751882+05:30
2901	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 445b04eb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.891499+05:30
2902	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.894297+05:30
2903	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 445b04eb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 15:59:12.895993+05:30
2904	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 15:59:12.897555+05:30
3446	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 8d035191: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:17.670217+05:30
3447	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794485477644 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.673375+05:30
3448	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 8d035191: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:17.674926+05:30
3449	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794485477644 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.676026+05:30
2916	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch c3db41d9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.611307+05:30
2917	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.612147+05:30
2918	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch c3db41d9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.615418+05:30
2919	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.617207+05:30
2922	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 54a07bfd: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.655771+05:30
2923	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.656843+05:30
2924	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 54a07bfd: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.657575+05:30
2925	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.658109+05:30
3452	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 07e776aa: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:17.699719+05:30
3453	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794485477308 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.700575+05:30
2928	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch b7153ce8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.703815+05:30
2929	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.705107+05:30
2930	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch b7153ce8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.706138+05:30
2931	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.70737+05:30
3454	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 07e776aa: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:17.701268+05:30
3455	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794485477308 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.701906+05:30
2934	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 275a7dd8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.742725+05:30
2935	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.743802+05:30
2936	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 275a7dd8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.74488+05:30
2937	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.747293+05:30
2940	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 22bbc19a: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:04:27.774387+05:30
2941	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.775121+05:30
2942	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 22bbc19a: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:04:27.775859+05:30
2943	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.776417+05:30
3470	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch b141a48d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.788299+05:30
3471	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794485477765 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.789435+05:30
2946	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 9c20eeb8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.806108+05:30
2947	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.807553+05:30
2948	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 9c20eeb8: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.808552+05:30
2949	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.809137+05:30
2952	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 6b70eced: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.835042+05:30
2953	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.835577+05:30
2954	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 6b70eced: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:27.836438+05:30
2955	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.83729+05:30
3476	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch b141a48d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.807866+05:30
3477	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794485477791 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.808789+05:30
2970	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794483268195	Batch b8ae076e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:04:28.237536+05:30
2971	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794483268195 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:04:28.238528+05:30
2972	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794483268195	Batch b8ae076e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:04:28.239357+05:30
2973	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794483268195 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:04:28.239939+05:30
3478	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch b141a48d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.810494+05:30
3479	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794485477791 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.811403+05:30
3688	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 74bfa199: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:30.245292+05:30
3689	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.245895+05:30
3698	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 4a8461aa: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.2884+05:30
3699	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.288987+05:30
3700	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 4a8461aa: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.289509+05:30
3701	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.28999+05:30
3716	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794501750703	Batch 87ab4466: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.744384+05:30
3717	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794501750703 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.74503+05:30
3718	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794501750703	Batch 87ab4466: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.745626+05:30
3719	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794501750703 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.74622+05:30
3782	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch b65e5bf0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:15:09.486682+05:30
3783	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:15:09.497295+05:30
3784	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch b65e5bf0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:15:09.498182+05:30
3785	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:15:09.498912+05:30
3798	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch e673c6b4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:16:39.657807+05:30
3799	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:16:39.660412+05:30
3800	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch e673c6b4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:16:39.66122+05:30
3801	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:16:39.661849+05:30
3810	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch d0e9a32d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:17:43.383998+05:30
3472	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch b141a48d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:17.790764+05:30
3473	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794485477765 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:17.791791+05:30
2958	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 1344411b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:04:27.8534+05:30
2959	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 17:04:27.854531+05:30
2960	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 1344411b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:04:27.855753+05:30
2961	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 17:04:27.856738+05:30
3694	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 9d607a57: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.267996+05:30
2964	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch cfb04ae4: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:28.177235+05:30
2965	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794483268064 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:04:28.177658+05:30
2966	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch cfb04ae4: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:04:28.178045+05:30
2967	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794483268064 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:04:28.178972+05:30
3695	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.270059+05:30
2976	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 6dbfa984: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.288558+05:30
2977	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.290374+05:30
2978	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 6dbfa984: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.291373+05:30
2979	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.292292+05:30
3704	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 1863a479: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:30.300884+05:30
2982	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 0303ffc2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.319787+05:30
2983	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.320559+05:30
2984	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 0303ffc2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.321255+05:30
2985	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.321994+05:30
3705	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.301666+05:30
3706	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 1863a479: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:30.302322+05:30
2988	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch db4cdd0a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.354151+05:30
2989	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.355048+05:30
2990	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch db4cdd0a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.355916+05:30
2991	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.356717+05:30
3707	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.302946+05:30
2994	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 165c7696: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.378034+05:30
2995	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.378954+05:30
2996	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 165c7696: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.379835+05:30
2997	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.380799+05:30
3000	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch de3f01ed: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:05:41.403301+05:30
3001	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.40401+05:30
3002	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch de3f01ed: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:05:41.404803+05:30
3710	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 438b037e: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.670113+05:30
3711	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794501750528 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.670985+05:30
3003	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.405577+05:30
3482	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch c3926146: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.375+05:30
3483	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.377512+05:30
3012	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch bf6fef13: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.456971+05:30
3013	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.457574+05:30
3014	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch bf6fef13: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.458149+05:30
3015	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.458866+05:30
3484	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch c3926146: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.378537+05:30
3485	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.379754+05:30
3030	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794483341794	Batch 314b083b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:05:41.854239+05:30
3031	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794483341794 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.854802+05:30
3032	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794483341794	Batch 314b083b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:05:41.855289+05:30
3033	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794483341794 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.85576+05:30
3488	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch e3a9b30f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.407917+05:30
3489	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.408485+05:30
3490	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch e3a9b30f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.409094+05:30
3491	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.40972+05:30
3494	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d0d4f174: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.435604+05:30
3495	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.436192+05:30
3496	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d0d4f174: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.436989+05:30
3497	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.437657+05:30
3506	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 03d91c35: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:26.472388+05:30
3507	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.472995+05:30
3508	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 03d91c35: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:26.473507+05:30
3509	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.474061+05:30
3518	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch db022025: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.508956+05:30
3519	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.509382+05:30
3520	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch db022025: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.509756+05:30
3521	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.510117+05:30
3536	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794485486923	Batch 4e4df177: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.961038+05:30
3537	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794485486923 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.961538+05:30
3538	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794485486923	Batch 4e4df177: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.962007+05:30
3500	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 297b8ae3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.453948+05:30
3501	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.455897+05:30
3006	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 07037691: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.429384+05:30
3007	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.430069+05:30
3008	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 07037691: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.430743+05:30
3009	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.431478+05:30
3502	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 297b8ae3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.45664+05:30
3503	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.457322+05:30
3018	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 947eb08b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:05:41.474782+05:30
3019	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.47564+05:30
3020	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 947eb08b: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:05:41.476326+05:30
3021	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 17:05:41.477409+05:30
3512	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 770cc721: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.490307+05:30
3024	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 8c119a0b: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.771537+05:30
3025	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794483341640 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.771941+05:30
3026	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 8c119a0b: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:05:41.772346+05:30
3027	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794483341640 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:05:41.772728+05:30
3513	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.490968+05:30
3514	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 770cc721: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.491534+05:30
3036	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 8daabeb7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.235329+05:30
3037	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.236079+05:30
3038	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 8daabeb7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.236671+05:30
3039	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.237407+05:30
3515	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.492155+05:30
3042	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 387e6d8a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.264622+05:30
3043	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.265387+05:30
3044	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 387e6d8a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.265978+05:30
3045	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.266564+05:30
3524	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 6ccb91b9: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:26.522259+05:30
3048	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 31729f8e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.301565+05:30
3049	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.302291+05:30
3050	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 31729f8e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.302947+05:30
3051	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.303657+05:30
3525	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.523383+05:30
3526	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 6ccb91b9: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:41:26.524469+05:30
3054	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 0e962748: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.326183+05:30
3055	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.32697+05:30
3056	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 0e962748: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.328094+05:30
3057	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.330349+05:30
3527	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.52518+05:30
3066	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 75890fcb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.378981+05:30
3067	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.37985+05:30
3068	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 75890fcb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.380749+05:30
3069	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.3814+05:30
3078	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch a874c1ff: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:06.414809+05:30
3079	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.415403+05:30
3080	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch a874c1ff: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:06.415963+05:30
3530	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch ca506614: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.895695+05:30
3081	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 17:06:06.416527+05:30
3531	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794485486745 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.896272+05:30
3532	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch ca506614: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:41:26.896797+05:30
3533	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794485486745 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.897295+05:30
3712	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 438b037e: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:30.671862+05:30
3713	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794501750528 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:12:30.672733+05:30
3786	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch d58c9041: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:15:09.54273+05:30
3787	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:15:09.544848+05:30
3788	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch d58c9041: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:15:09.545757+05:30
3789	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:15:09.546682+05:30
3802	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 070a9727: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:16:39.696312+05:30
3803	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:16:39.698524+05:30
3804	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 070a9727: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:16:39.699533+05:30
3805	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:16:39.700272+05:30
3811	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:17:43.385892+05:30
3812	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch d0e9a32d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:17:43.386777+05:30
3813	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:17:43.38747+05:30
3814	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 3e8f7fe1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.674565+05:30
3815	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794502093557 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.677878+05:30
3816	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 3e8f7fe1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.679494+05:30
3817	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794502093557 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.681659+05:30
3820	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch a89327f7: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:13.722973+05:30
3821	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794502093557 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.72357+05:30
3539	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794485486923 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:41:26.962627+05:30
3060	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 3e7c530c: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:06.35093+05:30
3061	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.351526+05:30
3062	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 3e7c530c: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:06.352192+05:30
3063	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.35271+05:30
3722	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 6e87d94e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.566253+05:30
3072	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 7165d5e4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.400347+05:30
3073	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.40077+05:30
3074	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 7165d5e4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.401183+05:30
3075	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.40163+05:30
3723	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794501770437 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.586796+05:30
3724	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 6e87d94e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.587671+05:30
3084	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 5e2b044f: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.714261+05:30
3085	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794483366568 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.714704+05:30
3086	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 5e2b044f: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.71512+05:30
3087	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794483366568 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.715547+05:30
3725	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794501770437 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.588518+05:30
3090	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794483366759	Batch ad00b8a9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.797292+05:30
3091	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794483366759 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.797777+05:30
3092	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794483366759	Batch ad00b8a9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:06.798235+05:30
3093	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794483366759 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:06.79877+05:30
3094	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch a4eea7db: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.367767+05:30
3095	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794483381130 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.370602+05:30
3728	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch fd0da3eb: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:50.634684+05:30
3098	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch a4eea7db: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.374673+05:30
3099	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794483381130 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.376052+05:30
3100	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 2222b90c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:21.422193+05:30
3101	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794483381130 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.42315+05:30
3729	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794501770437 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.635372+05:30
3730	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch fd0da3eb: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:50.636226+05:30
3104	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 2222b90c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:21.427672+05:30
3105	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794483381130 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.428835+05:30
3106	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch eee54964: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.496767+05:30
3107	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794483381462 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.497599+05:30
3731	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794501770437 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.637239+05:30
3110	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch eee54964: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.499912+05:30
3111	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794483381462 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.500522+05:30
3112	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch b093f944: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:21.534887+05:30
3113	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794483381525 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.535391+05:30
3542	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 64234990: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:08.850115+05:30
3543	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794501668702 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:08.870014+05:30
3116	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch b093f944: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:21.537016+05:30
3117	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794483381525 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.537751+05:30
3118	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 593d8b31: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:21.557198+05:30
3119	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794483381538 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.561024+05:30
3544	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 64234990: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:08.870948+05:30
3545	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794501668702 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:08.872348+05:30
3122	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 593d8b31: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:21.563548+05:30
3123	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794483381538 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.56403+05:30
3124	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 0d7adb5e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:21.581717+05:30
3125	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794483381130 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.582309+05:30
3128	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 0d7adb5e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:21.583921+05:30
3129	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794483381130 | 0 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.584748+05:30
3130	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch bdb2fcee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.608819+05:30
3131	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794483381591 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.610119+05:30
3548	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 292f7fac: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:08.917534+05:30
3549	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794501668702 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:11:08.918331+05:30
3134	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch bdb2fcee: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.613088+05:30
3135	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794483381591 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.613696+05:30
3136	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch eb3a9307: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.62466+05:30
3137	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794483381613 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.625838+05:30
3550	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 292f7fac: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:08.919033+05:30
3551	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794501668702 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:11:08.9198+05:30
3140	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch eb3a9307: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.629097+05:30
3141	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794483381613 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.629667+05:30
3142	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 01904c0c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.660197+05:30
3143	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794483381642 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.661052+05:30
3146	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 01904c0c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.662844+05:30
3147	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794483381642 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.663332+05:30
3148	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 01904c0c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.675046+05:30
3149	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794483381662 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.675675+05:30
3554	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 62744570: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:08.971073+05:30
3555	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794501668937 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:08.97191+05:30
3152	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 01904c0c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:21.67722+05:30
3153	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794483381662 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:21.677778+05:30
3154	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 7b0806a2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.538237+05:30
3155	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.541955+05:30
3556	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 62744570: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:08.973095+05:30
3557	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794501668937 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:08.973934+05:30
3158	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 7b0806a2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.549318+05:30
3159	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.55123+05:30
3160	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch d85179e7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.604636+05:30
3161	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.605591+05:30
3164	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch d85179e7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.607997+05:30
3165	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.608761+05:30
3166	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 74acd8c2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.678937+05:30
3167	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.683355+05:30
3560	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch ab72cf9e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:09.00385+05:30
3561	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794501668985 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.004528+05:30
3170	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 74acd8c2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.686895+05:30
3171	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.687899+05:30
3172	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch a5d018ef: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.702099+05:30
3173	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.703169+05:30
3562	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch ab72cf9e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:09.005313+05:30
3563	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794501668985 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.006093+05:30
3176	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch a5d018ef: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.706886+05:30
3177	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.707866+05:30
3178	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 81cc8a65: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:23.745714+05:30
3179	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.747145+05:30
3182	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 81cc8a65: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:23.750187+05:30
3183	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.751185+05:30
3184	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch d476143c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.771372+05:30
3185	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.773019+05:30
3572	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 42691d88: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:09.052512+05:30
3573	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794501668702 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.053379+05:30
3188	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch d476143c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.776279+05:30
3189	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.777175+05:30
3190	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch ec1fbb0d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.800107+05:30
3191	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.800909+05:30
3574	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 42691d88: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:09.054214+05:30
3575	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794501668702 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.055065+05:30
3194	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch ec1fbb0d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:23.803186+05:30
3195	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.804123+05:30
3202	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 0bb488bf: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:24.249659+05:30
3203	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794483384040 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:06:24.251132+05:30
3566	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 117542d0: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:09.029157+05:30
3567	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794501668999 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.031758+05:30
3206	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 0bb488bf: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:24.255024+05:30
3207	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794483384040 | 20 drafts created	\N	\N	\N	f	2026-11-12 17:06:24.256234+05:30
3568	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 117542d0: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:11:09.032639+05:30
3569	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794501668999 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.033649+05:30
3578	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 8542117c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:09.079805+05:30
3579	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794501669054 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.080584+05:30
3580	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 8542117c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:09.081575+05:30
3581	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794501669054 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.082395+05:30
3584	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 4bf4a748: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:09.097625+05:30
3585	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794501669075 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.098543+05:30
3586	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 4bf4a748: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:09.099449+05:30
3587	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794501669075 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.100264+05:30
3596	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 77ddfd2c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:09.147551+05:30
3597	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794501669124 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.148452+05:30
3598	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 77ddfd2c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:09.149303+05:30
3599	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794501669124 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.150171+05:30
3734	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 839f1420: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.705893+05:30
3735	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794501770675 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.706829+05:30
3736	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 839f1420: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.707553+05:30
3737	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794501770675 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.708247+05:30
3746	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch b8b65940: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:50.76837+05:30
3747	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794501770747 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.769204+05:30
3748	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch b8b65940: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:50.769894+05:30
3749	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794501770747 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.770713+05:30
3196	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 0221f9c5: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:23.828747+05:30
3197	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 17:06:23.831499+05:30
3200	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 0221f9c5: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 17:06:23.837892+05:30
3590	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 77ddfd2c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:09.129164+05:30
3201	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 17:06:23.839717+05:30
3208	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794483384313	Batch 9af3a02f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:24.367737+05:30
3209	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794483384313 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:24.368743+05:30
3591	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794501669103 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.130041+05:30
3592	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 77ddfd2c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:11:09.130966+05:30
3212	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794483384313	Batch 9af3a02f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 17:06:24.371233+05:30
3213	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794483384313 | 1 drafts created	\N	\N	\N	f	2026-11-12 17:06:24.372169+05:30
3593	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794501669103 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:11:09.131767+05:30
3740	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 9a9b7fa8: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:50.745427+05:30
3741	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794501770720 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.748879+05:30
3742	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 9a9b7fa8: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:50.749765+05:30
3743	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794501770720 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.750633+05:30
3752	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch cf37e161: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:50.790615+05:30
3753	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794501770437 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.79165+05:30
3754	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch cf37e161: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:12:50.792573+05:30
3755	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794501770437 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.793266+05:30
3770	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch ac6c0d3e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.868949+05:30
3771	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794501770846 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.869534+05:30
3772	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch ac6c0d3e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:12:50.870014+05:30
3773	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794501770846 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:12:50.870478+05:30
3790	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch bec121c3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:16:03.334222+05:30
3791	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:16:03.337079+05:30
3792	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch bec121c3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:16:03.338195+05:30
3793	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:16:03.339141+05:30
3806	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch 6d57973d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:17:43.347992+05:30
3807	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:17:43.350103+05:30
3808	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch 6d57973d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:17:43.350745+05:30
3822	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch a89327f7: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:13.724144+05:30
3823	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794502093557 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.725514+05:30
3826	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch d9a24e17: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.796663+05:30
3827	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794502093766 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.798299+05:30
3828	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch d9a24e17: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.799318+05:30
3829	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794502093766 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.800182+05:30
3832	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch b0661918: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:13.851096+05:30
3833	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794502093823 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.853313+05:30
3834	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch b0661918: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:13.85447+05:30
3835	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794502093823 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.855096+05:30
3838	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 81591490: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:13.866594+05:30
3839	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794502093857 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.867232+05:30
3840	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 81591490: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:13.867917+05:30
3841	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794502093857 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.868857+05:30
3844	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch b34e58c0: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:13.889565+05:30
3845	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794502093557 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.89058+05:30
3846	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch b34e58c0: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:13.89125+05:30
3847	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794502093557 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.891985+05:30
3850	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch f6e0a5ba: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.918777+05:30
3851	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794502093902 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.919441+05:30
3852	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch f6e0a5ba: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.920093+05:30
3853	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794502093902 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.920789+05:30
3856	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch db2af1db: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.938076+05:30
3857	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794502093924 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.93888+05:30
3858	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch db2af1db: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.939492+05:30
3859	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794502093924 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.940345+05:30
3862	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch f89b093b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.973921+05:30
3863	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794502093957 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.97469+05:30
3864	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch f89b093b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.975531+05:30
3865	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794502093957 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.976031+05:30
3868	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch f89b093b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.992028+05:30
3869	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794502093978 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.993978+05:30
3870	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch f89b093b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:13.995142+05:30
3871	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794502093978 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:13.996908+05:30
3874	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 8f067c29: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:15.918122+05:30
3875	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:15.92076+05:30
3876	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 8f067c29: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:15.921936+05:30
3877	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:15.922891+05:30
3880	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 0723d159: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:15.956279+05:30
3881	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:15.957219+05:30
3882	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 0723d159: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:15.958156+05:30
3883	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:15.959469+05:30
3886	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 1c331ecc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:15.993365+05:30
3887	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:15.995137+05:30
3888	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 1c331ecc: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:15.996046+05:30
3889	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:15.996768+05:30
3892	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 37274569: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:16.017451+05:30
3893	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.019794+05:30
3894	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 37274569: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:16.020613+05:30
3895	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.021289+05:30
3898	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch f24ebd27: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:16.051007+05:30
3899	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.051762+05:30
3900	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch f24ebd27: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:16.052322+05:30
3901	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.052881+05:30
3904	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 384239c6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:16.072587+05:30
3905	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.073175+05:30
3906	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 384239c6: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:16.073725+05:30
3907	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.074358+05:30
3910	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 9d1355e5: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:16.089847+05:30
3911	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.090485+05:30
3912	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 9d1355e5: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:16.091468+05:30
3913	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.092778+05:30
3922	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch d3850700: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:16.498557+05:30
3923	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794502096337 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.500092+05:30
3924	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch d3850700: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:16.501222+05:30
3925	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794502096337 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.502816+05:30
3916	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 937360a0: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:16.105973+05:30
3917	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.106798+05:30
3918	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 937360a0: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:18:16.107513+05:30
3919	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.1084+05:30
3928	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794502096537	Batch 88891d48: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:16.589691+05:30
3929	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794502096537 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.590647+05:30
3930	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794502096537	Batch 88891d48: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:16.591451+05:30
3931	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794502096537 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:16.592455+05:30
3934	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch 20fe9404: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:18.91632+05:30
3935	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:18.918563+05:30
3936	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch 20fe9404: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:18.91933+05:30
3937	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:18.920234+05:30
3938	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 1272fe7e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:18.963637+05:30
3939	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:18.965619+05:30
3940	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 1272fe7e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:18:18.966541+05:30
3941	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:18:18.967299+05:30
3942	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 8635fee5: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.64164+05:30
3943	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794502220495 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.657376+05:30
3944	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 8635fee5: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.658408+05:30
3945	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794502220495 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.660468+05:30
3948	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch ddd6da62: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:20.714522+05:30
3949	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794502220495 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.715063+05:30
3950	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch ddd6da62: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:20.715552+05:30
3951	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794502220495 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.716253+05:30
3954	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch d14998e5: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.780556+05:30
3955	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794502220744 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.781364+05:30
3956	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch d14998e5: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.782647+05:30
3957	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794502220744 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.783443+05:30
3960	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 3b46ab38: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:20.823621+05:30
3961	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794502220797 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.826792+05:30
3962	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 3b46ab38: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:20.829334+05:30
3963	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794502220797 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.830558+05:30
3972	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 737c2a70: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:20.870086+05:30
3973	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794502220495 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.870754+05:30
3974	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 737c2a70: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:20.871288+05:30
3975	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794502220495 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.871762+05:30
3990	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 324445e1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.949313+05:30
3991	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794502220925 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.949986+05:30
3992	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 324445e1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.950785+05:30
3993	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794502220925 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.951419+05:30
3966	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 0147dd21: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:20.845645+05:30
3967	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794502220827 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.84652+05:30
3968	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 0147dd21: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:20.847312+05:30
3969	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794502220827 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.848242+05:30
3978	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 35c538a9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.894105+05:30
3979	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794502220874 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.89606+05:30
3980	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 35c538a9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.897092+05:30
3981	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794502220874 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.897715+05:30
3984	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch bc49017a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.913852+05:30
3985	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794502220893 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.914515+05:30
3986	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch bc49017a: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.915113+05:30
3987	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794502220893 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.915632+05:30
3996	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 324445e1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.966214+05:30
3997	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794502220945 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.96682+05:30
3998	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 324445e1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:20.967469+05:30
3999	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794502220945 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:20.968061+05:30
4002	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch b210dc94: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.771101+05:30
4003	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.774944+05:30
4004	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch b210dc94: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.777048+05:30
4005	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.77824+05:30
4008	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 38008852: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.812882+05:30
4009	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.814083+05:30
4010	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 38008852: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.815083+05:30
4011	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.815898+05:30
4014	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 3ced8c95: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.850663+05:30
4015	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.851416+05:30
4016	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 3ced8c95: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.852238+05:30
4017	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.852915+05:30
4020	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d6cd8da4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.875009+05:30
4021	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.879066+05:30
4022	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch d6cd8da4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.880153+05:30
4023	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.881093+05:30
4026	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 8b1feccc: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:22.901127+05:30
4027	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.901655+05:30
4028	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 8b1feccc: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:22.902179+05:30
4029	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.902664+05:30
4032	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 0b6dcc83: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.923343+05:30
4033	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.924585+05:30
4034	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 0b6dcc83: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.926843+05:30
4035	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.927851+05:30
4038	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 47801f12: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.950859+05:30
4039	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.951424+05:30
4040	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 47801f12: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:22.951903+05:30
4041	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.952338+05:30
4044	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch af80313d: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:22.963991+05:30
4045	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.964565+05:30
4046	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch af80313d: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:20:22.965167+05:30
4047	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:20:22.965831+05:30
4050	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 0df65704: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:23.319536+05:30
4051	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794502223206 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:20:23.320468+05:30
4052	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 0df65704: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:23.321227+05:30
4053	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794502223206 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:20:23.321975+05:30
4056	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794502223358	Batch ca514b16: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:23.399219+05:30
4057	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794502223358 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:23.400149+05:30
4058	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794502223358	Batch ca514b16: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:23.401133+05:30
4101	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794503184165 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.200007+05:30
4102	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 20b9577d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.201526+05:30
4103	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794503184165 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.2031+05:30
4106	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch c5cc1507: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:24.24465+05:30
4107	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794503184223 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.246169+05:30
4108	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch c5cc1507: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:24.246757+05:30
4109	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794503184223 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.247265+05:30
4112	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 7a556301: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:24.256895+05:30
4113	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794503184246 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.257583+05:30
4114	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch 7a556301: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:24.258074+05:30
4059	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794502223358 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:23.402046+05:30
4062	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch d93772f0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:25.764937+05:30
4063	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:25.768018+05:30
4064	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch d93772f0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:25.76899+05:30
4065	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:25.769819+05:30
4066	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 125ebe01: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:25.815834+05:30
4067	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:25.818363+05:30
4068	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 125ebe01: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:20:25.819679+05:30
4069	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:20:25.82085+05:30
4070	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_DRAFT_TEST	Batch 24a29f7f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:11.042673+05:30
4071	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Draft Test Company	Campaign: CAMP_DRAFT_TEST | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:11.081652+05:30
4072	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_DRAFT_TEST	Batch 24a29f7f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:11.08591+05:30
4073	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Draft Test Company	Campaign: CAMP_DRAFT_TEST | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:11.08698+05:30
4074	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Single Draft Company	Batch 141991cb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:11.130497+05:30
4075	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Single Draft Company	Campaign: CAMP_SINGLE_DRAFT | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:11.132829+05:30
4076	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Single Draft Company	Batch 141991cb: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:11.133846+05:30
4077	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Single Draft Company	Campaign: CAMP_SINGLE_DRAFT | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:11.134897+05:30
4078	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch 5b1f1149: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:11.19424+05:30
4079	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:11.195294+05:30
4080	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch 5b1f1149: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:11.196305+05:30
4081	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:11.1973+05:30
4082	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch ace30278: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:11.214037+05:30
4083	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:11.215108+05:30
4084	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch ace30278: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:11.215987+05:30
4085	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:11.216826+05:30
4088	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 13389b0d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.088155+05:30
4089	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794503183880 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.089103+05:30
4090	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 13389b0d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.090287+05:30
4091	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794503183880 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.091249+05:30
4094	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch bc23255a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:24.137191+05:30
4095	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794503183880 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.138097+05:30
4096	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch bc23255a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:24.138897+05:30
4097	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794503183880 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.139798+05:30
4100	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 20b9577d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.199039+05:30
4115	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794503184246 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.258626+05:30
4124	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 8716fd4d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.297852+05:30
4125	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794503184281 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.298476+05:30
4126	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 8716fd4d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.299068+05:30
4127	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794503184281 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.29959+05:30
4130	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch df4a8a7e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.31313+05:30
4131	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794503184298 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.314054+05:30
4132	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch df4a8a7e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.314735+05:30
4133	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794503184298 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.315293+05:30
4142	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 77615877: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.37802+05:30
4143	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794503184360 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.379058+05:30
4144	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 77615877: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.379756+05:30
4145	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794503184360 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.380809+05:30
4118	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 829a8598: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:24.27733+05:30
4119	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794503183880 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.278144+05:30
4120	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch 829a8598: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:24.279101+05:30
4121	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794503183880 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.279689+05:30
4136	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 77615877: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.358162+05:30
4137	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794503184326 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.359113+05:30
4138	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 77615877: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:24.360365+05:30
4139	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794503184326 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:24.361437+05:30
4148	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 4013b0b0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:25.955323+05:30
4149	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:25.956225+05:30
4150	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch 4013b0b0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:25.957076+05:30
4151	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:25.957922+05:30
4154	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 1f685e01: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:25.985192+05:30
4155	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:25.98583+05:30
4156	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 1f685e01: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:25.986513+05:30
4157	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:25.987156+05:30
4160	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch c0d4a25d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.01678+05:30
4161	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.017556+05:30
4162	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch c0d4a25d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.01822+05:30
4163	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.018851+05:30
4166	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch a3b52688: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.041992+05:30
4167	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.043099+05:30
4168	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch a3b52688: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.044587+05:30
4169	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.045401+05:30
4172	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 42a73c07: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:26.060613+05:30
4173	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.061281+05:30
4174	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 42a73c07: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:26.063148+05:30
4175	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.063738+05:30
4178	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch dc277972: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.082183+05:30
4179	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.082811+05:30
4180	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch dc277972: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.083685+05:30
4181	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.084374+05:30
4190	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 0f737d68: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:26.11633+05:30
4191	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.116941+05:30
4192	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 0f737d68: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:26.117464+05:30
4193	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 22:36:26.117993+05:30
4196	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch cae73614: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.433863+05:30
4197	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794503186302 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.434513+05:30
4198	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch cae73614: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.435137+05:30
4199	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794503186302 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.435647+05:30
4202	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794503186452	Batch f8035bb9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.499517+05:30
4203	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794503186452 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.500216+05:30
4204	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794503186452	Batch f8035bb9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.50089+05:30
4205	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794503186452 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.501573+05:30
4184	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 9a1cd213: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.103317+05:30
4185	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.103793+05:30
4186	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch 9a1cd213: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:26.104355+05:30
4187	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:26.104999+05:30
4206	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_DRAFT_TEST	Batch 603fcb76: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:28.387729+05:30
4207	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Draft Test Company	Campaign: CAMP_DRAFT_TEST | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:28.391302+05:30
4208	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_DRAFT_TEST	Batch 603fcb76: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:28.392083+05:30
4209	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Draft Test Company	Campaign: CAMP_DRAFT_TEST | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:28.392611+05:30
4210	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Single Draft Company	Batch e9f1f657: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:28.441535+05:30
4211	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Single Draft Company	Campaign: CAMP_SINGLE_DRAFT | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:28.443662+05:30
4212	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Single Draft Company	Batch e9f1f657: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:28.444433+05:30
4213	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Single Draft Company	Campaign: CAMP_SINGLE_DRAFT | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:28.445098+05:30
4214	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch dea43ab4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:28.487062+05:30
4215	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:28.48787+05:30
4216	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch dea43ab4: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:28.489727+05:30
4217	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:28.491527+05:30
4218	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 20560c98: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:28.502727+05:30
4219	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:28.503224+05:30
4220	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 20560c98: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:36:28.503753+05:30
4221	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:36:28.504326+05:30
4222	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: c1	Batch 629edb6c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:51.54816+05:30
4223	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Corp	Campaign: c1 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:51.551778+05:30
4224	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: c1	Batch 629edb6c: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:51.553981+05:30
4225	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Corp	Campaign: c1 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:51.554627+05:30
4226	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: c1	Batch 5d8a3a47: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:51.571362+05:30
4227	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Corp	Campaign: c1 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:51.573308+05:30
4228	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: c1	Batch 5d8a3a47: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:36:51.57401+05:30
4229	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Corp	Campaign: c1 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:36:51.574773+05:30
4232	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 0ac56f26: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.545997+05:30
4233	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794503329355 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.547002+05:30
4234	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 0ac56f26: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.548003+05:30
4235	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794503329355 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.54899+05:30
4238	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 8c33d83e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:49.582387+05:30
4239	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794503329355 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.5829+05:30
4240	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch 8c33d83e: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:49.583548+05:30
4241	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794503329355 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.584004+05:30
4244	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 6e747f35: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.63692+05:30
4245	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794503329607 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.637822+05:30
4246	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 6e747f35: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.638782+05:30
4247	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794503329607 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.639507+05:30
4250	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 76a4f3d6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:49.678836+05:30
4251	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794503329657 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.679782+05:30
4252	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 76a4f3d6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:49.680779+05:30
4253	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794503329657 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.68154+05:30
4256	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch cbe792bb: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:49.693269+05:30
4257	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794503329681 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.694095+05:30
4258	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch cbe792bb: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:49.694806+05:30
4259	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794503329681 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.69564+05:30
4262	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch ee765bab: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:49.713508+05:30
4263	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794503329355 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.714085+05:30
4264	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch ee765bab: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:49.714678+05:30
4265	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794503329355 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.715309+05:30
4268	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 53c9e460: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.73161+05:30
4269	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794503329718 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.732176+05:30
4270	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 53c9e460: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.732637+05:30
4271	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794503329718 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.733041+05:30
4274	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 481c91ef: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.743498+05:30
4275	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794503329732 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.744155+05:30
4276	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 481c91ef: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.744854+05:30
4277	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794503329732 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.745488+05:30
4280	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch ee530239: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.773389+05:30
4281	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794503329756 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.77387+05:30
4282	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch ee530239: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.774266+05:30
4283	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794503329756 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.7746+05:30
4286	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch ee530239: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.800609+05:30
4287	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794503329773 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.801353+05:30
4288	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch ee530239: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:49.801866+05:30
4289	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794503329773 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:49.802354+05:30
4290	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch da8e6ee9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.439093+05:30
4291	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.442905+05:30
4294	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch da8e6ee9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.445809+05:30
4295	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.446682+05:30
4296	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch b28be115: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.469192+05:30
4297	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.469969+05:30
4300	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch b28be115: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.472602+05:30
4301	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.473807+05:30
4302	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch c7ff363b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.499365+05:30
4303	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.500391+05:30
4306	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch c7ff363b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.502973+05:30
4307	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.503804+05:30
4308	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch de18e497: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.522155+05:30
4309	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.524438+05:30
4312	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch de18e497: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.528376+05:30
4313	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.529798+05:30
4314	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 6eb3d898: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:51.550774+05:30
4315	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.551517+05:30
4318	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch 6eb3d898: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:51.553645+05:30
4319	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.554302+05:30
4320	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch fb94031e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.57366+05:30
4321	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.574824+05:30
4324	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch fb94031e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.577298+05:30
4325	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.578025+05:30
4326	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch c0b101f3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.596121+05:30
4327	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.597071+05:30
4330	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch c0b101f3: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.599077+05:30
4331	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.599866+05:30
4344	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794503331938	Batch b3e269b7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.96381+05:30
4345	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794503331938 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.964362+05:30
4348	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794503331938	Batch b3e269b7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.965657+05:30
4349	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794503331938 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.966055+05:30
4332	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 180119f5: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:51.609067+05:30
4333	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.609792+05:30
4336	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 180119f5: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:38:51.611319+05:30
4337	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 22:38:51.611697+05:30
4338	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 9e477105: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.90225+05:30
4339	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794503331794 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.903247+05:30
4342	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 9e477105: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:51.906222+05:30
4343	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794503331794 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:38:51.906953+05:30
4350	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_DRAFT_TEST	Batch 9950849f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:53.733936+05:30
4351	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Draft Test Company	Campaign: CAMP_DRAFT_TEST | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:53.737827+05:30
4352	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_DRAFT_TEST	Batch 9950849f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:53.739241+05:30
4353	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Draft Test Company	Campaign: CAMP_DRAFT_TEST | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:53.740325+05:30
4354	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Single Draft Company	Batch 2bc9f0f0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:53.78232+05:30
4355	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Single Draft Company	Campaign: CAMP_SINGLE_DRAFT | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:53.7847+05:30
4356	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Single Draft Company	Batch 2bc9f0f0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:53.785604+05:30
4357	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Single Draft Company	Campaign: CAMP_SINGLE_DRAFT | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:53.78746+05:30
4358	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch 9ac3f621: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:53.826236+05:30
4359	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:53.82683+05:30
4360	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch 9ac3f621: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:53.827558+05:30
4361	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:53.828276+05:30
4362	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 96064764: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:53.844091+05:30
4363	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:53.84497+05:30
4364	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 96064764: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:38:53.845838+05:30
4365	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:38:53.846601+05:30
4366	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 78b6a67c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:45.687145+05:30
4367	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794503445481 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.724985+05:30
4370	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Alpha Tech Corp	Batch 78b6a67c: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:45.728315+05:30
4371	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Alpha Tech Corp	Campaign: camp-1794503445481 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.729439+05:30
4372	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch c1e8402f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:45.772899+05:30
4373	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794503445481 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.773532+05:30
4376	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Duplicate Attempt Corp	Batch c1e8402f: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:45.775789+05:30
4377	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Duplicate Attempt Corp	Campaign: camp-1794503445481 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.776611+05:30
4378	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 0adfbd5f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:45.840751+05:30
4379	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794503445808 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.841939+05:30
4382	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Asset Claiming Corp	Batch 0adfbd5f: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:45.849242+05:30
4383	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Asset Claiming Corp	Campaign: camp-asset-1794503445808 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.850104+05:30
4384	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 2495cac6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:45.906148+05:30
4385	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794503445864 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.907753+05:30
4388	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Cross Tenant Theft Corp	Batch 2495cac6: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:45.909362+05:30
4389	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Cross Tenant Theft Corp	Campaign: camp-theft-1794503445864 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.909848+05:30
4390	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch ffa9ab37: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:45.939377+05:30
4391	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794503445911 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.939982+05:30
4394	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Nonexistent Asset Corp	Batch ffa9ab37: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:45.941986+05:30
4395	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Nonexistent Asset Corp	Campaign: camp-nonexist-1794503445911 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.942457+05:30
4396	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch a9d6df6a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:45.963084+05:30
4397	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794503445481 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.964015+05:30
4400	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rollback Corp	Batch a9d6df6a: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:45.966948+05:30
4401	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rollback Corp	Campaign: camp-1794503445481 | 0 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.968002+05:30
4402	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 353d97e2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:45.992477+05:30
4403	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794503445976 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.993347+05:30
4406	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Forced Draft Corp	Batch 353d97e2: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:45.996322+05:30
4407	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Forced Draft Corp	Campaign: camp-forced-1794503445976 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:45.997225+05:30
4408	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 396c29a7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:46.01513+05:30
4409	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794503446000 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:46.017139+05:30
4412	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Auto Published Corp	Batch 396c29a7: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:46.01986+05:30
4413	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Auto Published Corp	Campaign: camp-auto-1794503446000 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:46.02062+05:30
4414	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 525855e0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:46.071436+05:30
4415	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794503446053 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:46.072083+05:30
4418	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect One Corp	Batch 525855e0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:46.07395+05:30
4419	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect One Corp	Campaign: camp-batch-1794503446053 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:46.074395+05:30
4420	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 525855e0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:46.089652+05:30
4421	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794503446075 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:46.090489+05:30
4424	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Batch Prospect Two Corp	Batch 525855e0: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:46.092352+05:30
4425	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Batch Prospect Two Corp	Campaign: camp-batch-1794503446075 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:46.092761+05:30
4426	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch b72de6f9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:47.917101+05:30
4427	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:47.920808+05:30
4430	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Batch b72de6f9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:47.923933+05:30
4431	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Q4 Enterprise SaaS Campaign	Campaign: camp-q4-2026 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:47.924837+05:30
4432	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 66585194: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:47.955006+05:30
4433	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:47.955913+05:30
4436	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-idemp-test	Batch 66585194: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:47.960325+05:30
4437	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-idemp-test	Campaign: camp-idemp-test | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:47.961283+05:30
4438	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 7e158839: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:47.989903+05:30
4439	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:47.990857+05:30
4442	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch 7e158839: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:47.993459+05:30
4443	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:47.994299+05:30
4444	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch ca305878: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:48.014659+05:30
4445	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.017719+05:30
4448	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-dedupe-check	Batch ca305878: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:48.019485+05:30
4449	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-dedupe-check	Campaign: camp-dedupe-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.020306+05:30
4450	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch b315a5c1: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:48.037994+05:30
4451	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.03873+05:30
4454	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-partial-check	Batch b315a5c1: 1 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:48.040473+05:30
4455	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-partial-check	Campaign: camp-partial-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.041081+05:30
4456	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 4385a477: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:48.059784+05:30
4457	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.060576+05:30
4460	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-downgrade-check	Batch 4385a477: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:48.064149+05:30
4461	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-downgrade-check	Campaign: camp-downgrade-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.065224+05:30
4462	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch f2897e8e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:48.080478+05:30
4463	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.08126+05:30
4466	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-autopub-check	Batch f2897e8e: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:48.083159+05:30
4467	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-autopub-check	Campaign: camp-autopub-check | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.084212+05:30
4480	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794503448449	Batch fdc261a1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:48.503149+05:30
4481	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794503448449 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.504561+05:30
4484	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-parity-1794503448449	Batch fdc261a1: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:48.506409+05:30
4485	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Parity Global Technologies	Campaign: camp-parity-1794503448449 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.507008+05:30
4468	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 8b1be472: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:48.097441+05:30
4469	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.098778+05:30
4472	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: camp-ssrf-check	Batch 8b1be472: 0 drafts ready for review (1 failed).	\N	\N	\N	f	2026-11-12 22:40:48.10316+05:30
4473	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: camp-ssrf-check	Campaign: camp-ssrf-check | 0 drafts created	\N	\N	\N	t	2026-11-12 22:40:48.104187+05:30
4474	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 24942ca6: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:48.411529+05:30
4475	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794503448297 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.412359+05:30
4478	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Rapid Scale Ingestion Test	Batch 24942ca6: 20 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:48.414935+05:30
4479	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Rapid Scale Ingestion Test	Campaign: camp-rapid-1794503448297 | 20 drafts created	\N	\N	\N	f	2026-11-12 22:40:48.415718+05:30
4486	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_DRAFT_TEST	Batch 94f367fd: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:50.417383+05:30
4487	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Draft Test Company	Campaign: CAMP_DRAFT_TEST | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:50.42066+05:30
4488	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_DRAFT_TEST	Batch 94f367fd: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:50.421945+05:30
4489	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Draft Test Company	Campaign: CAMP_DRAFT_TEST | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:50.422867+05:30
4490	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Single Draft Company	Batch cc2f160d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:50.478873+05:30
4491	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Single Draft Company	Campaign: CAMP_SINGLE_DRAFT | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:50.482131+05:30
4492	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: Single Draft Company	Batch cc2f160d: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:50.483272+05:30
4493	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Single Draft Company	Campaign: CAMP_SINGLE_DRAFT | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:50.484361+05:30
4494	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch 59410ff9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:50.538157+05:30
4495	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:50.539357+05:30
4496	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_1	Batch 59410ff9: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:50.540429+05:30
4497	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Primary Co	Campaign: CAMP_FINAL_1 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:50.541405+05:30
4498	1	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 1656b46b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:50.560826+05:30
4499	1	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:50.561882+05:30
4500	39	INTEGRATION_BATCH_CREATED	New campaign pushed from DizitalGini: CAMP_FINAL_2	Batch 1656b46b: 1 drafts ready for review (0 failed).	\N	\N	\N	f	2026-11-12 22:40:50.56293+05:30
4501	39	INTEGRATION_PROSPECT_CREATED	New prospect pushed from DizitalGini: Final Pass Alias Co	Campaign: CAMP_FINAL_2 | 1 drafts created	\N	\N	\N	f	2026-11-12 22:40:50.563883+05:30
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, invoice_number, request_id, user_id, company_id, amount, currency, status, payment_method, paid_at, created_at, updated_at, gateway, gateway_order_id, gateway_payment_id, gateway_signature, metadata) FROM stdin;
31	INV-2026-1001	203	93	56	224.00	INR	PAID	Razorpay (UPI / Card / NetBanking)	2026-10-22 12:49:32.214+05:30	2026-10-22 12:49:32.214+05:30	2026-11-12 17:17:22.135852+05:30	RAZORPAY	\N	pay_prod_75x738y2	\N	{"bankRrn": "629631753801", "gstRate": 18, "taxType": "GST (18%)", "priceUsd": 2, "utrNumber": "UTR-2026-753801", "isSimulated": false, "exchangeRate": 94.9, "gstAmountInr": 34, "baseAmountInr": 190, "totalAmountInr": 224}
32	INV-2026-1002	204	93	56	11198.00	INR	PAID	Razorpay (UPI / Card / NetBanking)	2026-10-22 12:50:13.449+05:30	2026-10-22 12:50:13.449+05:30	2026-11-12 17:17:22.137415+05:30	RAZORPAY	\N	pay_prod_iyqy76w9	\N	{"bankRrn": "629631892411", "gstRate": 18, "taxType": "GST (18%)", "priceUsd": 100, "utrNumber": "UTR-2026-892411", "isSimulated": false, "exchangeRate": 94.9, "gstAmountInr": 1708, "baseAmountInr": 9490, "totalAmountInr": 11198}
33	INV-2026-1004	206	93	56	224.00	INR	PAID	Razorpay (UPI / Card / NetBanking)	2026-10-22 15:41:34.151+05:30	2026-10-22 15:41:34.151+05:30	2026-11-12 17:17:22.138626+05:30	RAZORPAY	\N	pay_prod_23p7ed5z	\N	{"bankRrn": "629631237190", "gstRate": 18, "taxType": "GST (18%)", "priceUsd": 2, "utrNumber": "UTR-2026-237190", "isSimulated": false, "exchangeRate": 94.9, "gstAmountInr": 34, "baseAmountInr": 190, "totalAmountInr": 224}
34	INV-2026-1005	207	93	56	224.00	INR	PAID	Razorpay (UPI / Card / NetBanking)	2026-10-22 15:42:23.831+05:30	2026-10-22 15:42:23.831+05:30	2026-11-12 17:17:22.139679+05:30	RAZORPAY	\N	pay_prod_uhn8itkt	\N	{"bankRrn": "629631664120", "gstRate": 18, "taxType": "GST (18%)", "priceUsd": 2, "utrNumber": "UTR-2026-664120", "isSimulated": false, "exchangeRate": 94.9, "gstAmountInr": 34, "baseAmountInr": 190, "totalAmountInr": 224}
38	INV-2026-1006	208	93	56	224.00	INR	PAID	Razorpay Live Checkout	2026-10-22 17:00:01.624+05:30	2026-10-23 14:59:45.972435+05:30	2026-11-12 17:17:22.140547+05:30	RAZORPAY	\N	pay_prod_k7m9p2x4	\N	{"bankRrn": "629631398214", "gstRate": 18, "taxType": "GST (18%)", "priceUsd": 2, "utrNumber": "UTR-2026-398214", "isSimulated": false, "exchangeRate": 94.9, "gstAmountInr": 34, "baseAmountInr": 190, "totalAmountInr": 224}
35	INV-2026-1007	209	93	56	112.00	INR	PAID	Razorpay Live Checkout	2026-10-23 11:34:20.906+05:30	2026-10-23 11:34:20.924322+05:30	2026-11-12 17:17:22.141502+05:30	RAZORPAY	\N	pay_prod_4n2v81q9	\N	{"bankRrn": "629631449182", "gstRate": 18, "taxType": "GST (18%)", "priceUsd": 1, "utrNumber": "UTR-2026-449182", "isSimulated": false, "exchangeRate": 94.9, "gstAmountInr": 17, "baseAmountInr": 95, "totalAmountInr": 112}
36	INV-2026-1008	210	93	56	112.00	INR	PAID	Razorpay Live Checkout	2026-10-23 11:34:20.982+05:30	2026-10-23 11:34:20.997779+05:30	2026-11-12 17:17:22.142336+05:30	RAZORPAY	\N	pay_prod_9w3r15t8	\N	{"bankRrn": "629631551029", "gstRate": 18, "taxType": "GST (18%)", "priceUsd": 1, "utrNumber": "UTR-2026-551029", "isSimulated": false, "exchangeRate": 94.9, "gstAmountInr": 17, "baseAmountInr": 95, "totalAmountInr": 112}
\.


--
-- Data for Name: public_sample_inquiries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.public_sample_inquiries (id, slug, company_name, sender_name, sender_email, message, status, super_admin_notified, app_email_notified, sender_notified, created_at) FROM stdin;
1	siift-ai	siift-ai	Akshay Deepak	akshay.m@datai2i.com	Hey Creativegini i'm intrested in your service	NEW	t	t	f	2026-10-12 18:35:27.759897+05:30
2	siift-ai	siift-ai	Akshay M	akshay.m@datai2i.com	Testing lead unlock inquiry	NEW	t	t	t	2026-10-12 18:37:04.419485+05:30
\.


--
-- Data for Name: public_sample_showcases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.public_sample_showcases (id, slug, title, company_name, description, logo_url, status, company_study, leads, lead_studies, pitch_deck, published_at, created_at, updated_at, logo_asset_key, source_platform, external_campaign_id, external_prospect_id, batch_id, created_by_email, outreach_mail_template, is_demo, view_count) FROM stdin;
8	finkr	Finkr - Practitioner-Led Fintech Consultancy & Venture Partner	Finkr	London-based, practitioner-led fintech consultancy and venture funding partner helping financial services and tech companies scale through strategy, product, and technology transformation.	https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://finkr.co.uk&size=128	PUBLISHED	{"hasPdf": true, "company": "Finkr", "website": "https://finkr.co.uk", "industry": "Fintech, Financial Services, Embedded Finance, WealthTech, Lending & Credit", "linkedin": "https://www.linkedin.com/company/finkr", "pdfAssetKey": "public-samples/finkr/company-study/9da37103-c463-48cb-a41b-2c3911a55e1e-Finkr_Dossier_Report.pdf", "pdfFileName": "Finkr - Company Study Report.pdf", "pdfFileSize": 449374, "pdfMimeType": "application/pdf", "marketPosition": "Practitioner-led approach with experts from top-tier banks (Deutsche Bank, HSBC) and core banking tech (Thought Machine). Integrated service model combining strategy, product, technology consulting, and venture funding. Key Competitors: McKinsey & Company (Fintech Practice), Deloitte (Financial Services), Thought Machine (Direct Tech/Consulting Competitor), Bain & Company (Fintech), KPMG (Financial Services Advisory). Finkr differentiates by offering 'practitioner-led' execution from former senior bankers and core banking technologists, combining strategic consulting with direct venture funding support, rather than acting as a distant advisory body.", "keyObservations": "#1 Access to senior practitioners from Deutsche Bank, HSBC, and Thought Machine for high-level expertise.\\n#2 End-to-end support from strategy and tech implementation to securing £5M+ in venture funding.\\n#3 Structured, results-driven approach that moves beyond advice to actual execution ('we make it happen').\\n#4 Bridging the knowledge gap with timely, expert-led training (Finkr Academy) for safe and efficient execution.\\n#5 Specialized focus on 'next-gen' fintech areas like AI in lending and embedded finance.", "businessOverview": "A comprehensive fintech transformation service offering strategy, product, and technology consulting alongside venture funding facilitation for financial services and tech companies. Leveraging experts from institutions like Deutsche Bank, HSBC, and Thought Machine, Finkr offers hands-on execution in areas such as embedded finance, core banking, and AI-driven lending. The firm also provides venture funding support to secure equity or debt for scaling businesses.", "potentialOpportunity": "The single best segment to target first is Series A/B fintech founders and CTOs in the UK and Nordics who are actively seeking to modernize their core banking infrastructure or secure their next round of funding. This segment aligns perfectly with Finkr's dual value proposition of technical execution (leveraging Thought Machine/Deutsche Bank expertise) and venture funding access, addressing the most critical pain points for scaling fintechs."}	[{"id": "lead-finkr-1", "logo": "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://finkr.co.uk&size=128", "name": "Scaling Fintech Founder", "email": "contact@finkr.co.uk", "phone": "+44 20 7946 0912", "title": "Chief Executive Officer & Founder", "company": "Finkr (Scaling Fintech)", "industry": "Fintech, Financial Services, Embedded Finance", "location": "London, United Kingdom", "leadStudy": {"whyRelevant": "Direct budget authority looking for practitioner-led execution over generic consulting.", "observedContext": "Active funding cycle with pressing technical transformation requirements.", "suggestedApproach": "Lead with former Deutsche Bank & Thought Machine pedigree and verified funding access.", "potentialOpportunity": "High-impact advisory and engineering engagement for core banking modernisation."}, "isUnlocked": true, "companyLink": "https://finkr.co.uk", "aboutCompany": "Fintech scale-up navigating Series A/B expansion across the UK & Nordics.", "shortSummary": "Needs technical guidance to modernize core banking and access to investors to secure £5M+ venture funding.", "whySuitsBest": "Needs both technical guidance to modernize core banking and access to investors to secure the next round of funding. Pain point: Struggling to balance technical debt (legacy core banking) with the pressure to raise capital and scale quickly."}, {"id": "lead-finkr-2", "logo": "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.thoughtmachine.net&size=128", "name": "Fintech CTO", "title": "Chief Technology Officer", "company": "Thought Machine", "industry": "Core Banking & Cloud Systems", "location": "London, United Kingdom", "leadStudy": {"whyRelevant": "Lead technical stakeholder vetting architecture and cloud-native core banking integrations.", "observedContext": "Undergoing major core banking upgrade to reduce technical debt.", "suggestedApproach": "Demonstrate deep architectural benchmarks and execution-first delivery.", "potentialOpportunity": "Hands-on implementation support leveraging Thought Machine senior engineers."}, "isUnlocked": false, "companyLink": "https://www.thoughtmachine.net", "maskedEmail": "••••••@thoughtmachine.net", "maskedPhone": "+44 (20) xxxxx", "aboutCompany": "Next-gen core banking technology platform providing cloud-native engines for leading financial institutions.", "shortSummary": "Requires expert technical advice on implementing next-gen core banking and AI-driven lending solutions.", "whySuitsBest": "Requires expert technical advice on implementing next-gen core banking and AI-driven lending solutions. Pain point: Lacks in-house expertise in complex core banking technologies (like Thought Machine) and AI integration for credit underwriting."}, {"id": "lead-finkr-3", "logo": "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.weavr.io&size=128", "name": "Embedded Finance Product Lead", "title": "Head of Product, Embedded Finance", "company": "Weavr (Embedded Banking)", "industry": "Embedded Finance & WealthTech", "location": "Stockholm, Sweden", "leadStudy": {"whyRelevant": "Product strategy leader launching regulated financial services products.", "observedContext": "Expanding into regulated payments and credit products.", "suggestedApproach": "Showcase compliance blueprints and modular banking integrations.", "potentialOpportunity": "End-to-end product architecture and regulatory structuring."}, "isUnlocked": false, "companyLink": "https://www.weavr.io", "maskedEmail": "••••••@weavr.io", "maskedPhone": "+46 (8) xxxxx", "aboutCompany": "Enterprise platform embedding compliant merchant banking, debit accounts, and payment rails directly into digital software.", "shortSummary": "Needs strategic and product consulting to integrate financial services into non-financial platforms.", "whySuitsBest": "Needs strategic and product consulting to integrate financial services into non-financial platforms. Pain point: Unclear on how to structure embedded finance offerings and navigate regulatory/compliance complexities while scaling."}, {"id": "lead-finkr-4", "logo": "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.oaknorth.co.uk&size=128", "name": "Head of AI Lending & Risk", "title": "VP, Credit Risk & AI Lending", "company": "OakNorth Bank", "industry": "Lending & Credit Underwriting", "location": "London, United Kingdom", "leadStudy": {"whyRelevant": "Risk and underwriting authority evaluating algorithmic debt models.", "observedContext": "Deploying automated real-time credit scoring infrastructure.", "suggestedApproach": "Lead with specialized expertise in next-gen credit underwriting and banking standards.", "potentialOpportunity": "Algorithm verification and AI-driven underwriting integration."}, "isUnlocked": false, "companyLink": "https://www.oaknorth.co.uk", "maskedEmail": "••••••@oaknorth.co.uk", "maskedPhone": "+44 (20) xxxxx", "aboutCompany": "Digital lending and credit intelligence platform providing customized commercial debt facilities for growth businesses.", "shortSummary": "Evaluating AI-driven credit underwriting algorithms and automated compliance systems.", "whySuitsBest": "Evaluating AI-driven credit underwriting algorithms and automated compliance systems for scaling enterprise debt facilities."}, {"id": "lead-finkr-5", "logo": "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://augmentum.vc&size=128", "name": "Fintech Venture Partner", "title": "Partner, Growth & Venture Funding", "company": "Augmentum Fintech", "industry": "Venture Capital & Debt Financing", "location": "London, United Kingdom", "leadStudy": {"whyRelevant": "Investment partner evaluating technical readiness of prospective portfolio investments.", "observedContext": "High-volume deal flow needing technical due diligence and execution support.", "suggestedApproach": "Highlight dual capability of strategic venture funding and hands-on core banking delivery.", "potentialOpportunity": "Co-investment structuring and technical advisory partner."}, "isUnlocked": false, "companyLink": "https://augmentum.vc", "maskedEmail": "••••••@augmentum.vc", "maskedPhone": "+44 (20) xxxxx", "aboutCompany": "Leading publicly listed fintech venture capital investor backing high-growth European fintech innovators.", "shortSummary": "Syndicating £5M+ venture funding rounds alongside technical transformation advisory.", "whySuitsBest": "Syndicating £5M+ venture funding rounds alongside technical transformation advisory for mid-market and Series A/B institutions."}]	[]	{}	2026-10-15 17:39:26.45742+05:30	2026-10-15 17:39:26.45742+05:30	2026-10-26 18:15:48.940874+05:30	\N	MANUAL	\N	\N	\N	\N	{}	f	0
4	r	fdss	rrr	vdvcdv	https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://rrr.com&size=128	PUBLISHED	{"company": "rrr", "industry": "Enterprise Software & Tech", "marketPosition": "", "keyObservations": "", "businessOverview": "", "potentialOpportunity": ""}	[{"id": "lead-1791462727987-1", "name": "Sarah Jenkins", "email": "s.jenkins@acmeglobal.com", "phone": "+1 (415) 890-2341", "title": "VP of Global Enterprise Architecture", "company": "Acme Global Systems", "linkedin": "https://linkedin.com/in/sarah-jenkins-sample", "leadStudy": {"whyRelevant": "Direct budget authority for integration and architecture overhaul.", "observedContext": "Recently published whitepaper on cloud modernization initiatives.", "suggestedApproach": "Highlight verifiable deliverable SLAs and technical speed.", "potentialOpportunity": "Ideal match for CreativeGini specialist deliverable engine."}, "aboutCompany": "Enterprise IT infrastructure provider serving Fortune 500 customers.", "whySuitsBest": "Leading multi-region platform migration with open Q3 procurement budget."}]	[]	{"title": "Enterprise Growth & Acceleration Playbook", "summary": "Targeted strategic deck prepared for client leadership."}	2026-10-08 18:02:45.51598+05:30	2026-10-08 18:02:45.51598+05:30	2026-10-22 13:21:16.277415+05:30	\N	MANUAL	\N	\N	\N	\N	{}	f	0
3	ftthtn	fdrth	fdbfdb	 v bgrga	https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://fdbfdb.com&size=128	PUBLISHED	{"company": "fdbfdb", "industry": "Enterprise Software & Tech", "marketPosition": "", "keyObservations": "", "businessOverview": "", "potentialOpportunity": ""}	[{"id": "lead-1791462521738-1", "name": "Sarah Jenkins", "email": "s.jenkins@acmeglobal.com", "phone": "+1 (415) 890-2341", "title": "VP of Global Enterprise Architecture", "company": "Acme Global Systems", "linkedin": "https://linkedin.com/in/sarah-jenkins-sample", "leadStudy": {"whyRelevant": "Direct budget authority for integration and architecture overhaul.", "observedContext": "Recently published whitepaper on cloud modernization initiatives.", "suggestedApproach": "Highlight verifiable deliverable SLAs and technical speed.", "potentialOpportunity": "Ideal match for CreativeGini specialist deliverable engine."}, "aboutCompany": "Enterprise IT infrastructure provider serving Fortune 500 customers.", "whySuitsBest": "Leading multi-region platform migration with open Q3 procurement budget."}]	[]	{"title": "Enterprise Growth & Acceleration Playbook", "summary": "Targeted strategic deck prepared for client leadership."}	2026-10-08 17:59:04.177977+05:30	2026-10-08 17:59:04.177977+05:30	2026-10-22 13:21:16.270139+05:30	\N	MANUAL	\N	\N	\N	\N	{}	f	0
1	data-i2i	Data I2I Intelligence & Growth Showcase	Data I2I	String ID test 1793018531763	https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://data-i2i.com&size=128	PUBLISHED	{"company": "Data I2I", "industry": "Enterprise Data Analytics & AI Consulting", "marketPosition": "Strong footprint across mid-market and enterprise fintech and healthtech sectors, competing with boutique data consultancies through rapid POC deployment models.", "keyObservations": "High enterprise demand for unified data lineage and governance; client decision-makers are actively consolidating fragmented ETL silos into modern lakehouse architectures.", "businessOverview": "Data I2I accelerates digital transformations by architecting unified analytics pipelines, modern data warehouses, and custom AI-driven business decision engines for Fortune 1000 enterprises.", "potentialOpportunity": "Position bespoke AI readiness assessments to CIOs and Heads of Data Engineering navigating enterprise data governance."}	[{"id": "sample-lead-1", "logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80", "name": "Sarah Jenkins", "title": "VP of Data Engineering & Cloud Architecture", "company": "Meridian Financial Systems", "industry": "Fintech & Banking", "location": "Boston, MA", "shortSummary": "Directs cloud infrastructure, enterprise warehouse migrations, and real-time transaction processing for North American banking operations."}, {"id": "sample-lead-2", "logo": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80", "name": "Marcus Vance", "title": "Chief Information Officer", "company": "Apex Global Logistics", "industry": "Logistics & Supply Chain", "location": "Dallas, TX", "shortSummary": "Spearheads operational tech stack modernization, AI route optimization, and legacy ERP system retirement across 42 logistics hubs."}, {"id": "sample-lead-3", "logo": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80", "name": "Elena Rostova", "title": "Head of Enterprise Analytics & BI", "company": "Novalis Health Sciences", "industry": "Healthcare & Life Sciences", "location": "San Francisco, CA", "shortSummary": "Oversees unified clinical data platforms, HIPAA-compliant predictive models, and self-service BI analytics delivery."}, {"id": "sample-lead-4", "logo": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80", "name": "David Thorne", "title": "Director of Customer Insights & Growth", "company": "Kinetix Retail Technologies", "industry": "Retail & E-Commerce", "location": "Chicago, IL", "shortSummary": "Leads omnichannel customer data integration, predictive lifetime value modeling, and personalization engines."}]	[{"id": "study-1", "role": "VP of Data Engineering & Cloud Architecture", "company": "Meridian Financial Systems", "leadName": "Sarah Jenkins", "whyRelevant": "Meridian recently initiated a 3-year cloud modernization sprint and is actively vetting specialized data architecture implementation partners.", "observedContext": "Currently reconciling dual legacy Teradata and Snowflake deployments across regional bank subsidiaries, resulting in cross-functional reporting bottlenecks.", "suggestedApproach": "Lead with peer financial case studies demonstrating automated compliance governance and zero-downtime warehouse cutovers.", "potentialOpportunity": "Propose a structured 6-week Data Architecture Review to audit pipelines, reduce query latency by 40%, and automate compliance monitoring."}]	{"id": "sample-pitch-deck-1", "title": "Data I2I Enterprise Intelligence & Growth Playbook", "summary": "Executive pitch deck showcasing tailored market positioning, ROI frameworks, technical architecture blueprints, and 90-day execution milestones.", "assetKey": "public-samples/data-i2i/4fcb33bd-629f-4cb8-82af-963d85fa8a90-Data_I2I_Enterprise_Growth_Playbook.pdf", "fileName": "Data_I2I_Enterprise_Growth_Playbook.pdf", "fileSize": 685, "mimeType": "application/pdf", "previewAvailable": true}	2026-10-08 14:08:51.639395+05:30	2026-10-08 14:08:51.639395+05:30	2026-10-26 18:15:48.995314+05:30	\N	MANUAL	\N	\N	\N	\N	{}	t	0
5	siift-ai	Intelligent Workflow Automation & Business Growth Blueprint	siift	An agentic AI operating system that helps founders and small teams research, validate, and automate business growth with a privacy-first, memory-driven approach.	https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://siift.ai&size=128	PUBLISHED	{"hasPdf": true, "pdfUrl": "/api/samples/siift-ai/company-study-pdf", "company": "siift", "industry": "SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing)", "pdfFileName": "SHIIDT COMPANYSTUDY.pdf", "marketPosition": "siift differentiates by offering a specialized, privacy-focused agentic OS for business building that provides structured, evidence-backed strategic guidance, rather than a general\\u0002purpose chatbot or unstructured note-taking tool.\\n\\nCOMPETITOR\\n\\n1.Notion AI \\n2.ChatGPT (OpenAI) \\n3.Perplexity AI \\n4.Gong (for sales/strategy insights) \\n5.Airtable (for structured business data)", "keyObservations": "1.Agentic AI Operating System: Unlike simple chatbots, siift acts as an OS that manages the entire business lifecycle from idea to growth.\\n\\n2.Intelligent Business Canvas: A visual, decision-ready framework that filters business ideas through practical lenses.\\n\\n3.Living Memory System: Scalable agentic memory that learns and evolves with the user's specific business context.\\n\\n4.Privacy-First Architecture: Explicitly states it does not use customer data to train external models, ensuring data security.\\n\\n5.Strategy as Moat: Focuses on out-thinking competition through disciplined, data-grounded guidance rather than out-spending them", "businessOverview": "siift is an agentic AI operating system designed to help individuals and small teams build businesses by researching ideas, validating opportunities, and automating\\ngrowth strategies. It positions itself as a 'strategy-first' tool that reduces market noise and provides evidence-backed decision-making for serious builders. The\\nplatform emphasizes privacy and democratizes entrepreneurial success by enabling high-efficiency business creation without requiring large corporate resources.", "potentialOpportunity": ""}	[{"id": "lead-1791806905615", "logo": "/api/samples/siift-ai/leads/lead-1791806905615/logo", "name": "gammaux", "email": "darmengola@gammaux.com", "title": "Key Executive", "company": "siift", "industry": "", "linkedin": "", "location": "", "leadStudy": {"whyRelevant": "Direct decision authority and strategic alignment.", "observedContext": "Observed growth and strategic expansion.", "suggestedApproach": "Lead with verifiable outcomes and SLA guarantees.", "potentialOpportunity": "High-probability engagement for specialized outsourced execution."}, "pitchDeck": {"title": "gammaux Proposal Pitch Deck", "summary": "Targeted strategic pitch deck prepared for client leadership.", "assetKey": "public-samples/siift-ai/leads/lead-1791806905615/pitch-deck/b9b3c8bd-abaf-4d08-97ab-cd3a1b677c1b-SHIFFT_1ST__Gammaux_PITCHDECK.pdf", "fileName": "SHIFFT 1ST  Gammaux PITCHDECK.pdf", "streamUrl": "/api/samples/siift-ai/leads/lead-1791806905615/pitch-deck", "downloadUrl": "/api/samples/siift-ai/leads/lead-1791806905615/pitch-deck?download=true"}, "isUnlocked": true, "companyLink": "https://gammaux.com/", "companyLogo": "/api/samples/siift-ai/leads/lead-1791806905615/logo", "maskedEmail": "da••••@gammaux.com", "maskedPhone": "+1 (•••) •••-••••", "aboutCompany": "Enterprise organization operating in SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing).", "leadStudyPdf": "/api/samples/siift-ai/leads/lead-1791806905615/lead-study-pdf", "logoAssetKey": "public-samples/siift-ai/leads/lead-1791806905615/logo/9a37f100-f735-4b2c-b288-6a677594f7e7-siift-ai_lead_lead-1791806905615_logo.png", "pitchDeckPdf": "/api/samples/siift-ai/leads/lead-1791806905615/pitch-deck", "shortSummary": "GammaUX is a Barcelona and Madrid-based UX and digital innovation consultancy that specializes in user experience design, user research, and digital talent acqu GammaUX leverages user research to drive innovation, but the volume of data and the need for privacy in client engagements can slow down strategic validation. Siift offers a privacy-first, agentic AI system that automates market research and structures strategic insights, allowing your team to focus on high-value UX design rather than data wrangling.", "whySuitsBest": "GammaUX is a Barcelona and Madrid-based UX and digital innovation consultancy that specializes in user experience design, user research, and digital talent acqu GammaUX leverages user research to drive innovation, but the volume of data and the need for privacy in client engagements can slow down strategic validation. Siift offers a privacy-first, agentic AI system that automates market research and structures strategic insights, allowing your team to focus on high-value UX design rather than data wrangling.", "leadStudyPdfName": "SHIIFT 1ST Gammaux LEADSTUDY.pdf", "pitchDeckPdfName": "SHIFFT 1ST  Gammaux PITCHDECK.pdf", "pitchDeckAssetKey": "public-samples/siift-ai/leads/lead-1791806905615/pitch-deck/b9b3c8bd-abaf-4d08-97ab-cd3a1b677c1b-SHIFFT_1ST__Gammaux_PITCHDECK.pdf", "leadStudyPdfAssetKey": "public-samples/siift-ai/leads/lead-1791806905615/lead-study/64b82b51-4665-40c6-9b82-02acba28c21a-SHIIFT_1ST_Gammaux_LEADSTUDY.pdf"}, {"id": "lead-1791806979127", "logo": "/api/samples/siift-ai/leads/lead-1791806979127/logo", "name": "bossinfo", "title": "Key Executive", "company": "siift", "industry": "", "linkedin": "", "location": "", "leadStudy": {"whyRelevant": "Direct decision authority and strategic alignment.", "observedContext": "Observed growth and strategic expansion.", "suggestedApproach": "Lead with verifiable outcomes and SLA guarantees.", "potentialOpportunity": "High-probability engagement for specialized outsourced execution."}, "pitchDeck": {"title": "bossinfo Proposal Pitch Deck", "summary": "Targeted strategic pitch deck prepared for client leadership.", "assetKey": "public-samples/siift-ai/leads/lead-1791806979127/pitch-deck/ea542bef-fefa-446d-8599-ccc0fe12e76d-SHIIFT_2ND_Bossinfo_PITCHDECK.pdf", "fileName": "SHIIFT 2ND Bossinfo PITCHDECK.pdf", "streamUrl": "/api/samples/siift-ai/leads/lead-1791806979127/pitch-deck", "downloadUrl": "/api/samples/siift-ai/leads/lead-1791806979127/pitch-deck?download=true"}, "isUnlocked": false, "companyLink": "https://bossinfo.ch/", "companyLogo": "/api/samples/siift-ai/leads/lead-1791806979127/logo", "maskedEmail": "•••••@company.com", "maskedPhone": "+1 (•••) •••-••••", "aboutCompany": "Enterprise organization operating in SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing).", "leadStudyPdf": "/api/samples/siift-ai/leads/lead-1791806979127/lead-study-pdf", "logoAssetKey": "public-samples/siift-ai/leads/lead-1791806979127/logo/e42fa39c-6590-43b9-a553-bec7579bff30-siift-ai_lead_lead-1791806979127_logo.png", "pitchDeckPdf": "/api/samples/siift-ai/leads/lead-1791806979127/pitch-deck", "shortSummary": "Strategic decision maker aligned with key pain points.", "whySuitsBest": "Strategic decision maker aligned with key pain points.", "leadStudyPdfName": "SHIIF 2ND Bossinfo LEADSTUDY.pdf", "pitchDeckPdfName": "SHIIFT 2ND Bossinfo PITCHDECK.pdf", "pitchDeckAssetKey": "public-samples/siift-ai/leads/lead-1791806979127/pitch-deck/ea542bef-fefa-446d-8599-ccc0fe12e76d-SHIIFT_2ND_Bossinfo_PITCHDECK.pdf", "leadStudyPdfAssetKey": "public-samples/siift-ai/leads/lead-1791806979127/lead-study/95c70995-052e-472f-b384-659064fba731-SHIIF_2ND_Bossinfo_LEADSTUDY.pdf"}, {"id": "lead-1791807039151", "logo": "/api/samples/siift-ai/leads/lead-1791807039151/logo", "name": "Uncapped", "title": "Key Executive", "company": "siift", "industry": "", "linkedin": "", "location": "", "leadStudy": {"whyRelevant": "Direct decision authority and strategic alignment.", "observedContext": "Observed growth and strategic expansion.", "suggestedApproach": "Lead with verifiable outcomes and SLA guarantees.", "potentialOpportunity": "High-probability engagement for specialized outsourced execution."}, "pitchDeck": {"title": "Uncapped Proposal Pitch Deck", "summary": "Targeted strategic pitch deck prepared for client leadership.", "assetKey": "public-samples/siift-ai/leads/lead-1791807039151/pitch-deck/0d408ad9-69f3-46bd-89c9-8007775a9059-SHIIFT_5TH_Weareuncapped_PITCHDECK.pdf", "fileName": "SHIIFT 5TH Weareuncapped PITCHDECK.pdf", "streamUrl": "/api/samples/siift-ai/leads/lead-1791807039151/pitch-deck", "downloadUrl": "/api/samples/siift-ai/leads/lead-1791807039151/pitch-deck?download=true"}, "isUnlocked": false, "companyLink": "https://weareuncapped.com/", "companyLogo": "/api/samples/siift-ai/leads/lead-1791807039151/logo", "maskedEmail": "•••••@company.com", "maskedPhone": "+1 (•••) •••-••••", "aboutCompany": "Enterprise organization operating in SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing).", "leadStudyPdf": "/api/samples/siift-ai/leads/lead-1791807039151/lead-study-pdf", "logoAssetKey": "public-samples/siift-ai/leads/lead-1791807039151/logo/eb3daf2a-3eed-4b41-a4b9-4478bf319312-siift-ai_lead_lead-1791807039151_logo.png", "pitchDeckPdf": "/api/samples/siift-ai/leads/lead-1791807039151/pitch-deck", "shortSummary": "Uncapped is a London-based fintech company providing fast, flexible working capital, including fixed-term loans, lines of credit, and cash advances, specificall siift provides Uncapped with an agentic AI operating system to rigorously validate their new 'Daily Payouts' product and optimize their B2B partner acquisition strategy, ensuring their 'founder-friendly' speed is backed by data-driven strategic clarity rather than guesswork.", "whySuitsBest": "Uncapped is a London-based fintech company providing fast, flexible working capital, including fixed-term loans, lines of credit, and cash advances, specificall siift provides Uncapped with an agentic AI operating system to rigorously validate their new 'Daily Payouts' product and optimize their B2B partner acquisition strategy, ensuring their 'founder-friendly' speed is backed by data-driven strategic clarity rather than guesswork.", "leadStudyPdfName": "SHIIFT 5TH Weareuncapped LEADSTUDY.pdf", "pitchDeckPdfName": "SHIIFT 5TH Weareuncapped PITCHDECK.pdf", "pitchDeckAssetKey": "public-samples/siift-ai/leads/lead-1791807039151/pitch-deck/0d408ad9-69f3-46bd-89c9-8007775a9059-SHIIFT_5TH_Weareuncapped_PITCHDECK.pdf", "leadStudyPdfAssetKey": "public-samples/siift-ai/leads/lead-1791807039151/lead-study/d22f362c-049f-4ca2-a5db-439d36bc39c9-SHIIFT_5TH_Weareuncapped_LEADSTUDY.pdf"}, {"id": "lead-1791807139454", "logo": "/api/samples/siift-ai/leads/lead-1791807139454/logo", "name": "dGB Earth Sciences", "title": "Key Executive", "company": "siift", "industry": "", "linkedin": "", "location": "", "leadStudy": {"whyRelevant": "Direct decision authority and strategic alignment.", "observedContext": "Observed growth and strategic expansion.", "suggestedApproach": "Lead with verifiable outcomes and SLA guarantees.", "potentialOpportunity": "High-probability engagement for specialized outsourced execution."}, "pitchDeck": {"title": "dGB Earth Sciences Proposal Pitch Deck", "summary": "Targeted strategic pitch deck prepared for client leadership.", "assetKey": "public-samples/siift-ai/leads/lead-1791807139454/pitch-deck/c444139e-75e9-4f78-83b0-bcfe36261cea-SHIIFT_3RD_Dgbes_PITCHDECK.pdf", "fileName": "SHIIFT 3RD Dgbes PITCHDECK.pdf", "streamUrl": "/api/samples/siift-ai/leads/lead-1791807139454/pitch-deck", "downloadUrl": "/api/samples/siift-ai/leads/lead-1791807139454/pitch-deck?download=true"}, "isUnlocked": false, "companyLink": "https://dgbes.com/", "companyLogo": "/api/samples/siift-ai/leads/lead-1791807139454/logo", "maskedEmail": "•••••@company.com", "maskedPhone": "+1 (•••) •••-••••", "aboutCompany": "Enterprise organization operating in SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing).", "leadStudyPdf": "/api/samples/siift-ai/leads/lead-1791807139454/lead-study-pdf", "logoAssetKey": "public-samples/siift-ai/leads/lead-1791807139454/logo/4251f3e8-6b5e-4391-b409-abdd9e610609-siift-ai_lead_lead-1791807139454_logo.png", "pitchDeckPdf": "/api/samples/siift-ai/leads/lead-1791807139454/pitch-deck", "shortSummary": "dGB Earth Sciences is a Dutch software company founded in 1995 that provides open-source and commercial seismic interpretation software (OpendTect) powered by m While siift is designed for early-stage founders validating new ideas, dGB Earth Sciences is a mature, domain-specific software leader; the fit is poor because their operational challenges are technical and enterprise-focused, not strategic validation or market noise reduction for a new venture.", "whySuitsBest": "dGB Earth Sciences is a Dutch software company founded in 1995 that provides open-source and commercial seismic interpretation software (OpendTect) powered by m While siift is designed for early-stage founders validating new ideas, dGB Earth Sciences is a mature, domain-specific software leader; the fit is poor because their operational challenges are technical and enterprise-focused, not strategic validation or market noise reduction for a new venture.", "leadStudyPdfName": "SHIIFT 3RD Dgbes LEADSTUDY.pdf", "pitchDeckPdfName": "SHIIFT 3RD Dgbes PITCHDECK.pdf", "pitchDeckAssetKey": "public-samples/siift-ai/leads/lead-1791807139454/pitch-deck/c444139e-75e9-4f78-83b0-bcfe36261cea-SHIIFT_3RD_Dgbes_PITCHDECK.pdf", "leadStudyPdfAssetKey": "public-samples/siift-ai/leads/lead-1791807139454/lead-study/c13fb816-acaa-496e-8a3e-1c0a1795e80b-SHIIFT_3RD_Dgbes_LEADSTUDY.pdf"}, {"id": "lead-1791807255659", "logo": "/api/samples/siift-ai/leads/lead-1791807255659/logo", "name": "PopSQL", "title": "Key Executive", "company": "siift", "industry": "", "linkedin": "", "location": "", "leadStudy": {"whyRelevant": "Direct decision authority and strategic alignment.", "observedContext": "Observed growth and strategic expansion.", "suggestedApproach": "Lead with verifiable outcomes and SLA guarantees.", "potentialOpportunity": "High-probability engagement for specialized outsourced execution."}, "pitchDeck": {"title": "PopSQL Proposal Pitch Deck", "summary": "Targeted strategic pitch deck prepared for client leadership.", "assetKey": "public-samples/siift-ai/leads/lead-1791807255659/pitch-deck/6ea7ec93-ebe5-4377-88e6-e5f648caa7af-SHIIFT_4TH_Popsql_PITCHDECK.pdf", "fileName": "SHIIFT 4TH Popsql PITCHDECK.pdf", "streamUrl": "/api/samples/siift-ai/leads/lead-1791807255659/pitch-deck", "downloadUrl": "/api/samples/siift-ai/leads/lead-1791807255659/pitch-deck?download=true"}, "isUnlocked": false, "companyLink": "https://popsql.com/", "companyLogo": "/api/samples/siift-ai/leads/lead-1791807255659/logo", "maskedEmail": "•••••@company.com", "maskedPhone": "+1 (•••) •••-••••", "aboutCompany": "Enterprise organization operating in SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing).", "leadStudyPdf": "/api/samples/siift-ai/leads/lead-1791807255659/lead-study-pdf", "logoAssetKey": "public-samples/siift-ai/leads/lead-1791807255659/logo/e29c1351-2cb2-4226-8f9d-463b32d2c19d-siift-ai_lead_lead-1791807255659_logo.png", "pitchDeckPdf": "/api/samples/siift-ai/leads/lead-1791807255659/pitch-deck", "shortSummary": "PopSQL is a collaborative SQL editor and data workspace that helps data teams centralize queries, visualize data, and share insights, trusted by over 2,000 comp PopSQL is a mature, funded SaaS company that has already solved the problem of idea validation and market entry, making them an inappropriate target for a tool designed to help early-stage founders structure their initial business plans.", "whySuitsBest": "PopSQL is a collaborative SQL editor and data workspace that helps data teams centralize queries, visualize data, and share insights, trusted by over 2,000 comp PopSQL is a mature, funded SaaS company that has already solved the problem of idea validation and market entry, making them an inappropriate target for a tool designed to help early-stage founders structure their initial business plans.", "leadStudyPdfName": "SHIIFT 4TH Popsql LEADSTUDY.pdf", "pitchDeckPdfName": "SHIIFT 4TH Popsql PITCHDECK.pdf", "pitchDeckAssetKey": "public-samples/siift-ai/leads/lead-1791807255659/pitch-deck/6ea7ec93-ebe5-4377-88e6-e5f648caa7af-SHIIFT_4TH_Popsql_PITCHDECK.pdf", "leadStudyPdfAssetKey": "public-samples/siift-ai/leads/lead-1791807255659/lead-study/7e759427-9c09-4889-914e-3bb9daedc893-SHIIFT_4TH_Popsql_LEADSTUDY.pdf"}]	[]	{}	2026-10-12 18:50:43.686403+05:30	2026-10-12 18:50:43.686403+05:30	2026-10-22 13:21:16.335267+05:30	\N	MANUAL	\N	\N	\N	\N	{}	t	0
\.


--
-- Data for Name: request_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.request_attachments (id, request_id, name, url, size, type, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: request_deliverables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.request_deliverables (id, request_id, title, url, description, created_at, delivered_at) FROM stdin;
\.


--
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.requests (id, ticket_id, user_id, company_id, service_type, title, description, priority, status, price, payment_status, assigned_team, assigned_to, current_submission_version, due_date, notes, approved_at, approved_by, completed_at, created_at, updated_at) FROM stdin;
203	CG-1001	93	56	COMPANY_LEAD	Key People Research: saas	Target hierarchy & buying committee research for saas	MEDIUM	REQUEST_CREATED	2.00	PAID	Company Lead Team	\N	0	\N	{"subService":"KEY_PEOPLE","requirements":{"targetOrganizations":"saas","targetSeniority":"director","rolesToCover":"","needDirectEmail":true,"needDirectPhone":true,"needLinkedIn":true,"economicBuyerScope":true,"technicalLeadScope":true,"additionalGuidelines":"","priority":"STANDARD","serviceId":"key-people","unitPrice":2,"totalPrice":2},"selectedServices":["KEY_PEOPLE"],"pricing":{"price":2,"currency":"USD","status":"CONFIGURED","breakdown":[{"item":"Specialist Bundle (All-Inclusive Bundle Price)","amount":2}]},"submittedAt":"2026-10-22T07:19:32.171Z"}	\N	\N	\N	2026-10-22 12:49:32.214737+05:30	2026-10-22 12:49:32.214737+05:30
204	CG-1002	93	56	COMPANY_LEAD	Lead Research: d	d	MEDIUM	REQUEST_CREATED	100.00	PAID	Company Lead Team	\N	0	\N	{"subService":"LEAD_RESEARCH","requirements":{"leadsCount":50,"targetMarket":"d","targetPersonas":"d","companySizeCriteria":"","qualificationCriteria":"d","exclusions":"","priority":"STANDARD","serviceId":"lead-research","unitPrice":2,"totalPrice":100},"selectedServices":["LEAD_RESEARCH"],"pricing":{"price":100,"currency":"USD","status":"CONFIGURED","breakdown":[{"item":"Specialist Bundle (All-Inclusive Bundle Price)","amount":100}]},"submittedAt":"2026-10-22T07:20:13.424Z"}	\N	\N	\N	2026-10-22 12:50:13.449228+05:30	2026-10-22 12:50:13.449228+05:30
206	CG-1004	93	56	COMPANY_LEAD	Lead Research: 1	s	MEDIUM	REQUEST_CREATED	2.00	PAID	Company Lead Team	\N	0	\N	{"subService":"LEAD_RESEARCH","requirements":{"leadsCount":"1","targetMarket":"1","targetPersonas":"s","companySizeCriteria":"","qualificationCriteria":"s","exclusions":"","priority":"STANDARD","serviceId":"lead-research","unitPrice":2,"totalPrice":2},"selectedServices":["LEAD_RESEARCH"],"pricing":{"price":2,"currency":"USD","status":"CONFIGURED","breakdown":[{"item":"Specialist Bundle (All-Inclusive Bundle Price)","amount":2}]},"submittedAt":"2026-10-22T10:11:34.130Z"}	\N	\N	\N	2026-10-22 15:41:34.151618+05:30	2026-10-22 15:41:34.151618+05:30
207	CG-1005	93	56	COMPANY_LEAD	Key People Research: s	Target hierarchy & buying committee research for s	MEDIUM	REQUEST_CREATED	2.00	PAID	Company Lead Team	\N	0	\N	{"subService":"KEY_PEOPLE","requirements":{"targetOrganizations":"s","targetSeniority":"s","rolesToCover":"","needDirectEmail":true,"needDirectPhone":true,"needLinkedIn":true,"economicBuyerScope":true,"technicalLeadScope":true,"additionalGuidelines":"","priority":"STANDARD","serviceId":"key-people","unitPrice":2,"totalPrice":2},"selectedServices":["KEY_PEOPLE"],"pricing":{"price":2,"currency":"USD","status":"CONFIGURED","breakdown":[{"item":"Specialist Bundle (All-Inclusive Bundle Price)","amount":2}]},"submittedAt":"2026-10-22T10:12:23.828Z"}	\N	\N	\N	2026-10-22 15:42:23.83182+05:30	2026-10-22 15:42:23.83182+05:30
208	CG-1006	93	56	COMPANY_LEAD	Key People Research: 1	Target hierarchy & buying committee research for 1	MEDIUM	REQUEST_CREATED	2.00	PAID	Company Lead Team	\N	0	\N	{"subService":"KEY_PEOPLE","requirements":{"targetOrganizations":"1","targetSeniority":"a","rolesToCover":"","needDirectEmail":true,"needDirectPhone":true,"needLinkedIn":true,"economicBuyerScope":true,"technicalLeadScope":true,"additionalGuidelines":"","priority":"STANDARD","serviceId":"key-people","unitPrice":2,"totalPrice":2},"selectedServices":["KEY_PEOPLE"],"pricing":{"price":2,"currency":"USD","status":"CONFIGURED","breakdown":[{"item":"Specialist Bundle (All-Inclusive Bundle Price)","amount":2}]},"submittedAt":"2026-10-22T11:30:01.613Z"}	\N	\N	\N	2026-10-22 17:00:01.624728+05:30	2026-10-22 17:00:01.624728+05:30
209	CG-1007	93	56	COMPANY_LEAD	Company Study: d	d	MEDIUM	REQUEST_CREATED	1.00	PAID	Company Lead Team	\N	0	\N	{"subService":"COMPANY_STUDY","requirements":{"targetCompany":"d","companyDomain":"","researchObjective":"d","techStackScope":true,"orgArchitectureScope":true,"expansionSignalsScope":true,"targetDepartment":"","specificQuestions":"","priority":"STANDARD","serviceId":"company-study","unitPrice":1,"totalPrice":1},"selectedServices":["COMPANY_STUDY"],"pricing":{"price":1,"currency":"USD","status":"CONFIGURED","breakdown":[{"item":"Specialist Bundle (All-Inclusive Bundle Price)","amount":1}]},"submittedAt":"2026-10-23T05:47:21.542Z"}	\N	\N	\N	2026-10-23 11:17:21.552694+05:30	2026-10-23 11:17:21.552694+05:30
210	CG-1008	93	56	COMPANY_LEAD	Company Study: d	d	MEDIUM	REQUEST_CREATED	1.00	PAID	Company Lead Team	\N	0	\N	{"subService":"COMPANY_STUDY","requirements":{"targetCompany":"d","companyDomain":"","researchObjective":"d","techStackScope":true,"orgArchitectureScope":true,"expansionSignalsScope":true,"targetDepartment":"","specificQuestions":"","priority":"STANDARD","serviceId":"company-study","unitPrice":1,"totalPrice":1},"selectedServices":["COMPANY_STUDY"],"pricing":{"price":1,"currency":"USD","status":"CONFIGURED","breakdown":[{"item":"Specialist Bundle (All-Inclusive Bundle Price)","amount":1}]},"submittedAt":"2026-10-23T05:49:26.980Z"}	\N	\N	\N	2026-10-23 11:19:27.015545+05:30	2026-10-23 11:19:27.015545+05:30
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (role, permissions, updated_at) FROM stdin;
SUPER_ADMIN	["clients.view", "clients.create", "clients.edit", "clients.deactivate", "requests.view", "requests.create", "requests.assign", "requests.reassign", "requests.change_status", "requests.cancel", "deliverables.view", "deliverables.upload", "deliverables.review", "deliverables.approve", "team.view", "team.manage", "team.assign", "billing.view", "billing.manage", "reports.view", "audit.view", "settings.view", "settings.manage"]	2026-10-07 13:05:27.40451+05:30
ADMIN	["clients.view", "clients.create", "clients.edit", "clients.deactivate", "requests.view", "requests.create", "requests.assign", "requests.reassign", "requests.change_status", "requests.cancel", "deliverables.view", "deliverables.upload", "deliverables.review", "deliverables.approve", "team.view", "team.manage", "team.assign", "billing.view", "billing.manage", "reports.view", "audit.view", "settings.view"]	2026-10-07 13:05:27.40451+05:30
COMPANY_BOOST	["clients.view", "requests.view", "requests.assign", "requests.change_status", "deliverables.view", "deliverables.upload", "deliverables.review", "team.view", "billing.view", "reports.view"]	2026-10-07 13:05:27.40451+05:30
LANDING_PAGE	["clients.view", "requests.view", "requests.assign", "requests.change_status", "deliverables.view", "deliverables.upload", "deliverables.review", "team.view", "billing.view", "reports.view"]	2026-10-07 13:05:27.40451+05:30
USER	["requests.view", "requests.create", "deliverables.view", "deliverables.approve", "billing.view"]	2026-10-07 13:05:27.40451+05:30
COMPANY_LEAD	["clients.view", "requests.view", "requests.assign", "requests.change_status", "deliverables.view", "deliverables.upload", "deliverables.review", "team.view", "billing.view", "reports.view"]	2026-10-07 13:33:03.985533+05:30
\.


--
-- Data for Name: service_channel_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_channel_settings (id, channel, name, description, is_active, is_channel, updated_at) FROM stdin;
channel:digitalising	digitalising	DIGITALISING Channel	Research, insights and business intelligence	t	t	2026-10-12 11:53:15.869531+05:30
company-study	digitalising	Company Study	Get a structured personal company study & account dossier	t	f	2026-10-12 11:53:15.875264+05:30
key-people	digitalising	Key People Research	Identify relevant decision-makers & leadership contacts	t	f	2026-10-12 11:53:15.876178+05:30
pitch-support	digitalising	Pitch Support	Pitch support and competitor analysis to win presentations	t	f	2026-10-12 11:53:15.876563+05:30
lead-research	digitalising	Lead Research	Find relevant companies and verified prospect contact intelligence	t	f	2026-10-12 12:13:34.525367+05:30
channel:boosting	boosting	BOOSTING Channel	Growth, GTM & Content	f	t	2026-10-12 11:53:15.868065+05:30
channel:design	design	UI / DESIGN Channel	Interface design & UX heuristics	f	t	2026-10-12 11:53:15.870249+05:30
channel:development	development	APP DEVELOPMENT Channel	Full-stack web & mobile apps	f	t	2026-10-12 11:53:15.87084+05:30
strategic-planner	boosting	Strategic Planner	Build a focused growth and marketing plan	f	f	2026-10-12 11:53:15.871512+05:30
content-creator	boosting	Content Creator	High-impact narrative copy & creative assets	f	f	2026-10-12 11:53:15.872228+05:30
devrel	boosting	DevRel & Technical Advocacy	Developer advocacy & community positioning	f	f	2026-10-12 11:53:15.872695+05:30
gtm	boosting	GTM Strategy	Launch execution blueprints & traction models	f	f	2026-10-12 11:53:15.873185+05:30
ad-creatives	boosting	Ad Creatives	High-converting ad banners & copy angles	f	f	2026-10-12 11:53:15.873647+05:30
brand-identity	boosting	Brand Identity & Positioning	Distinctive brand voice & visual guidelines	f	f	2026-10-12 11:53:15.874409+05:30
ui-ux-audit	design	UI/UX Audit	Comprehensive usability evaluation & UX heuristics	f	f	2026-10-12 11:53:15.876981+05:30
figma-project	design	Figma Project	Figma component systems, mock screens & prototypes	f	f	2026-10-12 11:53:15.87742+05:30
redesign-request	design	Landing Page Redesign	Full-page interface transformations & overhauls	f	f	2026-10-12 11:53:15.87783+05:30
technical-discovery	development	Technical Discovery	Technical discovery & architecture planning	f	f	2026-10-12 11:53:15.87825+05:30
clickable-prototype	development	Clickable App Prototype	Clickable interactive web & mobile prototypes	f	f	2026-10-12 11:53:15.878675+05:30
web-app	development	MVP Development	Production-ready web application MVP (POC + V1)	f	f	2026-10-12 11:53:15.879114+05:30
\.


--
-- Data for Name: submission_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submission_files (id, submission_id, name, url, size, type, created_at) FROM stdin;
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submissions (id, request_id, ticket_code, version, title, description, external_link, notes, submitted_by, submitted_by_name, submitted_at, status, reviewed_by, reviewer_name, review_status, review_feedback, reviewed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, role, company_boost, company_lead, company_ui, company_id, phone, status, is_deleted, deleted_at, avatar, last_login, created_at, updated_at) FROM stdin;
187	Proxy Verification User	proxy.verification@datai2i.com	$2a$10$4L222WPwuHwseOv2eS5KzeaAH7V9ZsHhXSMJedEoFQm.ZgwSQ/v2.	USER	t	t	t	127	\N	ACTIVE	f	\N	\N	\N	2026-10-12 11:50:34.281995+05:30	2026-10-12 11:50:34.281995+05:30
188	Flow Test Client	flow.client@datai2i.com	$2a$10$584tU45aRJio8KRcNVtiouyfAoJn71Nd88oaY9ddzdtrrFQF5ayUC	USER	t	t	t	128	\N	ACTIVE	f	\N	\N	2026-10-12 11:51:39.995+05:30	2026-10-12 11:51:39.892002+05:30	2026-10-12 11:51:39.892002+05:30
1	DiziGini Admin	admin@creativegini.com	$2a$10$syiXu29lpdERwhb9/AliF.zExU.9h/5FwUcpo8BVydhT4MywBrfYi	ADMIN	f	t	f	\N	+1 (800) 555-0100	ACTIVE	f	\N	\N	2026-10-12 22:03:14.707+05:30	2026-10-06 16:07:30.013877+05:30	2026-10-06 16:07:30.013877+05:30
2	Lead Specialist	lead@creativegini.com	$2a$10$syiXu29lpdERwhb9/AliF.Lc0g3Vk9DPLXLW0XpFcvsCwxI8dgTXm	COMPANY_LEAD	f	t	f	\N	+1 (800) 555-0101	ACTIVE	f	\N	\N	2026-10-22 15:37:17.276+05:30	2026-10-06 16:07:30.032684+05:30	2026-10-06 16:07:30.032684+05:30
39	DiziGini Super Admin	team@creativegini.com	$2a$10$syiXu29lpdERwhb9/AliF.WieVQ.FAo9SfaGL5EgrstTuKULtFRFS	SUPER_ADMIN	f	t	f	\N	\N	ACTIVE	f	\N	\N	2026-10-22 17:56:31.887+05:30	2026-10-07 12:46:39.782365+05:30	2026-10-07 12:46:39.782365+05:30
93	Data I2I Client	testclient@datai2i.com	$2a$10$Xlp7LB0F14ppsJpgJfVzneOBJq9OTv9yTJymVpgatB1JXvAxEIfhi	USER	f	f	f	56	+1 555-0199	ACTIVE	f	\N	\N	2026-10-23 11:16:26.258+05:30	2026-10-07 20:02:19.449443+05:30	2026-10-07 20:02:19.449443+05:30
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 708, true);


--
-- Name: api_clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.api_clients_id_seq', 475, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.companies_id_seq', 131, true);


--
-- Name: company_key_people_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_key_people_id_seq', 3, true);


--
-- Name: company_leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_leads_id_seq', 4146, true);


--
-- Name: integration_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.integration_assets_id_seq', 355, true);


--
-- Name: integration_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.integration_events_id_seq', 2954, true);


--
-- Name: magic_login_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.magic_login_tokens_id_seq', 7, true);


--
-- Name: message_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_attachments_id_seq', 1, false);


--
-- Name: message_read_by_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_read_by_id_seq', 1595, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 123, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 4501, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_id_seq', 38, true);


--
-- Name: public_sample_inquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.public_sample_inquiries_id_seq', 2, true);


--
-- Name: public_sample_showcases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.public_sample_showcases_id_seq', 1387, true);


--
-- Name: request_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.request_attachments_id_seq', 1, false);


--
-- Name: request_deliverables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.request_deliverables_id_seq', 1, true);


--
-- Name: requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.requests_id_seq', 213, true);


--
-- Name: submission_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.submission_files_id_seq', 190, true);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.submissions_id_seq', 128, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 517, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: api_clients api_clients_client_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_clients
    ADD CONSTRAINT api_clients_client_id_key UNIQUE (client_id);


--
-- Name: api_clients api_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_clients
    ADD CONSTRAINT api_clients_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_key_people company_key_people_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_key_people
    ADD CONSTRAINT company_key_people_pkey PRIMARY KEY (id);


--
-- Name: company_leads company_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_leads
    ADD CONSTRAINT company_leads_pkey PRIMARY KEY (id);


--
-- Name: integration_assets integration_assets_asset_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_assets
    ADD CONSTRAINT integration_assets_asset_key_key UNIQUE (asset_key);


--
-- Name: integration_assets integration_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_assets
    ADD CONSTRAINT integration_assets_pkey PRIMARY KEY (id);


--
-- Name: integration_batches integration_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_batches
    ADD CONSTRAINT integration_batches_pkey PRIMARY KEY (id);


--
-- Name: integration_events integration_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_events
    ADD CONSTRAINT integration_events_pkey PRIMARY KEY (id);


--
-- Name: integration_idempotency_keys integration_idempotency_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_idempotency_keys
    ADD CONSTRAINT integration_idempotency_keys_pkey PRIMARY KEY (client_id, idempotency_key);


--
-- Name: magic_login_tokens magic_login_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magic_login_tokens
    ADD CONSTRAINT magic_login_tokens_pkey PRIMARY KEY (id);


--
-- Name: magic_login_tokens magic_login_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magic_login_tokens
    ADD CONSTRAINT magic_login_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: message_attachments message_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_pkey PRIMARY KEY (id);


--
-- Name: message_read_by message_read_by_message_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_read_by
    ADD CONSTRAINT message_read_by_message_id_user_id_key UNIQUE (message_id, user_id);


--
-- Name: message_read_by message_read_by_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_read_by
    ADD CONSTRAINT message_read_by_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: payments payments_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_number_key UNIQUE (invoice_number);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: public_sample_inquiries public_sample_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_sample_inquiries
    ADD CONSTRAINT public_sample_inquiries_pkey PRIMARY KEY (id);


--
-- Name: public_sample_showcases public_sample_showcases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_sample_showcases
    ADD CONSTRAINT public_sample_showcases_pkey PRIMARY KEY (id);


--
-- Name: public_sample_showcases public_sample_showcases_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_sample_showcases
    ADD CONSTRAINT public_sample_showcases_slug_key UNIQUE (slug);


--
-- Name: request_attachments request_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_attachments
    ADD CONSTRAINT request_attachments_pkey PRIMARY KEY (id);


--
-- Name: request_deliverables request_deliverables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_deliverables
    ADD CONSTRAINT request_deliverables_pkey PRIMARY KEY (id);


--
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);


--
-- Name: requests requests_ticket_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_ticket_id_key UNIQUE (ticket_id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role);


--
-- Name: service_channel_settings service_channel_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_channel_settings
    ADD CONSTRAINT service_channel_settings_pkey PRIMARY KEY (id);


--
-- Name: submission_files submission_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_files
    ADD CONSTRAINT submission_files_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_api_clients_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_clients_hash ON public.api_clients USING btree (api_key_hash);


--
-- Name: idx_batches_campaign; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_batches_campaign ON public.integration_batches USING btree (external_campaign_id);


--
-- Name: idx_company_leads_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_leads_company_id ON public.company_leads USING btree (company_id);


--
-- Name: idx_events_batch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_batch ON public.integration_events USING btree (batch_id);


--
-- Name: idx_idemp_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_idemp_expires ON public.integration_idempotency_keys USING btree (expires_at);


--
-- Name: idx_integration_assets_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_integration_assets_client ON public.integration_assets USING btree (client_id, status);


--
-- Name: idx_magic_tokens_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_magic_tokens_hash ON public.magic_login_tokens USING btree (token_hash);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC);


--
-- Name: idx_messages_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_request_id ON public.messages USING btree (request_id);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_payments_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_company_id ON public.payments USING btree (company_id);


--
-- Name: idx_payments_gateway_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_gateway_order ON public.payments USING btree (gateway_order_id);


--
-- Name: idx_payments_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_request_id ON public.payments USING btree (request_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_public_sample_inquiries_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_public_sample_inquiries_created_at ON public.public_sample_inquiries USING btree (created_at DESC);


--
-- Name: idx_public_sample_inquiries_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_public_sample_inquiries_slug ON public.public_sample_inquiries USING btree (slug);


--
-- Name: idx_public_samples_demo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_public_samples_demo ON public.public_sample_showcases USING btree (is_demo) WHERE (is_demo = true);


--
-- Name: idx_public_samples_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_public_samples_slug ON public.public_sample_showcases USING btree (slug);


--
-- Name: idx_public_samples_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_public_samples_status ON public.public_sample_showcases USING btree (status);


--
-- Name: idx_request_attachments_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_request_attachments_request_id ON public.request_attachments USING btree (request_id);


--
-- Name: idx_request_deliverables_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_request_deliverables_request_id ON public.request_deliverables USING btree (request_id);


--
-- Name: idx_requests_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_requests_assigned_to ON public.requests USING btree (assigned_to);


--
-- Name: idx_requests_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_requests_company_id ON public.requests USING btree (company_id);


--
-- Name: idx_requests_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_requests_created_at ON public.requests USING btree (created_at DESC);


--
-- Name: idx_requests_service_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_requests_service_type ON public.requests USING btree (service_type);


--
-- Name: idx_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_requests_status ON public.requests USING btree (status);


--
-- Name: idx_submission_files_submission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submission_files_submission_id ON public.submission_files USING btree (submission_id);


--
-- Name: idx_submissions_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submissions_request_id ON public.submissions USING btree (request_id);


--
-- Name: uq_showcase_external_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_showcase_external_id ON public.public_sample_showcases USING btree (source_platform, external_campaign_id, external_prospect_id) WHERE ((external_campaign_id IS NOT NULL) AND (external_prospect_id IS NOT NULL));


--
-- Name: activity_logs activity_logs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: company_key_people company_key_people_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_key_people
    ADD CONSTRAINT company_key_people_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_leads company_leads_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_leads
    ADD CONSTRAINT company_leads_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: integration_assets integration_assets_claimed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_assets
    ADD CONSTRAINT integration_assets_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES public.public_sample_showcases(id) ON DELETE SET NULL;


--
-- Name: integration_events integration_events_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_events
    ADD CONSTRAINT integration_events_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.integration_batches(id) ON DELETE CASCADE;


--
-- Name: magic_login_tokens magic_login_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magic_login_tokens
    ADD CONSTRAINT magic_login_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: message_attachments message_attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_read_by message_read_by_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_read_by
    ADD CONSTRAINT message_read_by_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_read_by message_read_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_read_by
    ADD CONSTRAINT message_read_by_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.requests(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: payments payments_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE SET NULL;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: public_sample_showcases public_sample_showcases_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_sample_showcases
    ADD CONSTRAINT public_sample_showcases_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.integration_batches(id) ON DELETE SET NULL;


--
-- Name: request_attachments request_attachments_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_attachments
    ADD CONSTRAINT request_attachments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;


--
-- Name: request_attachments request_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_attachments
    ADD CONSTRAINT request_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: request_deliverables request_deliverables_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_deliverables
    ADD CONSTRAINT request_deliverables_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;


--
-- Name: requests requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: requests requests_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: requests requests_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: requests requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: submission_files submission_files_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_files
    ADD CONSTRAINT submission_files_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: submissions submissions_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

