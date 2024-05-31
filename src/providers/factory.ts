import type { TLoggerFactory } from "../logger/types";
import { BaseApplicationProvider, IApplicationProviderAccount } from "./base";
import { ArbuzProvider } from "./impl/arbuz";
import { DegenerativeProvider } from "./impl/degenerative";

export class ProviderFactory {
  public static SUPPORTED_PROVIDERS = {
    ARBUZ: "ARBUZ",
    DEGENERATIVE: "DEGENERATIVE",
  };

  static createProvider = (
    provider: string,
    opts: {
      createLogger: TLoggerFactory;
      accounts: IApplicationProviderAccount[];
    }
  ): BaseApplicationProvider => {
    const providerCreatorByName = {
      [ProviderFactory.SUPPORTED_PROVIDERS.ARBUZ]: () =>
        new ArbuzProvider(opts.createLogger, { accounts: opts.accounts }),
      [ProviderFactory.SUPPORTED_PROVIDERS.DEGENERATIVE]: () =>
        new DegenerativeProvider(opts.createLogger, {
          accounts: opts.accounts,
        }),
    };

    const providerCreator = providerCreatorByName[provider];
    if (!providerCreator) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return providerCreator();
  };
}
