import { nanoid } from "nanoid";
import {
  BASE_PATH_COMPLETE,
  PROFILE_PICS_DIR_NAME,
  STATIC_PATH,
} from "../config";
import path from "path";
import { LABEL_COLORS } from "../types/constants";

// creates 'n' length char long hex string
export const createRandomToken = (length: number) => {
  return nanoid(length);
};

// get unique array value
export const getUniqueValues = <T>(array: T[]) => {
  return array.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
};

// get unique array value
export const checkAllString = (array: any[]) => {
  return array.every((i) => typeof i === "string");
};

// get profile pic path
export const getProfile = (profile: string) => {
  return profile.includes("http")
    ? profile
    : BASE_PATH_COMPLETE +
        path.join(STATIC_PATH, PROFILE_PICS_DIR_NAME, profile);
};

// get pos for color
export const getPos = (color: string) => {
  if (color === LABEL_COLORS.GREEN) {
    return 1;
  } else if (color === LABEL_COLORS.YELLOW) {
    return 2;
  } else if (color === LABEL_COLORS.ORANGE) {
    return 3;
  } else if (color === LABEL_COLORS.RED) {
    return 4;
  } else if (color === LABEL_COLORS.PURPLE) {
    return 5;
  } else if (color === LABEL_COLORS.BLUE) {
    return 6;
  } else if (color === LABEL_COLORS.LIGHTBLUE) {
    return 7;
  } else {
    return 1;
  }
};
