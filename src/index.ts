import { getEnvironments } from "./environments";
import { IParsedProvderAccount } from "./environments/providers";
import { createLogger } from "./logger";

import type {
  BaseApplicationProvider,
  IApplicationProviderAccount,
} from "./providers/base";
import { ProviderFactory } from "./providers/factory";
import { wait } from "./utils";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows; U; Windows NT 6.2; WOW64) AppleWebKit/603.50 (KHTML, like Gecko) Chrome/53.0.2119.189 Safari/533";
const DEFAULT_INTERVALS_SECONDS = [5, 10] satisfies [number, number];

function envAccountToProviderAccount(
  envAccount: IParsedProvderAccount,
  payload: Record<string, any> = {}
): IApplicationProviderAccount {
  return {
    name: envAccount.name,
    rawData: envAccount.rawData,
    userAgent: envAccount.userAgent,
    intervals: envAccount.intervals,
    payload,
  };
}

async function main() {
  const logger = createLogger("Telebobiy");
  logger.info(`Starting the ${logger.formatters.makeBold("Telebobiy")} ...`);
  logger.info(`💖 Enjoying the app? Send a thank you with a donation:`);
  logger.info(
    ` - BTC: ${logger.formatters.makeBold(
      "bc1qda0kujx6a4f7nsds660e09j8hqgp4fe6xq0acj"
    )}`
  );
  logger.info(
    ` - ETH: ${logger.formatters.makeBold(
      "0x75aB5a3310B7A00ac4C82AC83e0A59538CA35fEE"
    )}`
  );

  const envs = getEnvironments({
    userAgent: DEFAULT_USER_AGENT,
    intervals: DEFAULT_INTERVALS_SECONDS,
  });

  const providers = Object.entries(envs.providers).reduce<
    BaseApplicationProvider[]
  >((acc, [providerName, provider]): BaseApplicationProvider[] => {
    const accounts = Object.entries(provider.accounts).map(
      ([accountName, account]) => {
        return envAccountToProviderAccount(account, {
          username: accountName,
        });
      }
    );

    try {
      const providerInstance = ProviderFactory.createProvider(providerName, {
        accounts,
      });

      acc.push(providerInstance);
    } catch (e) {
      console.error(e);
    }

    return acc;
  }, []);

  const providersInitPromises = providers.map((provider) => provider.init());

  const providersInitResults = await Promise.allSettled(providersInitPromises);

  for (const result of providersInitResults) {
    if (result.status === "rejected") {
      console.error(result.reason);
    }
  }

  while (true) {
    const providersProcessPromises = providers.map((provider) =>
      provider.process()
    );

    const providersProcessResults = await Promise.allSettled(
      providersProcessPromises
    );

    for (const result of providersProcessResults) {
      if (result.status === "rejected") {
        console.error(result.reason);
      }
    }

    await wait(1);
  }
}

main();
