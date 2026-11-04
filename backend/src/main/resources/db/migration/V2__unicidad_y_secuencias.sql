-- V2: unicidad real en nombres/codigos y secuencias alineadas con los datos.
--
-- Se aplica despues de V1 tanto en instalaciones nuevas como en la base
-- existente (que esta baselined en V1). Si existieran duplicados, la creacion
-- del indice falla y el despliegue se detiene: es preferible a seguir
-- guardando datos ambiguos.

-- Maquina: el servicio valida sin distinguir mayusculas ni espacios en los
-- extremos, asi que el indice usa la misma normalizacion.
CREATE UNIQUE INDEX ux_maquina_nombre_lower
    ON public.maquina (lower(btrim(nombre)));

-- Refaccion: el codigo es opcional. Los NULL no participan en la unicidad,
-- pero dos codigos iguales (aunque cambien mayusculas/espacios) ya no entran.
CREATE UNIQUE INDEX ux_refaccion_codigo_lower
    ON public.refaccion (lower(btrim(codigo)))
    WHERE codigo IS NOT NULL;

-- Secuencias: V1 las dejo por detras de los ids sembrados (rol y
-- tipo_mantenimiento). Con setval(..., max+1, false) el proximo nextval
-- devuelve exactamente max+1, sin depender de si la tabla esta vacia.
SELECT setval(
    'public.rol_id_seq',
    (SELECT COALESCE(MAX(id), 0) + 1 FROM public.rol),
    false
);

SELECT setval(
    'public.tipo_mantenimiento_id_seq',
    (SELECT COALESCE(MAX(id), 0) + 1 FROM public.tipo_mantenimiento),
    false
);

SELECT setval(
    'public.estado_maquina_id_seq',
    (SELECT COALESCE(MAX(id), 0) + 1 FROM public.estado_maquina),
    false
);
