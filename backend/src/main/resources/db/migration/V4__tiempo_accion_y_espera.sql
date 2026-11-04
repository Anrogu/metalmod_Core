-- V4: separa el tiempo de mantenimiento en accion y espera.
--
-- Los registros historicos solo tenian un tiempo total, sin distinguir entre
-- trabajo efectivo y espera. Para no inventar datos, todo ese tiempo se
-- conserva como tiempo de accion y la espera queda en cero.

ALTER TABLE public.mantenimiento
    ADD COLUMN tiempo_accion_minutos integer,
    ADD COLUMN tiempo_espera_minutos integer;

UPDATE public.mantenimiento
SET tiempo_accion_minutos = GREATEST(COALESCE(tiempo_invertido_minutos, 0), 0),
    tiempo_espera_minutos = 0;

ALTER TABLE public.mantenimiento
    ALTER COLUMN tiempo_accion_minutos SET DEFAULT 0,
    ALTER COLUMN tiempo_accion_minutos SET NOT NULL,
    ALTER COLUMN tiempo_espera_minutos SET DEFAULT 0,
    ALTER COLUMN tiempo_espera_minutos SET NOT NULL;

ALTER TABLE public.mantenimiento
    ADD CONSTRAINT ck_mantenimiento_tiempo_accion_no_negativo
        CHECK (tiempo_accion_minutos >= 0),
    ADD CONSTRAINT ck_mantenimiento_tiempo_espera_no_negativo
        CHECK (tiempo_espera_minutos >= 0);

ALTER TABLE public.mantenimiento
    DROP COLUMN tiempo_invertido_minutos;
