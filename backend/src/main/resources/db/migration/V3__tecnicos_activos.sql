-- V3: ciclo de vida de los tecnicos.
--
-- Los tecnicos se dan de baja de forma logica (activo=false) para no romper
-- los mantenimientos historicos que los referencian. El CRUD solo permite
-- reactivarlos, no borrarlos fisicamente.

ALTER TABLE public.tecnico
    ADD COLUMN activo boolean DEFAULT true NOT NULL;

-- El nombre se valida sin distinguir mayusculas ni espacios en los extremos.
-- Se comprobo que los datos actuales no tienen duplicados con esa normalizacion.
CREATE UNIQUE INDEX ux_tecnico_nombre_lower
    ON public.tecnico (lower(btrim(nombre)));
