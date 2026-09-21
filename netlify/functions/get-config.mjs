import postgres from "postgres";
import { verificarToken } from "./utils/auth.mjs";

const sql = postgres(process.env.NETLIFY_DB_URL);

export default async (req) => {
  const sesion = verificarToken(req);
  if (!sesion) {
    return new Response(JSON.stringify({ ok: false, error: "Sesión inválida o expirada." }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const [config] = await sql`
      SELECT nombre, horario_apertura, horario_cierre,
             intervalo_turnos_minutos, anticipacion_minima_horas,
             dias_max_anticipacion, moneda
      FROM negocios
      WHERE id = ${sesion.negocio_id}
    `;

    return new Response(JSON.stringify({ ok: true, config }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};