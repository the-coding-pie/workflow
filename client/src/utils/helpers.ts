import jwt_decode, { JwtPayload } from "jwt-decode";

export const checkTokens = (): boolean => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    if (!refreshToken && !accessToken) {
      return false;
    }

    // first check, if you have a valid access_token
    // decode the token
    const atoken = jwt_decode(accessToken as string) as JwtPayload;
    let exp = null;

    if (atoken && atoken?.exp) {
      exp = atoken.exp;
    }

    // if no exp date or expired exp date
    if (!exp || exp < new Date().getTime() / 1000) {
      // invalid accessToken
      // now check for refreshToken
      const rtoken = jwt_decode(refreshToken as string) as JwtPayload;
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
