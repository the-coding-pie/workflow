import { nanoid } from "nanoid";
import {
  BASE_PATH_COMPLETE,
  PROFILE_PICS_DIR_NAME,
  STATIC_PATH,
} from "../config";
import path from "path";

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
