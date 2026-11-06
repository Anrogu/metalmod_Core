-- V5: descuento de stock al usar refacciones en mantenimientos.
--
-- Marca los mantenimientos que ya descontaron una pieza del inventario. Los
-- registros historicos quedan en false porque se capturaron antes de que
-- existiera el descuento automatico; asi, si se elimina un ticket viejo, no se
-- inventa stock que nunca se desconto.

ALTER TABLE public.mantenimiento
    ADD COLUMN stock_descontado boolean DEFAULT false NOT NULL;

-- Blindaje a nivel de base de datos: el stock nunca puede quedar negativo.
ALTER TABLE public.refaccion
    ADD CONSTRAINT ck_refaccion_cantidad_stock_no_negativa
        CHECK (cantidad_stock >= 0);
