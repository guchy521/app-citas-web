ALTER TABLE citas ALTER COLUMN fecha_inicio TYPE TIMESTAMP USING fecha_inicio::timestamp;
ALTER TABLE solicitudes ALTER COLUMN fecha_inicio TYPE TIMESTAMP USING fecha_inicio::timestamp;