import { randomBetween } from "../utils";

export interface IApplicationProviderAccount {
  name: string;
  rawData: string;
  userAgent: string;
  intervals: [number, number];
  payload: Record<string, any>;
}

export interface IBaseApplicationProviderOptions {
  accounts: IApplicationProviderAccount[];
}

interface IProcessTiming {
  forced: boolean;
  at: number;
}

export interface IApplicationProviderProcessAccount
  extends IApplicationProviderAccount {
  processStartedAt: number | undefined;
  lastProcess: IProcessTiming | undefined;
  nextProcess: IProcessTiming | undefined;
}

export abstract class BaseApplicationProvider {
  protected accounts: Record<
    IApplicationProviderProcessAccount["name"],
    IApplicationProviderProcessAccount
  > = {};

  constructor(protected readonly options: IBaseApplicationProviderOptions) {
    this.accounts = options.accounts.reduce(
      (acc, account) => ({
        ...acc,
        [account.name]: {
          ...account,
          processStartedAt: undefined,
          lastProcess: undefined,
          nextProcess: undefined,
        } satisfies IApplicationProviderProcessAccount,
      }),
      {}
    );
  }

  public getIsProcessingAvailable = (
    account: IApplicationProviderProcessAccount
  ): boolean => {
    if (!account.nextProcess) return true;

    return Date.now() >= account.nextProcess.at;
  };

  protected setAccountLastProcessComplete = (
    account: IApplicationProviderProcessAccount,
    forcedDelaySeconds?: number
  ) => {
    const lastUpdated = {
      forced: Boolean(this.accounts[account.name]?.nextProcess?.forced),
      at: Date.now(),
    };

    this.accounts[account.name].lastProcess = lastUpdated;

    this.accounts[account.name].nextProcess = {
      forced: Boolean(forcedDelaySeconds),
      at: forcedDelaySeconds
        ? Date.now() + forcedDelaySeconds * 1_000
        : Date.now() + randomBetween(...account.intervals) * 1_000,
    };
  };

  public abstract init(): Promise<void>;
  public abstract process(): Promise<void>;
}
