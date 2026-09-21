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
    const { nombre, servicio, fechaInicio, tiempo, costo, estadoPago, solicitudId } = datos;

    if (!nombre || !servicio || !fechaInicio || !tiempo || !costo) {
      return new Response(JSON.stringify({ exito: false, mensaje: "Faltan campos requeridos." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const inicioNuevo = new Date(fechaInicio);
    const finNuevo = new Date(inicioNuevo.getTime() + Number(tiempo) * 3600000);

    const citasExistentes = await sql`
      SELECT fecha_inicio, tiempo_horas
      FROM citas
      WHERE negocio_id = ${sesion.negocio_id}
    `;

    const haySolapamiento = citasExistentes.some(c => {
      const inicioExistente = new Date(c.fecha_inicio);
      const finExistente = new Date(inicioExistente.getTime() + Number(c.tiempo_horas) * 3600000);
      return inicioNuevo < finExistente && finNuevo > inicioExistente;
    });

    if (haySolapamiento) {
      return new Response(JSON.stringify({ exito: false, mensaje: "¡Atención! Reserva duplicada en este horario", duplicado: true }), { status: 409, headers: { "Content-Type": "application/json" } });
    }

    await sql`
      INSERT INTO citas (negocio_id, nombre_cliente, servicio, fecha_inicio, tiempo_horas, costo, estado_pago)
      VALUES (${sesion.negocio_id}, ${nombre}, ${servicio}, ${fechaInicio}, ${tiempo}, ${costo}, ${estadoPago || 'Pendiente'})
    `;

    if (solicitudId) {
      await sql`DELETE FROM solicitudes WHERE id = ${solicitudId} AND negocio_id = ${sesion.negocio_id}`;
    }

    return new Response(JSON.stringify({ exito: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ exito: false, mensaje: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};