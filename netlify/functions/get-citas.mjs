import postgres from "postgres";
import { verificarToken } from "./utils/auth.mjs";

const sql = postgres(process.env.NETLIFY_DB_URL);

export default async (req) => {
  const sesion = verificarToken(req);
  if (!sesion) {
    return new Response(JSON.stringify({ ok: false, error: "Sesión inválida o expirada.", citas: [] }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {

        const citas = await sql`
        SELECT id, nombre_cliente AS nombre, servicio,
              to_char(fecha_inicio, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_inicio,
              tiempo_horas AS tiempo, costo, estado_pago, fecha_registro
        FROM citas
        WHERE negocio_id = ${sesion.negocio_id}
        ORDER BY fecha_inicio DESC
`;

    return new Response(JSON.stringify({ ok: true, citas }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message, citas: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};