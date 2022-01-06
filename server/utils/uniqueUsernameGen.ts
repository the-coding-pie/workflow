import {
  adjectives,
  names,
  starWars,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";

export const generateUsername = () => {
  const username = uniqueNamesGenerator({
    dictionaries: [adjectives, names, starWars, colors],
    separator: "_",
    length: 2,
    style: "lowerCase",
  });

  return username;
};
