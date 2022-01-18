import {
  BOARD,
  BOARD_ROLES,
  CREATE_BOARD_MODAL,
  CREATE_SPACE_MODAL,
  DEFAULT,
  ERROR,
  INFO,
  SPACE,
  SPACE_ROLES,
  SUCCESS,
  WARNING,
} from "./constants";

export interface UserObj {
  _id: string;
  username: string;
  profile: string;
  email: string;
  emailVerified: boolean;
  isOAuth: boolean;
}

export interface FavoriteObj {
  _id: string;
  name: string;
  spaceId?: string;
  type: typeof SPACE | typeof BOARD;
  role:
    | typeof SPACE_ROLES.ADMIN
    | typeof SPACE_ROLES.NORMAL
    | typeof SPACE_ROLES.GUEST;
  icon?: string;
  color?: string;
}

export interface SpaceObj {
  _id: string;
  name: string;
  icon: string | null;
  isFavorite: boolean;
  role:
    | typeof SPACE_ROLES.ADMIN
    | typeof SPACE_ROLES.NORMAL
    | typeof SPACE_ROLES.GUEST
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  boards: BoardObj[];
}

export interface BoardObj {
  _id: string;
  name: string;
  isFavorite: boolean;
  color: string;
  role:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  img?: string;
  spaceId: string;
}

export interface ToastObj {
  kind:
    | typeof ERROR
    | typeof SUCCESS
    | typeof INFO
    | typeof WARNING
    | typeof DEFAULT;
  msg: string;
}

export interface ModalObj {
  modalType: typeof CREATE_SPACE_MODAL | typeof CREATE_BOARD_MODAL | null;
  modalProps?: object;
  modalTitle?: string;
  showCloseBtn?: boolean;
  bgColor?: string;
  textColor?: string;
}
