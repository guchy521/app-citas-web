import postgres from "postgres";

export const sql = postgres(process.env.NETLIFY_DB_URL);

export async function obtenerNegocioIdPorSlug(slug) {
  const [row] = await sql`SELECT id FROM negocios WHERE slug = ${slug}`;
  return row ? row.id : null;
}