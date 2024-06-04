import { parseIntIntervalFromString } from "../../../utils/utils";

type ProfileOpts = {
  clicksPerSecond: [number, number];
  lazyChance: number;
};

export function convertPropsToPropfileOptions(
  props: Record<string, string>,
  defaults: ProfileOpts
): ProfileOpts {
  return Object.entries(props).reduce<ProfileOpts>((acc, [key, value]) => {
    if (key === "clicksPerSecond") {
      acc[key] = parseIntIntervalFromString(value) || defaults.clicksPerSecond;
    }

    if (key === "lazyChance") {
      acc[key] = parseInt(value) || defaults.lazyChance;
    }

    return acc;
  }, defaults);
}
