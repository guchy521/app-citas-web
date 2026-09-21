import postgres from "postgres";
import { verificarToken } from "./utils/auth.mjs";

const sql = postgres(process.env.NETLIFY_DB_URL);

export default async (req) => {
  const sesion = verificarToken(req);
  if (!sesion) {
    return new Response(JSON.stringify({ exito: false, mensaje: "Sesión inválida o expirada." }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const { id, nuevoEstado } = await req.json();
    if (!id || !nuevoEstado) {
      return new Response(JSON.stringify({ exito: false, mensaje: "Faltan datos." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const resultado = await sql`
      UPDATE citas SET estado_pago = ${nuevoEstado}
      WHERE id = ${id} AND negocio_id = ${sesion.negocio_id}
    `;

    if (resultado.count === 0) {
      return new Response(JSON.stringify({ exito: false, mensaje: "No se encontró la cita." }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ exito: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ exito: false, mensaje: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};