export type TLogLevel = "info" | "warn" | "error";
export type TLogTheme = "DARK" | "LIGHT";

export interface ILogger {
  info: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;

  formatter: ILoggerFormatter;
}

export interface ILoggerFormatter {
  colorizeLevel: (level: TLogLevel) => string;
  formatMessage: (args: {
    level: TLogLevel;
    prefix: string;
    message: string;
  }) => string;
  makeBold: (message: string) => string;
}

export type TLoggerFactory = (domain: string) => ILogger;
