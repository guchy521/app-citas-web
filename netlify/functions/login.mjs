import postgres from "postgres";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const sql = postgres(process.env.NETLIFY_DB_URL);

function verificarPin(pinIngresado, hashGuardado) {
  const [salt, hashOriginal] = hashGuardado.split(":");
  const hashIntentado = crypto.scryptSync(pinIngresado, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hashOriginal, "hex"), Buffer.from(hashIntentado, "hex"));
}

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "Método no permitido" }), { status: 405 });
    }

    const { slug, pin } = await req.json();
    if (!slug || !pin) {
      return new Response(JSON.stringify({ ok: false, error: "Faltan datos" }), { status: 400 });
    }

    const [negocio] = await sql`
      SELECT id, admin_pin_hash FROM negocios WHERE slug = ${slug}
    `;

    if (!negocio || !negocio.admin_pin_hash) {
      return new Response(JSON.stringify({ ok: false, error: "Negocio no encontrado o sin PIN configurado" }), { status: 404 });
    }

    if (!verificarPin(pin, negocio.admin_pin_hash)) {
      return new Response(JSON.stringify({ ok: false, error: "PIN incorrecto" }), { status: 401 });
    }

    const token = jwt.sign({ negocio_id: negocio.id }, process.env.JWT_SECRET, { expiresIn: "6h" });

    return new Response(JSON.stringify({ ok: true, token }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
};