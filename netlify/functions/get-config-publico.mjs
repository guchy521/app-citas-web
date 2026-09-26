import { sql } from "./utils/negocio.mjs";

export default async (req) => {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("negocio");
    if (!slug) {
      return new Response(JSON.stringify({ ok: false, error: "Falta el negocio" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const [negocio] = await sql`
      SELECT nombre, horario_apertura, horario_cierre, dias_max_anticipacion, solicitudes_activas
      FROM negocios WHERE slug = ${slug}
    `;

    if (!negocio) {
      return new Response(JSON.stringify({ ok: false, error: "Negocio no encontrado" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, config: negocio }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};