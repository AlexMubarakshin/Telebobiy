export function randomBetween(from: number, to: number) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

export function wait(seconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

export function upperCaseToCamelCase(str: string) {
  return str
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function parseIntIntervalFromString(
  value: string
): [number, number] | undefined {
  const [min, max] = value.split(",").map((v) => parseInt(v, 10));

  if (min && max) {
    return [min, max];
  }

  return undefined;
}
