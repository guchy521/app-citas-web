import postgres from "postgres";
import { verificarToken } from "./utils/auth.mjs";

const sql = postgres(process.env.NETLIFY_DB_URL);

export default async (req) => {
  const sesion = verificarToken(req);
  if (!sesion) {
    return new Response(JSON.stringify({ exito: false, mensaje: "Sesión inválida o expirada." }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const { id, nombre, precio, duracionHoras, descripcion } = await req.json();
    if (!id || !nombre || !precio || !duracionHoras) {
      return new Response(JSON.stringify({ exito: false, mensaje: "Faltan campos requeridos." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const resultado = await sql`
      UPDATE servicios SET nombre = ${nombre}, precio = ${precio}, duracion_horas = ${duracionHoras}, descripcion = ${descripcion || ''}
      WHERE id = ${id} AND negocio_id = ${sesion.negocio_id}
    `;
    if (resultado.count === 0) {
      return new Response(JSON.stringify({ exito: false, mensaje: "No se encontró el servicio." }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ exito: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ exito: false, mensaje: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};