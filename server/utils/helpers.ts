import crypto from "crypto";

// creates 128 char long hex string
export const createRandomHex = (length: number) => {
  return crypto.randomBytes(length).toString("hex");
};
