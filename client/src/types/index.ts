import {
  BOARD,
  BOARD_ROLES,
  BOARD_VISIBILITY_TYPES,
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
  resourceId: string;
  spaceId?: string;
  type: typeof SPACE | typeof BOARD;
  spaceRole?:
    | typeof SPACE_ROLES.ADMIN
    | typeof SPACE_ROLES.NORMAL
    | typeof SPACE_ROLES.GUEST;
  boardVisibility?:
    | typeof BOARD_VISIBILITY_TYPES.PRIVATE
    | typeof BOARD_VISIBILITY_TYPES.PUBLIC;
  icon?: string;
  color?: string;
}

export interface Space {
  _id: string;
  name: string;
  icon: string;
  isFavorite: boolean;
  favoriteId: string | null;
  role:
    | typeof SPACE_ROLES.ADMIN
    | typeof SPACE_ROLES.NORMAL
    | typeof SPACE_ROLES.GUEST;
}

export interface SpaceInfoObj extends Space {
  description: string;
}

export interface SpaceObj extends Space {
  boards: BoardObj[];
}

export interface BoardObj {
  _id: string;
  name: string;
  isMember: boolean;
  isFavorite: boolean;
  favoriteId: string | null;
  color: string;
  visibility:
    | typeof BOARD_VISIBILITY_TYPES.PRIVATE
    | typeof BOARD_VISIBILITY_TYPES.PUBLIC;
  role:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  bgImg: string;
  spaceId: string;
}

export interface MemberObj {
  _id: string;
  profile: string;
  username: string;
  role:
    | typeof SPACE_ROLES.ADMIN
    | typeof SPACE_ROLES.NORMAL
    | typeof SPACE_ROLES.GUEST;
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

// select drop down option type
export interface Option {
  value: string;
  label: string;
}
