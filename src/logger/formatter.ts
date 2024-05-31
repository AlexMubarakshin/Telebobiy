import { COLORS } from "./constants";
import type { ILoggerFormatter, TLogLevel, TLogTheme } from "./types";

export class LoggerFormatter implements ILoggerFormatter {
  protected dateColor: string;
  protected readonly textColor: string;

  constructor(theme: TLogTheme) {
    this.textColor = theme === "DARK" ? COLORS.WHITE : COLORS.DEFAULT;
    this.dateColor = COLORS.DATE;
  }

  public colorizeLevel = (level: TLogLevel) => {
    const COLOR_BY_LEVEL = {
      info: COLORS.INFO,
      warn: COLORS.WARN,
      error: COLORS.ERROR,
    };

    return COLOR_BY_LEVEL[level] || this.textColor;
  };

  public formatMessage = ({
    level,
    prefix,
    message,
  }: {
    level: TLogLevel;
    prefix: string;
    message: string;
  }) => {
    const date = new Date();
    const dayFormatted = date.toLocaleDateString();
    const timeFormatted = date.toLocaleTimeString();
    const levelColored = this.colorizeLevel(level);

    const logLevelSpace = " ".repeat(5 - level.length);
    const logDate = `${this.dateColor}${dayFormatted} ${timeFormatted}${this.textColor}`;
    const logLevel = `${levelColored}${level.toUpperCase()}${logLevelSpace}${
      this.textColor
    }`;

    const prefixTextFormatted =
      prefix + (prefix.length < 24 ? " ".repeat(24 - prefix.length) : "");

    const prefixColorized = `${COLORS.DOMAIN_PREFIX}[${prefixTextFormatted}]${this.textColor}`;

    return [prefixColorized, logDate, logLevel, message].join(" | ");
  };

  public makeBold = (message: string) => {
    return `${COLORS.BOLD_START}${message}${COLORS.BOLD_END}`;
  };
}
