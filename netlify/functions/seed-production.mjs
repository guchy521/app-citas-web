import postgres from "postgres";

const sql = postgres(process.env.NETLIFY_DB_URL);

export default async (req) => {
  const url = new URL(req.url);
  const secreto = url.searchParams.get("secreto");

  if (secreto !== process.env.SEED_SECRETO) {
    return new Response("No autorizado", { status: 403 });
  }

  try {
    const [negocio] = await sql`
      INSERT INTO negocios (nombre, slug, horario_apertura, horario_cierre, admin_pin_hash)
      VALUES ('Mariyn Nails', 'mariyn-nails', '08:00', '20:00', ${process.env.ADMIN_PIN_HASH})
      RETURNING id
    `;

    await sql`
      INSERT INTO servicios (negocio_id, nombre, precio, duracion_horas, descripcion)
      VALUES
        (${negocio.id}, 'Poligel', 25, 2, 'Uñas en poligel'),
        (${negocio.id}, 'Pedicure', 15, 1, 'Pedicure completo'),
        (${negocio.id}, 'Poligel + Pedicure', 40, 3, 'Combo poligel y pedicure')
    `;

    return new Response(JSON.stringify({ ok: true, negocioId: negocio.id }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};