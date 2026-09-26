import postgres from "postgres";
import { verificarToken } from "./utils/auth.mjs";

const sql = postgres(process.env.NETLIFY_DB_URL);

export default async (req) => {
  const sesion = verificarToken(req);
  if (!sesion) {
    return new Response(JSON.stringify({ exito: false, mensaje: "Sesión inválida o expirada." }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const { nombre, precio, duracionHoras, descripcion } = await req.json();
    if (!nombre || !precio || !duracionHoras) {
      return new Response(JSON.stringify({ exito: false, mensaje: "Faltan campos requeridos." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    await sql`
      INSERT INTO servicios (negocio_id, nombre, precio, duracion_horas, descripcion, activo)
      VALUES (${sesion.negocio_id}, ${nombre}, ${precio}, ${duracionHoras}, ${descripcion || ''}, true)
    `;
    return new Response(JSON.stringify({ exito: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ exito: false, mensaje: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};