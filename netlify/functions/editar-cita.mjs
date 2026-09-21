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
    const { id, nombre, servicio, fechaInicio, tiempo, costo, estadoPago } = datos;

    if (!id || !nombre || !servicio || !fechaInicio || !tiempo || !costo) {
      return new Response(JSON.stringify({ exito: false, mensaje: "Faltan campos requeridos." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const inicioNuevo = new Date(fechaInicio);
    const finNuevo = new Date(inicioNuevo.getTime() + Number(tiempo) * 3600000);

    // Igual que en la versión vieja: al editar, se excluye la propia cita
    // del chequeo de solapamiento (id != id actual).
    const citasExistentes = await sql`
      SELECT fecha_inicio, tiempo_horas
      FROM citas
      WHERE negocio_id = ${sesion.negocio_id} AND id != ${id}
    `;

    const haySolapamiento = citasExistentes.some(c => {
      const inicioExistente = new Date(c.fecha_inicio);
      const finExistente = new Date(inicioExistente.getTime() + Number(c.tiempo_horas) * 3600000);
      return inicioNuevo < finExistente && finNuevo > inicioExistente;
    });

    if (haySolapamiento) {
      return new Response(JSON.stringify({ exito: false, mensaje: "¡Atención! Reserva duplicada en este horario", duplicado: true }), { status: 409, headers: { "Content-Type": "application/json" } });
    }

    const resultado = await sql`
      UPDATE citas SET
        nombre_cliente = ${nombre},
        servicio = ${servicio},
        fecha_inicio = ${fechaInicio},
        tiempo_horas = ${tiempo},
        costo = ${costo},
        estado_pago = ${estadoPago || 'Pendiente'}
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