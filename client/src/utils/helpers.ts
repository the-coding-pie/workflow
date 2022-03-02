import TimeAgo from "javascript-time-ago";
import jwtDecode, { JwtPayload } from "jwt-decode";
import en from "javascript-time-ago/locale/en.json";
import { DUE_DATE_STATUSES } from "../types/constants";
import { isBefore } from "date-fns";

export const checkTokens = (): boolean => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    if (!refreshToken && !accessToken) {
      return false;
    }

    // first check, if you have a valid access_token
    if (accessToken) {
      // accessToken may be invalid, or expired, or no refreshToken or refreshToken present or refreshToken may be invalid
      try {
        // decode the token
        // invalid or malformed token will throw error
        const atoken = jwtDecode<JwtPayload>(accessToken as string);
        let exp = null;

        if (atoken && atoken?.exp) {
          exp = atoken.exp;
        }

        // if no exp date or expired exp date
        if (!exp || exp < new Date().getTime() / 1000) {
          // invalid accessToken
          // now check for refreshToken
          if (refreshToken) {
            const rtoken = jwtDecode<JwtPayload>(refreshToken as string);
            let exp = null;

            if (rtoken && rtoken?.exp) {
              exp = rtoken.exp;
            }

            // if no exp date or expired exp date
            if (!exp || exp < new Date().getTime() / 1000) {
              return false;
            }
          } else {
            return false;
          }
        }
      } catch {
        // invalid accessToken
        // now check for refreshToken
        if (refreshToken) {
          const rtoken = jwtDecode<JwtPayload>(refreshToken as string);
          let exp = null;

          if (rtoken && rtoken?.exp) {
            exp = rtoken.exp;
          }

          // if no exp date or expired exp date
          if (!exp || exp < new Date().getTime() / 1000) {
            return false;
          }
        } else {
          return false;
        }
      }
    } else {
      // we have refreshToken
      // check if refreshToken exists or not
      const rtoken = jwtDecode<JwtPayload>(refreshToken as string);
      let exp = null;

      if (rtoken && rtoken?.exp) {
        exp = rtoken.exp;
      }

      // if no exp date or expired exp date
      if (!exp || exp < new Date().getTime() / 1000) {
        return false;
      }
    }

    // valid token
    return true;
  } catch (e) {
    return false;
  }
};

export const getTokens = () => {
  // check if the user has a valid or a access_token refresh_token
  if (checkTokens()) {
    return {
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
    };
  }

  removeTokens();
  return {
    accessToken: null,
    refreshToken: null,
  };
};

export const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

// fn to save new access token
export const saveAccessTokens = (accessToken: string): void => {
  localStorage.setItem("accessToken", accessToken);
};

// fn to remove tokens
export const removeTokens = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// slice chars
export const chopChars = (maxLength: number, text: string) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

TimeAgo.addDefaultLocale(en);

export const getDate = (date: string) => {
  const timeAgo = new TimeAgo("en-US");

  return timeAgo.format(new Date(date));
};

// get status
export const getStatus = (date: string, isComplete: boolean) => {
  if (isComplete) {
    return DUE_DATE_STATUSES.COMPLETE;
  }

  if (date && isBefore(new Date(date), new Date())) {
    return DUE_DATE_STATUSES.OVERDUE;
  }

  return null;
};
