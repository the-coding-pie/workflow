import { nanoid } from "nanoid";

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
