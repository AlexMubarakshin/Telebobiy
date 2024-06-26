import type { TLoggerFactory } from "../../../logger/types";
import { randomBetween } from "../../../utils/utils";
import {
  BaseApplicationProvider,
  type IApplicationProviderProcessAccount,
  type IBaseApplicationProviderOptions,
} from "../../base";
import {
  API_METHODS_URLS,
  API_REFERER,
  DEFAULT_CLICKS_PER_SECOND,
  DEFAULTLAZY_SYNC_CHANCE,
  DEFAULT_PROFILE_UPDATE_RATE,
} from "./constants";
import { IDegenerativeProfile } from "./models";
import { convertPropsToPropfileOptions } from "./utils";

export class DegenerativeProvider extends BaseApplicationProvider {
  private profileByAccounts: Record<
    IApplicationProviderProcessAccount["name"],
    IDegenerativeProfile & {
      fetchedAt: number;
      clicksPerSecond: [number, number];
      lazyChance: number;
    }
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
      initData: string;
      method: "POST" | "GET";
      userAgent: string;
      body?: Record<string, any>;
    }
  ) => {
    const body = opts.body ? JSON.stringify(opts.body) : null;

    const resp = await fetch(url, {
      body,
      cache: "default",
      credentials: "omit",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
        "User-Agent": opts.userAgent,
        "x-init-data": opts.initData,
      },
      method: opts.method,
      mode: "cors",
      redirect: "follow",
      referrer: API_REFERER,
      referrerPolicy: "strict-origin-when-cross-origin",
    });

    return resp.json();
  };

  private initProfile = async (
    account: IApplicationProviderProcessAccount
  ): Promise<IDegenerativeProfile> => {
    const profile: IDegenerativeProfile = await this.makeRequest(
      API_METHODS_URLS.GET_DEGEN,
      {
        initData: account.rawData,
        method: "GET",
        userAgent: account.userAgent,
      }
    );

    const opts = convertPropsToPropfileOptions(account.props, {
      clicksPerSecond: DEFAULT_CLICKS_PER_SECOND,
      lazyChance: DEFAULTLAZY_SYNC_CHANCE,
    });
    this.profileByAccounts[account.name] = {
      ...profile,
      fetchedAt: Date.now(),

      ...opts,
    };

    return profile;
  };

  private getIsLevelUpAvailable = (profile: IDegenerativeProfile) => {
    return profile.profile.dpoints >= profile.nextLevel.price;
  };

  private logProfileLevelUp = (profile: IDegenerativeProfile) => {
    const logger = this.createLogger("DEGEN");

    logger.info(
      `🎉 Level up available for ${profile.profile.user.username}!
                                                     Next level (${profile.nextLevel.level}) cost is ${profile.nextLevel.price} dpoints.
                                                     Points for click ${profile.profile.dpointsPerClick} -> ${profile.nextLevel.dpointsPerClick}
                                                     Energy per second ${profile.profile.degenergyPerSecond} -> ${profile.nextLevel.degenergyPerSecond}
                                                     Energy limit ${profile.profile.degenergyLimit} -> ${profile.nextLevel.degenergyLimit}`
    );
  };

  public init = async (): Promise<void> => {
    for (const account of Object.values(this.accounts)) {
      const logger = this.createLogger(`DEGEN ${account.name} init`);
      try {
        const profile: IDegenerativeProfile = await this.initProfile(account);
        logger.info(
          `🥸  Initialized profile ${profile.profile.user.username} with ${profile.profile.dpoints} dpoints.`
        );

        if (this.getIsLevelUpAvailable(profile)) {
          this.logProfileLevelUp(profile);
        }
      } catch (e) {
        logger.error((e as any).message);

        // Remove account from processing
        delete this.accounts[account.name];
      }
    }
  };

  public process = async (): Promise<void> => {
    for (const account of Object.values(this.accounts)) {
      const logger = this.createLogger(`DEGEN ${account.name} process`);

      const isProcessingAvailable = this.getIsProcessingAvailable(account);
      if (!isProcessingAvailable) {
        continue;
      }

      const profile = this.profileByAccounts[account.name];

      const processingStart = Date.now();

      const isLazySync = !account.nextProcess?.forced;
      const clicksPerSecond = isLazySync
        ? 0
        : randomBetween(...profile.clicksPerSecond);
      const secondsFromPreviousSync = account.lastProcess
        ? Math.floor((processingStart - account.lastProcess.at) / 1000)
        : 10;

      const dpointsNext =
        profile.profile.dpoints +
        clicksPerSecond *
          secondsFromPreviousSync *
          profile.profile.dpointsPerClick;

      try {
        const response = await this.makeRequest(API_METHODS_URLS.POST_SYNC, {
          initData: account.rawData,
          method: "POST",
          body: { dpoints: dpointsNext },
          userAgent: account.userAgent,
        });

        if (response.error) {
          logger.error(response.error);

          return;
        }

        logger.info(
          isLazySync
            ? `⏱️  Lazy sync profile ${profile.profile.user.username} with ${response.dpoints} dpoints`
            : `👏 Sync profile ${profile.profile.user.username} with ${response.dpoints} dpoints`
        );

        this.profileByAccounts[account.name].profile.dpoints = response.dpoints;
      } catch (e) {
        logger.error((e as any).message);
        process.exit(1);
      }

      const shouldFetchProfile =
        processingStart - profile.fetchedAt >=
        DEFAULT_PROFILE_UPDATE_RATE * 60 * 1_000;

      if (shouldFetchProfile) {
        const profile: IDegenerativeProfile = await this.initProfile(account);

        if (this.getIsLevelUpAvailable(profile)) {
          this.logProfileLevelUp(profile);
        }
      }

      const lazyChance = randomBetween(0, 100);
      const shouldLazySync = lazyChance < DEFAULTLAZY_SYNC_CHANCE;

      this.setAccountLastProcessComplete(
        account,
        shouldLazySync ? undefined : randomBetween(1, 2)
      );
    }
  };
}
