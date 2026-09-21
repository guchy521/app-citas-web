import { sql, obtenerNegocioIdPorSlug } from "./utils/negocio.mjs";

export default async (req) => {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("negocio");
    if (!slug) {
      return new Response(JSON.stringify({ ok: false, error: "Falta el negocio" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const negocioId = await obtenerNegocioIdPorSlug(slug);
    if (!negocioId) {
      return new Response(JSON.stringify({ ok: false, error: "Negocio no encontrado" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const servicios = await sql`
      SELECT nombre, precio, duracion_horas, descripcion
      FROM servicios
      WHERE negocio_id = ${negocioId} AND activo = true
      ORDER BY nombre
    `;

    return new Response(JSON.stringify({ ok: true, servicios }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};