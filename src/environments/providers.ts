import {
  parseIntIntervalFromString,
  upperCaseToCamelCase,
} from "../utils/utils";

export interface IParsedProvderAccount {
  name: string; /// ACCCOUNT_1, ACCOUNT_2, etc.
  rawData: string;
  userAgent: string;
  intervals: [number, number];

  props: Record<string, string>;
}

export interface IParsedProvider {
  name: string;
  accounts: Record<IParsedProvderAccount["name"], IParsedProvderAccount>;
}

export function parseAccountCustomProperty(propery: string, value: string) {
  return {
    properyName: upperCaseToCamelCase(propery),
    value,
  };
}

export function parseProviders(
  env: NodeJS.ProcessEnv,
  defaults: {
    userAgent: string;
    intervals: [number, number];
  }
): Record<IParsedProvider["name"], IParsedProvider> {
  const providers: Record<IParsedProvider["name"], IParsedProvider> = {};

  const customProps: Record<string, string> = {};

  for (const key in env) {
    if (key.startsWith("PROVIDER_")) {
      const regex = /PROVIDER_(\w+)_(ACCOUNT_\d+)_(\w+)/;
      const match = key.match(regex);

      if (!match) {
        continue;
      }

      const [, providerName, accountName, accountProp] = match;

      if (!providers[providerName]) {
        providers[providerName] = {
          name: providerName,
          accounts: {},
        };
      }

      if (!providers[providerName].accounts[accountName]) {
        providers[providerName].accounts[accountName] = {
          name: accountName,
          rawData: "",
          userAgent: defaults.userAgent,
          intervals: defaults.intervals,
          props: {},
        };
      }

      if (accountProp === "RAW_DATA") {
        providers[providerName].accounts[accountName].rawData =
          env[key]!.trim();
      } else if (accountProp === "USER_AGENT") {
        providers[providerName].accounts[accountName].userAgent =
          env[key]!.trim() || defaults.userAgent;
      } else if (accountProp === "INTERVALS_SECONDS") {
        const intervals =
          parseIntIntervalFromString(env[key]!) || defaults.intervals;
        providers[providerName].accounts[accountName].intervals = intervals;
      } else {
        providers[providerName].accounts[accountName].props[
          accountProp
        ] = env[key]!;
      }
    }
  }

  Object.keys(providers).forEach((providerName) => {
    Object.keys(providers[providerName].accounts).forEach((accountName) => {
      const account = providers[providerName].accounts[accountName];

      if (!account.rawData) {
        delete providers[providerName].accounts[accountName];
      }
    });

    if (!Object.keys(providers[providerName].accounts).length) {
      delete providers[providerName];
    }
  });

  return providers;
}
