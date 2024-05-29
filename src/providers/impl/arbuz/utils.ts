import crypto from "crypto";

export function getClickHash({
  userId,
  lastClickSeconds,
  secretKey,
}: {
  userId: number;
  lastClickSeconds: number;
  secretKey: string;
}): string {
  const dataCheckString = `${userId}:${lastClickSeconds}`;

  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(dataCheckString);
  return hmac.digest("hex");
}
