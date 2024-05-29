const COLORS = {
  DOMAIN_PREFIX: "\x1b[35m",
  DATE: "\x1b[36m",
  INFO: "\x1b[32m",
  WARN: "\x1b[33m",
  ERROR: "\x1b[31m",
  DEFAULT: "\x1b[30m",
  BOLD_START: "\x1b[1m",
  BOLD_END: "\x1b[22m",
  WHITE: "\x1b[37m",
};

type TLogLevel = "info" | "warn" | "error";

export function createLogger(
  domain: string,
  paletteVariant: "DARK" | "LIGHT" = "LIGHT"
) {
  const textColor = paletteVariant === "DARK" ? COLORS.WHITE : COLORS.DEFAULT;

  const Logger = {
    _domainPrefix: `${COLORS.DOMAIN_PREFIX}[${domain}]${textColor}`,
    _dateColor: COLORS.DATE,
    _colorizeLevel: (level: TLogLevel) => {
      const COLOR_BY_LEVEL = {
        info: COLORS.INFO,
        warn: COLORS.WARN,
        error: COLORS.ERROR,
      };

      return COLOR_BY_LEVEL[level] || textColor;
    },
    _formatMessage: (level: TLogLevel, message: string) => {
      const date = new Date();
      const dayFormatted = date.toLocaleDateString();
      const timeFormatted = date.toLocaleTimeString();
      const levelColored = Logger._colorizeLevel(level);

      const logLevelSpace = " ".repeat(5 - level.length);
      const logDate = `${Logger._dateColor}${dayFormatted} ${timeFormatted}${textColor}`;
      const logLevel = `${levelColored}${level.toUpperCase()}${logLevelSpace}${textColor}`;

      const domainPrefix =
        domain.length < 24 ? " ".repeat(24 - domain.length) : "";

      return [
        `${Logger._domainPrefix}${domainPrefix}`,
        logDate,
        logLevel,
        message,
      ].join(" | ");
    },
    formatters: {
      makeBold: (message: string) => {
        return `${COLORS.BOLD_START}${message}${COLORS.BOLD_END}`;
      },
    },
    info: (message: string) => {
      console.log(Logger._formatMessage("info", message));
    },
    error: (message: string) => {
      console.error(Logger._formatMessage("error", message));
    },
    warn: (message: string) => {
      console.warn(Logger._formatMessage("warn", message));
    },
  };

  return Logger;
}
