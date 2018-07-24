const TABLE_NAME = `okex_trade_${Date.now()}`;

const sql = `
    CREATE SEQUENCE IF NOT EXISTS ${TABLE_NAME}_id_seq increment by 1 minvalue 1 no maxvalue start with 1;

    CREATE TABLE IF NOT EXISTS ${TABLE_NAME}
    (
        id bigint NOT NULL DEFAULT nextval('${TABLE_NAME}_id_seq'::regclass),
        detail jsonb,
        ts timestamp with time zone,
        CONSTRAINT ${TABLE_NAME}_pkey PRIMARY KEY (id)
    )
`

module.exports = {sql:sql, table: TABLE_NAME};