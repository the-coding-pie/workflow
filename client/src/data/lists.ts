import { ListObj } from "../types";

const lists: ListObj[] = [
  {
    _id: "134343",
    name: "First list",
    pos: 65535,
  },
  {
    _id: "2234388855",
    name: "Second list",
    pos: 65535 + 65536,
  },
  {
    _id: "3234235345",
    name: "Third list",
    pos: 65535 + 65536 * 2,
  },
  {
    _id: "4323434343",
    name: "Fourth list",
    pos: 65535 + 65536 * 3,
  },
  {
    _id: "535654",
    name: "Fifth list",
    pos: 65535 + 65536 * 4,
  },
];

export default lists;
