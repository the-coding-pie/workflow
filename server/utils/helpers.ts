import { nanoid } from "nanoid";

// creates 'n' length char long hex string
export const createRandomToken = (length: number) => {
  return nanoid(length);
};
