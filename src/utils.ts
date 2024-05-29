export function randomBetween(from: number, to: number) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

export function wait(seconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}
