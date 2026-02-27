import admin from "firebase-admin";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing_token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      provider: decoded.firebase?.sign_in_provider || null,
    };

    next();
  } catch (err) {
    console.error("[Auth] Invalid token:", err.message);
    return res.status(401).json({ error: "invalid_token" });
  }
}
