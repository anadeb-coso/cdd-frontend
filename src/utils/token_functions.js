import { Buffer } from "buffer";

export function isTokenExpired(token) {
  if (!token) return true; // Pas de token -> considéré comme expiré

  const parts = token.split(".");
  if (parts.length !== 3) return true;

  try {
    // Décodage de la partie payload (2ème partie du JWT)
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    const exp = payload.exp; // en secondes
    const currentTime = Math.floor(Date.now() / 1000);

    return currentTime >= exp; // true = expiré, false = encore valide
  } catch (e) {
    return true; // Erreur de parsing → considéré comme expiré/invalide
  }
}


