import { sql, obtenerNegocioIdPorSlug } from "./utils/negocio.mjs";

export default async (req) => {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("negocio");
    const fecha = url.searchParams.get("fecha");

    if (!slug || !fecha) {
      return new Response(JSON.stringify({ ok: false, error: "Faltan parámetros" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const negocioId = await obtenerNegocioIdPorSlug(slug);
    if (!negocioId) {
      return new Response(JSON.stringify({ ok: false, error: "Negocio no encontrado" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const inicioDia = `${fecha}T00:00:00`;
    const finDia = `${fecha}T23:59:59`;

    // Cruza citas YA agendadas + solicitudes pendientes, para que dos
    // clientas no pidan el mismo horario antes de que el dueño revise.
    const citas = await sql`
      SELECT fecha_inicio, tiempo_horas AS tiempo
      FROM citas
      WHERE negocio_id = ${negocioId} AND fecha_inicio BETWEEN ${inicioDia} AND ${finDia}
    `;

    const solicitudes = await sql`
      SELECT fecha_inicio
      FROM solicitudes
      WHERE negocio_id = ${negocioId} AND fecha_inicio BETWEEN ${inicioDia} AND ${finDia}
    `;

    const ocupadas = [
      ...citas.map(c => ({ fechaInicio: c.fecha_inicio, tiempo: Number(c.tiempo) || 1 })),
      ...solicitudes.map(s => ({ fechaInicio: s.fecha_inicio, tiempo: 1 }))
    ];

    return new Response(JSON.stringify({ ok: true, ocupadas }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};