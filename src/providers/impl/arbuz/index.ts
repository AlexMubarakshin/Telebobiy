import { TLoggerFactory } from "../../../logger/types";
import { randomBetween } from "../../../utils";
import {
  BaseApplicationProvider,
  IApplicationProviderProcessAccount,
  IBaseApplicationProviderOptions,
} from "../../base";
import {
  API_METODS_URLS,
  API_REFERER_URL,
  API_SECRET,
  MAX_ENERGY_TO_CLICK,
  MIN_ENERGY_TO_CLICK,
} from "./constants";
import { getClickHash } from "./utils";

interface IArbuzProfile {
  id: number;
  username: string;
  fullName: string;
  energy: number;
  energyLimit: number;
  clicks: number;
  clickBoostSum: number;
  energyBoostSum: number;
  minerBoostSum: number;
  receipt: {
    limitSpent: number;
    limit: number;
    limitResetAt: null;
  };
  banned: boolean;
  researchPoints: number;
  lastClickSeconds: number;
}

export class ArbuzProvider extends BaseApplicationProvider {
  private readonly profilesByAccounts: Record<
    IApplicationProviderProcessAccount["name"],
    IArbuzProfile
  > = {};

  constructor(
    private createLogger: TLoggerFactory,
    opts: IBaseApplicationProviderOptions
  ) {
    super(opts);
  }

  private makeRequest = async (
    url: string,
    opts: {
      method: "POST" | "GET";
      body: Record<string, any> | undefined;
      token: string;
      userAgent: string;
    }
  ) => {
    const resp = await fetch(url, {
      body: !!opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "default",
      credentials: "omit",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-GB,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "User-Agent": opts.userAgent,
        "X-Telegram-Init-Data": opts.token,
        "Content-Type": "application/json",
      },
      method: opts.method,
      mode: "cors",
      redirect: "follow",
      referrer: API_REFERER_URL,
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    return resp.json();
  };

  public init = async (): Promise<void> => {
    for (const account of Object.values(this.accounts)) {
      const logger = this.createLogger(`ARBZ ${account.name} init`);
      const me: IArbuzProfile = await this.makeRequest(API_METODS_URLS.GET_ME, {
        method: "GET",
        body: undefined,
        token: account.rawData,
        userAgent: account.userAgent,
      });

      if (me.banned) {
        logger.error(`⛔️ Account ${me.username} is banned`);

        delete this.profilesByAccounts[account.name];

        delete this.accounts[account.name];

        continue;
      }

      this.profilesByAccounts[account.name] = me;
    }
  };

  public process = async (): Promise<void> => {
    for (const account of Object.values(this.accounts)) {
      const isProcessingAvailable = this.getIsProcessingAvailable(account);
      if (!isProcessingAvailable) {
        continue;
      }

      const logger = this.createLogger(`ARBZ ${account.name}`);

      const profile = this.profilesByAccounts[account.name];
      const hash = getClickHash({
        userId: profile.id,
        lastClickSeconds: profile.lastClickSeconds,
        secretKey: API_SECRET,
      });

      const count =
        profile.energy > MAX_ENERGY_TO_CLICK
          ? randomBetween(MIN_ENERGY_TO_CLICK, MAX_ENERGY_TO_CLICK)
          : Math.round(profile.energy * 0.8);

      const clickResult = await this.makeRequest(API_METODS_URLS.POST_CLICK, {
        method: "POST",
        body: { count, hash },
        token: account.rawData,
        userAgent: account.userAgent,
      });

      if (
        !("currentEnergy" in clickResult) ||
        !("lastClickSeconds" in clickResult)
      ) {
        logger.error(
          `Invalid response from the server: ${JSON.stringify(clickResult)}`
        );

        this.setAccountLastProcessComplete(account);

        continue;
      }

      logger.info(
        `Clicked ${count} times. Energy: ${Math.round(
          clickResult.currentEnergy
        )}/${profile.energyLimit}`
      );

      this.profilesByAccounts[account.name].energy = clickResult.currentEnergy;
      this.profilesByAccounts[account.name].lastClickSeconds =
        clickResult.lastClickSeconds;

      this.setAccountLastProcessComplete(account);
    }
  };
}
