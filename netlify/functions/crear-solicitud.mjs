import { sql } from "./utils/negocio.mjs";

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ exito: false, mensaje: "Método no permitido" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }

    const { negocio, nombre, servicio, fechaInicio } = await req.json();

    if (!negocio || !nombre || !servicio || !fechaInicio) {
      return new Response(JSON.stringify({ exito: false, mensaje: "Faltan datos requeridos." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const nombreLimpio = String(nombre).trim();
    if (nombreLimpio.length < 2) {
      return new Response(JSON.stringify({ exito: false, mensaje: "Ingresa tu nombre completo." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const [fila] = await sql`SELECT id, solicitudes_activas FROM negocios WHERE slug = ${negocio}`;
    if (!fila) {
      return new Response(JSON.stringify({ exito: false, mensaje: "Negocio no encontrado." }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    if (fila.solicitudes_activas === false) {
      return new Response(JSON.stringify({ exito: false, mensaje: "Este negocio no está aceptando solicitudes en línea por ahora." }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    await sql`
      INSERT INTO solicitudes (negocio_id, nombre_cliente, servicio, fecha_inicio)
      VALUES (${fila.id}, ${nombreLimpio}, ${servicio}, ${fechaInicio})
    `;

    return new Response(JSON.stringify({ exito: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ exito: false, mensaje: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};