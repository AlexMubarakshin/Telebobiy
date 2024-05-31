import { LoggerFormatter } from "./formatter";
import { Logger } from "./logger";
import type { ILogger, TLogTheme, TLoggerFactory } from "./types";

export function getLoggerFactory(
  paletteVariant: TLogTheme = "LIGHT"
): TLoggerFactory {
  function getLogger(domain: string): ILogger {
    return new Logger(domain, new LoggerFormatter(paletteVariant));
  }

  return getLogger;
}
