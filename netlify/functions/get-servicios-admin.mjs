import postgres from "postgres";
import { verificarToken } from "./utils/auth.mjs";

const sql = postgres(process.env.NETLIFY_DB_URL);

export default async (req) => {
  const sesion = verificarToken(req);
  if (!sesion) {
    return new Response(JSON.stringify({ ok: false, error: "Sesión inválida o expirada.", servicios: [] }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const servicios = await sql`
      SELECT id, nombre, precio, duracion_horas, descripcion, activo
      FROM servicios
      WHERE negocio_id = ${sesion.negocio_id}
      ORDER BY nombre
    `;
    return new Response(JSON.stringify({ ok: true, servicios }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message, servicios: [] }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};