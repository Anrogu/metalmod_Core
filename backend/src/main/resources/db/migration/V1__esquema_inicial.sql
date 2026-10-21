--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente (
    id bigint NOT NULL,
    nombre character varying(150) NOT NULL,
    contacto character varying(150),
    telefono character varying(30),
    email character varying(150),
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cliente_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cliente_id_seq OWNED BY public.cliente.id;


--
-- Name: cliente_pieza; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente_pieza (
    id bigint NOT NULL,
    id_cliente bigint NOT NULL,
    id_pieza bigint NOT NULL
);


--
-- Name: cliente_pieza_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cliente_pieza_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cliente_pieza_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cliente_pieza_id_seq OWNED BY public.cliente_pieza.id;


--
-- Name: detalle_orden_venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detalle_orden_venta (
    id bigint NOT NULL,
    id_orden_venta bigint NOT NULL,
    id_pieza bigint NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    fecha_entrega_linea date,
    id_estado smallint DEFAULT 1 NOT NULL
);


--
-- Name: detalle_orden_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.detalle_orden_venta_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: detalle_orden_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.detalle_orden_venta_id_seq OWNED BY public.detalle_orden_venta.id;


--
-- Name: entrega_parcial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entrega_parcial (
    id bigint NOT NULL,
    id_detalle_orden_venta bigint NOT NULL,
    cantidad_entregada integer NOT NULL,
    fecha_entrega date NOT NULL,
    observaciones character varying(255)
);


--
-- Name: entrega_parcial_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entrega_parcial_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entrega_parcial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entrega_parcial_id_seq OWNED BY public.entrega_parcial.id;


--
-- Name: estado_detalle_orden_venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estado_detalle_orden_venta (
    id smallint NOT NULL,
    codigo character varying(30) NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: estado_detalle_orden_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estado_detalle_orden_venta_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estado_detalle_orden_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estado_detalle_orden_venta_id_seq OWNED BY public.estado_detalle_orden_venta.id;


--
-- Name: estado_maquina; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estado_maquina (
    id smallint NOT NULL,
    codigo character varying(30) NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: estado_maquina_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estado_maquina_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estado_maquina_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estado_maquina_id_seq OWNED BY public.estado_maquina.id;


--
-- Name: estado_orden_venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estado_orden_venta (
    id smallint NOT NULL,
    codigo character varying(30) NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: estado_orden_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estado_orden_venta_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estado_orden_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estado_orden_venta_id_seq OWNED BY public.estado_orden_venta.id;


--
-- Name: estado_plan_produccion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estado_plan_produccion (
    id smallint NOT NULL,
    codigo character varying(30) NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: estado_plan_produccion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estado_plan_produccion_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estado_plan_produccion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estado_plan_produccion_id_seq OWNED BY public.estado_plan_produccion.id;


--
-- Name: mantenimiento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mantenimiento (
    id bigint NOT NULL,
    id_maquina bigint NOT NULL,
    fecha date NOT NULL,
    falla character varying(255) NOT NULL,
    solucion character varying(255),
    proveedor character varying(150),
    costo numeric(12,2),
    id_refaccion bigint,
    tiempo_invertido_minutos integer,
    id_tecnico bigint,
    id_tipo_mantenimiento smallint
);


--
-- Name: mantenimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mantenimiento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mantenimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mantenimiento_id_seq OWNED BY public.mantenimiento.id;


--
-- Name: maquina; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maquina (
    id bigint NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion character varying(255),
    id_marca bigint,
    id_modelo bigint,
    id_estado smallint DEFAULT 1 NOT NULL
);


--
-- Name: maquina_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maquina_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maquina_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maquina_id_seq OWNED BY public.maquina.id;


--
-- Name: maquina_pieza; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maquina_pieza (
    id bigint NOT NULL,
    id_maquina bigint NOT NULL,
    id_pieza bigint NOT NULL,
    tiempo_ciclo_seg integer NOT NULL
);


--
-- Name: maquina_pieza_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maquina_pieza_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maquina_pieza_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maquina_pieza_id_seq OWNED BY public.maquina_pieza.id;


--
-- Name: maquina_refaccion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maquina_refaccion (
    id bigint NOT NULL,
    id_maquina bigint NOT NULL,
    id_refaccion bigint NOT NULL,
    fecha_ultimo_cambio date,
    vida_util_horas integer,
    proximo_mantenimiento date
);


--
-- Name: maquina_refaccion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maquina_refaccion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maquina_refaccion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maquina_refaccion_id_seq OWNED BY public.maquina_refaccion.id;


--
-- Name: marca; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marca (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- Name: marca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.marca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: marca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.marca_id_seq OWNED BY public.marca.id;


--
-- Name: modelo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modelo (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- Name: modelo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.modelo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: modelo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.modelo_id_seq OWNED BY public.modelo.id;


--
-- Name: orden_venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orden_venta (
    id bigint NOT NULL,
    folio character varying(30) NOT NULL,
    id_cliente bigint NOT NULL,
    id_usuario_creo bigint,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_entrega_compromiso date,
    id_estado smallint DEFAULT 1 NOT NULL
);


--
-- Name: orden_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orden_venta_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orden_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orden_venta_id_seq OWNED BY public.orden_venta.id;


--
-- Name: pieza; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pieza (
    id bigint NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion character varying(255),
    unidad_medida character varying(20) DEFAULT 'pza'::character varying NOT NULL,
    tiempo_ciclo_base_seg integer
);


--
-- Name: pieza_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pieza_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pieza_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pieza_id_seq OWNED BY public.pieza.id;


--
-- Name: plan_produccion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_produccion (
    id bigint NOT NULL,
    id_detalle_orden_venta bigint NOT NULL,
    id_maquina bigint NOT NULL,
    cantidad_programada integer NOT NULL,
    fecha_inicio_programada timestamp without time zone NOT NULL,
    fecha_fin_programada timestamp without time zone NOT NULL,
    id_estado smallint DEFAULT 1 NOT NULL,
    id_usuario_planeo bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: plan_produccion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_produccion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plan_produccion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plan_produccion_id_seq OWNED BY public.plan_produccion.id;


--
-- Name: refaccion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refaccion (
    id bigint NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion character varying(255),
    cantidad_stock integer DEFAULT 0 NOT NULL,
    stock_minimo integer DEFAULT 0 NOT NULL,
    codigo character varying
);


--
-- Name: refaccion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refaccion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refaccion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refaccion_id_seq OWNED BY public.refaccion.id;


--
-- Name: rol; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rol (
    id bigint NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion character varying(255)
);


--
-- Name: rol_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rol_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rol_id_seq OWNED BY public.rol.id;


--
-- Name: tecnico; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tecnico (
    id bigint NOT NULL,
    nombre character varying(150) NOT NULL
);


--
-- Name: tecnico_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tecnico_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tecnico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tecnico_id_seq OWNED BY public.tecnico.id;


--
-- Name: tipo_mantenimiento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_mantenimiento (
    id smallint NOT NULL,
    codigo character varying(30) NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: tipo_mantenimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipo_mantenimiento_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipo_mantenimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipo_mantenimiento_id_seq OWNED BY public.tipo_mantenimiento.id;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id bigint NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    id_rol bigint NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- Name: cliente id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente ALTER COLUMN id SET DEFAULT nextval('public.cliente_id_seq'::regclass);


--
-- Name: cliente_pieza id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_pieza ALTER COLUMN id SET DEFAULT nextval('public.cliente_pieza_id_seq'::regclass);


--
-- Name: detalle_orden_venta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_orden_venta ALTER COLUMN id SET DEFAULT nextval('public.detalle_orden_venta_id_seq'::regclass);


--
-- Name: entrega_parcial id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrega_parcial ALTER COLUMN id SET DEFAULT nextval('public.entrega_parcial_id_seq'::regclass);


--
-- Name: estado_detalle_orden_venta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_detalle_orden_venta ALTER COLUMN id SET DEFAULT nextval('public.estado_detalle_orden_venta_id_seq'::regclass);


--
-- Name: estado_maquina id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_maquina ALTER COLUMN id SET DEFAULT nextval('public.estado_maquina_id_seq'::regclass);


--
-- Name: estado_orden_venta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_orden_venta ALTER COLUMN id SET DEFAULT nextval('public.estado_orden_venta_id_seq'::regclass);


--
-- Name: estado_plan_produccion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_plan_produccion ALTER COLUMN id SET DEFAULT nextval('public.estado_plan_produccion_id_seq'::regclass);


--
-- Name: mantenimiento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mantenimiento ALTER COLUMN id SET DEFAULT nextval('public.mantenimiento_id_seq'::regclass);


--
-- Name: maquina id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina ALTER COLUMN id SET DEFAULT nextval('public.maquina_id_seq'::regclass);


--
-- Name: maquina_pieza id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina_pieza ALTER COLUMN id SET DEFAULT nextval('public.maquina_pieza_id_seq'::regclass);


--
-- Name: maquina_refaccion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina_refaccion ALTER COLUMN id SET DEFAULT nextval('public.maquina_refaccion_id_seq'::regclass);


--
-- Name: marca id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marca ALTER COLUMN id SET DEFAULT nextval('public.marca_id_seq'::regclass);


--
-- Name: modelo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modelo ALTER COLUMN id SET DEFAULT nextval('public.modelo_id_seq'::regclass);


--
-- Name: orden_venta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orden_venta ALTER COLUMN id SET DEFAULT nextval('public.orden_venta_id_seq'::regclass);


--
-- Name: pieza id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pieza ALTER COLUMN id SET DEFAULT nextval('public.pieza_id_seq'::regclass);


--
-- Name: plan_produccion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_produccion ALTER COLUMN id SET DEFAULT nextval('public.plan_produccion_id_seq'::regclass);


--
-- Name: refaccion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refaccion ALTER COLUMN id SET DEFAULT nextval('public.refaccion_id_seq'::regclass);


--
-- Name: rol id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol ALTER COLUMN id SET DEFAULT nextval('public.rol_id_seq'::regclass);


--
-- Name: tecnico id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tecnico ALTER COLUMN id SET DEFAULT nextval('public.tecnico_id_seq'::regclass);


--
-- Name: tipo_mantenimiento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_mantenimiento ALTER COLUMN id SET DEFAULT nextval('public.tipo_mantenimiento_id_seq'::regclass);


--
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- Name: cliente_pieza cliente_pieza_id_cliente_id_pieza_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_pieza
    ADD CONSTRAINT cliente_pieza_id_cliente_id_pieza_key UNIQUE (id_cliente, id_pieza);


--
-- Name: cliente_pieza cliente_pieza_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_pieza
    ADD CONSTRAINT cliente_pieza_pkey PRIMARY KEY (id);


--
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id);


--
-- Name: detalle_orden_venta detalle_orden_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_orden_venta
    ADD CONSTRAINT detalle_orden_venta_pkey PRIMARY KEY (id);


--
-- Name: entrega_parcial entrega_parcial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrega_parcial
    ADD CONSTRAINT entrega_parcial_pkey PRIMARY KEY (id);


--
-- Name: estado_detalle_orden_venta estado_detalle_orden_venta_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_detalle_orden_venta
    ADD CONSTRAINT estado_detalle_orden_venta_codigo_key UNIQUE (codigo);


--
-- Name: estado_detalle_orden_venta estado_detalle_orden_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_detalle_orden_venta
    ADD CONSTRAINT estado_detalle_orden_venta_pkey PRIMARY KEY (id);


--
-- Name: estado_maquina estado_maquina_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_maquina
    ADD CONSTRAINT estado_maquina_codigo_key UNIQUE (codigo);


--
-- Name: estado_maquina estado_maquina_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_maquina
    ADD CONSTRAINT estado_maquina_pkey PRIMARY KEY (id);


--
-- Name: estado_orden_venta estado_orden_venta_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_orden_venta
    ADD CONSTRAINT estado_orden_venta_codigo_key UNIQUE (codigo);


--
-- Name: estado_orden_venta estado_orden_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_orden_venta
    ADD CONSTRAINT estado_orden_venta_pkey PRIMARY KEY (id);


--
-- Name: estado_plan_produccion estado_plan_produccion_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_plan_produccion
    ADD CONSTRAINT estado_plan_produccion_codigo_key UNIQUE (codigo);


--
-- Name: estado_plan_produccion estado_plan_produccion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_plan_produccion
    ADD CONSTRAINT estado_plan_produccion_pkey PRIMARY KEY (id);


--
-- Name: mantenimiento mantenimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mantenimiento
    ADD CONSTRAINT mantenimiento_pkey PRIMARY KEY (id);


--
-- Name: maquina_pieza maquina_pieza_id_maquina_id_pieza_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina_pieza
    ADD CONSTRAINT maquina_pieza_id_maquina_id_pieza_key UNIQUE (id_maquina, id_pieza);


--
-- Name: maquina_pieza maquina_pieza_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina_pieza
    ADD CONSTRAINT maquina_pieza_pkey PRIMARY KEY (id);


--
-- Name: maquina maquina_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina
    ADD CONSTRAINT maquina_pkey PRIMARY KEY (id);


--
-- Name: maquina_refaccion maquina_refaccion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina_refaccion
    ADD CONSTRAINT maquina_refaccion_pkey PRIMARY KEY (id);


--
-- Name: marca marca_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marca
    ADD CONSTRAINT marca_nombre_key UNIQUE (nombre);


--
-- Name: marca marca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marca
    ADD CONSTRAINT marca_pkey PRIMARY KEY (id);


--
-- Name: modelo modelo_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modelo
    ADD CONSTRAINT modelo_nombre_key UNIQUE (nombre);


--
-- Name: modelo modelo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modelo
    ADD CONSTRAINT modelo_pkey PRIMARY KEY (id);


--
-- Name: orden_venta orden_venta_folio_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orden_venta
    ADD CONSTRAINT orden_venta_folio_key UNIQUE (folio);


--
-- Name: orden_venta orden_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orden_venta
    ADD CONSTRAINT orden_venta_pkey PRIMARY KEY (id);


--
-- Name: pieza pieza_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pieza
    ADD CONSTRAINT pieza_pkey PRIMARY KEY (id);


--
-- Name: plan_produccion plan_produccion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_produccion
    ADD CONSTRAINT plan_produccion_pkey PRIMARY KEY (id);


--
-- Name: refaccion refaccion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refaccion
    ADD CONSTRAINT refaccion_pkey PRIMARY KEY (id);


--
-- Name: rol rol_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_nombre_key UNIQUE (nombre);


--
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id);


--
-- Name: tecnico tecnico_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tecnico
    ADD CONSTRAINT tecnico_nombre_key UNIQUE (nombre);


--
-- Name: tecnico tecnico_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tecnico
    ADD CONSTRAINT tecnico_pkey PRIMARY KEY (id);


--
-- Name: tipo_mantenimiento tipo_mantenimiento_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_mantenimiento
    ADD CONSTRAINT tipo_mantenimiento_codigo_key UNIQUE (codigo);


--
-- Name: tipo_mantenimiento tipo_mantenimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_mantenimiento
    ADD CONSTRAINT tipo_mantenimiento_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_username_key UNIQUE (username);


--
-- Name: idx_cliente_pieza_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_pieza_cliente ON public.cliente_pieza USING btree (id_cliente);


--
-- Name: idx_cliente_pieza_pieza; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_pieza_pieza ON public.cliente_pieza USING btree (id_pieza);


--
-- Name: idx_detalle_ov_id_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_detalle_ov_id_estado ON public.detalle_orden_venta USING btree (id_estado);


--
-- Name: idx_detalle_ov_orden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_detalle_ov_orden ON public.detalle_orden_venta USING btree (id_orden_venta);


--
-- Name: idx_detalle_ov_pieza; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_detalle_ov_pieza ON public.detalle_orden_venta USING btree (id_pieza);


--
-- Name: idx_entrega_parcial_detalle; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_entrega_parcial_detalle ON public.entrega_parcial USING btree (id_detalle_orden_venta);


--
-- Name: idx_mantenimiento_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mantenimiento_fecha ON public.mantenimiento USING btree (fecha);


--
-- Name: idx_mantenimiento_id_tecnico; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mantenimiento_id_tecnico ON public.mantenimiento USING btree (id_tecnico);


--
-- Name: idx_mantenimiento_maquina; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mantenimiento_maquina ON public.mantenimiento USING btree (id_maquina);


--
-- Name: idx_mantenimiento_refaccion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mantenimiento_refaccion ON public.mantenimiento USING btree (id_refaccion);


--
-- Name: idx_maquina_id_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maquina_id_estado ON public.maquina USING btree (id_estado);


--
-- Name: idx_maquina_id_marca; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maquina_id_marca ON public.maquina USING btree (id_marca);


--
-- Name: idx_maquina_id_modelo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maquina_id_modelo ON public.maquina USING btree (id_modelo);


--
-- Name: idx_maquina_pieza_maquina; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maquina_pieza_maquina ON public.maquina_pieza USING btree (id_maquina);


--
-- Name: idx_maquina_pieza_pieza; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maquina_pieza_pieza ON public.maquina_pieza USING btree (id_pieza);


--
-- Name: idx_maquina_refaccion_maquina; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maquina_refaccion_maquina ON public.maquina_refaccion USING btree (id_maquina);


--
-- Name: idx_maquina_refaccion_refaccion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maquina_refaccion_refaccion ON public.maquina_refaccion USING btree (id_refaccion);


--
-- Name: idx_orden_venta_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orden_venta_cliente ON public.orden_venta USING btree (id_cliente);


--
-- Name: idx_orden_venta_id_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orden_venta_id_estado ON public.orden_venta USING btree (id_estado);


--
-- Name: idx_plan_produccion_detalle; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_produccion_detalle ON public.plan_produccion USING btree (id_detalle_orden_venta);


--
-- Name: idx_plan_produccion_fechas; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_produccion_fechas ON public.plan_produccion USING btree (fecha_inicio_programada, fecha_fin_programada);


--
-- Name: idx_plan_produccion_id_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_produccion_id_estado ON public.plan_produccion USING btree (id_estado);


--
-- Name: idx_plan_produccion_maquina; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_produccion_maquina ON public.plan_produccion USING btree (id_maquina);


--
-- Name: idx_usuario_id_rol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuario_id_rol ON public.usuario USING btree (id_rol);


--
-- Name: cliente_pieza cliente_pieza_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_pieza
    ADD CONSTRAINT cliente_pieza_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.cliente(id);


--
-- Name: cliente_pieza cliente_pieza_id_pieza_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_pieza
    ADD CONSTRAINT cliente_pieza_id_pieza_fkey FOREIGN KEY (id_pieza) REFERENCES public.pieza(id);


--
-- Name: detalle_orden_venta detalle_orden_venta_id_estado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_orden_venta
    ADD CONSTRAINT detalle_orden_venta_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES public.estado_detalle_orden_venta(id);


--
-- Name: detalle_orden_venta detalle_orden_venta_id_orden_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_orden_venta
    ADD CONSTRAINT detalle_orden_venta_id_orden_venta_fkey FOREIGN KEY (id_orden_venta) REFERENCES public.orden_venta(id) ON DELETE CASCADE;


--
-- Name: detalle_orden_venta detalle_orden_venta_id_pieza_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_orden_venta
    ADD CONSTRAINT detalle_orden_venta_id_pieza_fkey FOREIGN KEY (id_pieza) REFERENCES public.pieza(id);


--
-- Name: entrega_parcial entrega_parcial_id_detalle_orden_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrega_parcial
    ADD CONSTRAINT entrega_parcial_id_detalle_orden_venta_fkey FOREIGN KEY (id_detalle_orden_venta) REFERENCES public.detalle_orden_venta(id) ON DELETE CASCADE;


--
-- Name: mantenimiento mantenimiento_id_maquina_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mantenimiento
    ADD CONSTRAINT mantenimiento_id_maquina_fkey FOREIGN KEY (id_maquina) REFERENCES public.maquina(id);


--
-- Name: mantenimiento mantenimiento_id_refaccion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mantenimiento
    ADD CONSTRAINT mantenimiento_id_refaccion_fkey FOREIGN KEY (id_refaccion) REFERENCES public.refaccion(id);


--
-- Name: mantenimiento mantenimiento_id_tecnico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mantenimiento
    ADD CONSTRAINT mantenimiento_id_tecnico_fkey FOREIGN KEY (id_tecnico) REFERENCES public.tecnico(id);


--
-- Name: mantenimiento mantenimiento_id_tipo_mantenimiento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mantenimiento
    ADD CONSTRAINT mantenimiento_id_tipo_mantenimiento_fkey FOREIGN KEY (id_tipo_mantenimiento) REFERENCES public.tipo_mantenimiento(id);


--
-- Name: maquina maquina_id_estado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina
    ADD CONSTRAINT maquina_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES public.estado_maquina(id);


--
-- Name: maquina maquina_id_marca_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina
    ADD CONSTRAINT maquina_id_marca_fkey FOREIGN KEY (id_marca) REFERENCES public.marca(id);


--
-- Name: maquina maquina_id_modelo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina
    ADD CONSTRAINT maquina_id_modelo_fkey FOREIGN KEY (id_modelo) REFERENCES public.modelo(id);


--
-- Name: maquina_pieza maquina_pieza_id_maquina_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina_pieza
    ADD CONSTRAINT maquina_pieza_id_maquina_fkey FOREIGN KEY (id_maquina) REFERENCES public.maquina(id);


--
-- Name: maquina_pieza maquina_pieza_id_pieza_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina_pieza
    ADD CONSTRAINT maquina_pieza_id_pieza_fkey FOREIGN KEY (id_pieza) REFERENCES public.pieza(id);


--
-- Name: maquina_refaccion maquina_refaccion_id_maquina_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina_refaccion
    ADD CONSTRAINT maquina_refaccion_id_maquina_fkey FOREIGN KEY (id_maquina) REFERENCES public.maquina(id);


--
-- Name: maquina_refaccion maquina_refaccion_id_refaccion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquina_refaccion
    ADD CONSTRAINT maquina_refaccion_id_refaccion_fkey FOREIGN KEY (id_refaccion) REFERENCES public.refaccion(id);


--
-- Name: orden_venta orden_venta_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orden_venta
    ADD CONSTRAINT orden_venta_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.cliente(id);


--
-- Name: orden_venta orden_venta_id_estado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orden_venta
    ADD CONSTRAINT orden_venta_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES public.estado_orden_venta(id);


--
-- Name: orden_venta orden_venta_id_usuario_creo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orden_venta
    ADD CONSTRAINT orden_venta_id_usuario_creo_fkey FOREIGN KEY (id_usuario_creo) REFERENCES public.usuario(id);


--
-- Name: plan_produccion plan_produccion_id_detalle_orden_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_produccion
    ADD CONSTRAINT plan_produccion_id_detalle_orden_venta_fkey FOREIGN KEY (id_detalle_orden_venta) REFERENCES public.detalle_orden_venta(id);


--
-- Name: plan_produccion plan_produccion_id_estado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_produccion
    ADD CONSTRAINT plan_produccion_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES public.estado_plan_produccion(id);


--
-- Name: plan_produccion plan_produccion_id_maquina_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_produccion
    ADD CONSTRAINT plan_produccion_id_maquina_fkey FOREIGN KEY (id_maquina) REFERENCES public.maquina(id);


--
-- Name: plan_produccion plan_produccion_id_usuario_planeo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_produccion
    ADD CONSTRAINT plan_produccion_id_usuario_planeo_fkey FOREIGN KEY (id_usuario_planeo) REFERENCES public.usuario(id);


--
-- Name: usuario usuario_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.rol(id);


--
-- PostgreSQL database dump complete
--


--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

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

--
-- Data for Name: estado_maquina; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.estado_maquina VALUES (1, 'activa', 'Activa');
INSERT INTO public.estado_maquina VALUES (2, 'mantenimiento', 'En mantenimiento');
INSERT INTO public.estado_maquina VALUES (3, 'baja', 'Baja');


--
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.rol VALUES (1, 'Administrador', 'administrador principal');
INSERT INTO public.rol VALUES (2, 'Tecnico', 'Tecnico de Mantenimiento');


--
-- Data for Name: tipo_mantenimiento; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tipo_mantenimiento VALUES (3, 'correctivo', 'Correctivo');
INSERT INTO public.tipo_mantenimiento VALUES (4, 'mantenimiento', 'Limpieza');
INSERT INTO public.tipo_mantenimiento VALUES (5, 'recorridos', 'Recorrido');


--
-- Name: estado_maquina_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estado_maquina_id_seq', 3, true);


--
-- Name: rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rol_id_seq', 1, true);


--
-- Name: tipo_mantenimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipo_mantenimiento_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--


