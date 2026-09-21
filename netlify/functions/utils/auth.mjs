import jwt from "jsonwebtoken";

export function verificarToken(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET); // devuelve { negocio_id, iat, exp }
  } catch (err) {
    return null; // token inválido o expirado
  }
}