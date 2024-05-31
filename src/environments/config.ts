export function parseLogColorMode(env: NodeJS.ProcessEnv) {
  const colorMode = env.CONFIG_LOGGER_COLOR_MODE;
  if (colorMode === "DARK" || colorMode === "LIGHT") {
    return colorMode;
  }

  return "DARK";
}

export function parseConfigVariables(env: NodeJS.ProcessEnv) {
  return {
    loggerColorMode: parseLogColorMode(env),
  };
}
