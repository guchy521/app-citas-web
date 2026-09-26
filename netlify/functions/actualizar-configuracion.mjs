import postgres from "postgres";
import { verificarToken } from "./utils/auth.mjs";

const sql = postgres(process.env.NETLIFY_DB_URL);

export default async (req) => {
  const sesion = verificarToken(req);
  if (!sesion) {
    return new Response(JSON.stringify({ exito: false, mensaje: "Sesión inválida o expirada." }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const datos = await req.json();
    const { nombre, whatsapp, horarioApertura, horarioCierre, colorPrimario, solicitudesActivas } = datos;

    if (!nombre || !horarioApertura || !horarioCierre) {
      return new Response(JSON.stringify({ exito: false, mensaje: "Faltan campos requeridos." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    await sql`
      UPDATE negocios SET
        nombre = ${nombre},
        whatsapp = ${whatsapp || ''},
        horario_apertura = ${horarioApertura},
        horario_cierre = ${horarioCierre},
        color_primario = ${colorPrimario || '#00897b'},
        solicitudes_activas = ${solicitudesActivas === true}
      WHERE id = ${sesion.negocio_id}
    `;

    return new Response(JSON.stringify({ exito: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ exito: false, mensaje: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};