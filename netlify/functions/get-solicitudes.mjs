import postgres from "postgres";
import { verificarToken } from "./utils/auth.mjs";

const sql = postgres(process.env.NETLIFY_DB_URL);

export default async (req) => {
  const sesion = verificarToken(req);
  if (!sesion) {
    return new Response(JSON.stringify({ ok: false, error: "Sesión inválida o expirada.", solicitudes: [] }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const solicitudes = await sql`
      SELECT id, nombre_cliente AS nombre, servicio,
            to_char(fecha_inicio, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_inicio,
            fecha_registro
      FROM solicitudes
      WHERE negocio_id = ${sesion.negocio_id}
      ORDER BY fecha_registro DESC
    `;

    return new Response(JSON.stringify({ ok: true, solicitudes }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message, solicitudes: [] }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};