import { parseProviders } from "./providers";

export function getEnvironments(defaults: {
  userAgent: string;
  intervals: [number, number];  // Seconds
}) {
  const envsRaw = process.env;

  return {
    providers: parseProviders(envsRaw, defaults),
  };
}
