import type { ILogger, ILoggerFormatter } from "./types";

export class Logger implements ILogger {
  constructor(
    private readonly domain: string,
    public readonly formatter: ILoggerFormatter
  ) {}

  public info = (message: string): void => {
    console.log(
      this.formatter.formatMessage({
        level: "info",
        message,
        prefix: this.domain,
      })
    );
  };

  public error = (message: string): void => {
    console.error(
      this.formatter.formatMessage({
        level: "error",
        message,
        prefix: this.domain,
      })
    );
  };

  public warn = (message: string): void => {
    console.warn(
      this.formatter.formatMessage({
        level: "warn",
        message,
        prefix: this.domain,
      })
    );
  };
}
