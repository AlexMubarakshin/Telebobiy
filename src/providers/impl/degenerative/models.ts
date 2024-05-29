export interface IDegenerativeProfile {
  profile: {
    level: number;
    degenergyLimit: number;
    degenergyPerSecond: number;
    dpoints: number;
    dpointsPerClick: number;
    dpointsPerSecond: number;
    invitedBy: number;
    referrals: any[];
    __v: number;
    user: {
      allowsWriteToPm: boolean;
      firstName: string;
      id: number;
      languageCode: string;
      lastName: string;
      username: string;
    };
    character: {
      attributes: Record<string, any>;
      image: string;
      image600px: string;
      identifier: string;
    };
    syncTimestamp: string;
    lastTimePooped: string;
    dbot: {
      isActive: boolean;
      dpointsEarned: number;
      timeInterval: number;
    };
    _id: string;
  };
  nextLevel: {
    level: number;
    price: number;
    dpointsPerClick: number;
    dpointsPerSecond: number;
    degenergyPerSecond: number;
    degenergyLimit: number;
  };
  dBotPrice: number;
}
