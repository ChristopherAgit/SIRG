-- ============================================================
-- Procedimientos / Funciones de Reportes - Constantinopla DB
-- ============================================================
-- CORRECCIONES aplicadas respecto al SQL original:
--   1. r."CustomerID" → r."CustomersCustomerID"
--      (EF Core genera ese nombre de columna por convencion:
--       HasColumnName("CustomersCustomerID") en SIRGContext)
--   2. "DishCategories" → "Categories"
--      (el DbSet en EF es Categories, no DishCategories)
-- ============================================================


-- ============================================================
-- 1. Reporte de Ventas
-- ============================================================
CREATE OR REPLACE FUNCTION fn_reporte_ventas(
    p_fecha_inicio DATE,
    p_fecha_fin    DATE
)
RETURNS TABLE (
    saleid      INT,
    saledate    TIMESTAMP,
    cliente     VARCHAR,
    telefono    VARCHAR,
    numeromesa  INT,
    total       NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s."SaleID",
        s."SaleDate",
        c."FullName",
        c."Phone",
        rt."TableNumber",
        s."TotalAmount"
    FROM "Sales" s
    INNER JOIN "Orders" o             ON s."OrderID"          = o."OrderID"
    INNER JOIN "Reservations" r       ON o."ReservationID"    = r."ReservationID"
    INNER JOIN "Customers" c          ON r."CustomersCustomerID" = c."CustomerID"
    INNER JOIN "RestaurantTables" rt  ON r."TableID"          = rt."TableID"
    WHERE s."SaleDate"::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
    ORDER BY s."SaleDate" DESC;
END;
$$;


-- ============================================================
-- 2. Platos más vendidos
-- ============================================================
CREATE OR REPLACE FUNCTION fn_reporte_platos_mas_vendidos(
    p_fecha_inicio DATE,
    p_fecha_fin    DATE,
    p_category_id  INT DEFAULT NULL
)
RETURNS TABLE (
    categoria       VARCHAR,
    plato           VARCHAR,
    totalvendido    BIGINT,
    preciounitario  NUMERIC,
    totalingresos   NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cat."CategoryName",
        d."DishName",
        SUM(sd."Quantity"),
        sd."UnitPrice",
        SUM(sd."Quantity" * sd."UnitPrice")
    FROM "SaleDetails" sd
    INNER JOIN "Dishes" d         ON sd."DishID"    = d."DishID"
    INNER JOIN "Categories" cat   ON d."CategoryID" = cat."CategoryID"
    INNER JOIN "Sales" s          ON sd."SaleID"    = s."SaleID"
    WHERE s."SaleDate"::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_category_id IS NULL OR d."CategoryID" = p_category_id)
    GROUP BY cat."CategoryName", d."DishName", sd."UnitPrice"
    ORDER BY SUM(sd."Quantity") DESC;
END;
$$;


-- ============================================================
-- 3. Ventas por Cliente
-- ============================================================
CREATE OR REPLACE FUNCTION fn_reporte_ventas_por_cliente(
    p_fecha_inicio DATE,
    p_fecha_fin    DATE,
    p_customer_id  INT DEFAULT NULL
)
RETURNS TABLE (
    customerid    INT,
    cliente       VARCHAR,
    telefono      VARCHAR,
    correo        VARCHAR,
    totalordenes  BIGINT,
    totalgastado  NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c."CustomerID",
        c."FullName",
        c."Phone",
        c."Email",
        COUNT(s."SaleID"),
        SUM(s."TotalAmount")
    FROM "Sales" s
    INNER JOIN "Orders" o          ON s."OrderID"             = o."OrderID"
    INNER JOIN "Reservations" r    ON o."ReservationID"       = r."ReservationID"
    INNER JOIN "Customers" c       ON r."CustomersCustomerID" = c."CustomerID"
    WHERE s."SaleDate"::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_customer_id IS NULL OR c."CustomerID" = p_customer_id)
    GROUP BY c."CustomerID", c."FullName", c."Phone", c."Email"
    ORDER BY SUM(s."TotalAmount") DESC;
END;
$$;


-- ============================================================
-- 4. Reporte de Reservaciones
-- ============================================================
CREATE OR REPLACE FUNCTION fn_reporte_reservaciones(
    p_fecha_inicio DATE,
    p_fecha_fin    DATE
)
RETURNS TABLE (
    reservationid   INT,
    fecha           DATE,
    hora            TIME,
    cliente         VARCHAR,
    telefono        VARCHAR,
    numeromesa      INT,
    capacidadmesa   INT,
    numeropersonas  INT,
    estado          VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r."ReservationID",
        r."ReservationDate",
        r."ReservationTime",
        c."FullName",
        c."Phone",
        rt."TableNumber",
        rt."Capacity",
        r."NumberOfPeople",
        rs."StatusName"
    FROM "Reservations" r
    INNER JOIN "Customers" c           ON r."CustomersCustomerID" = c."CustomerID"
    INNER JOIN "RestaurantTables" rt   ON r."TableID"             = rt."TableID"
    INNER JOIN "ReservationStatus" rs  ON r."StatusID"            = rs."StatusID"
    WHERE r."ReservationDate" BETWEEN p_fecha_inicio AND p_fecha_fin
    ORDER BY r."ReservationDate" DESC, r."ReservationTime" DESC;
END;
$$;
