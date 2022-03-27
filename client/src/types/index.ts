import {
  BOARD,
  BOARD_LABEL_MODAL,
  BOARD_ROLES,
  BOARD_VISIBILITY_TYPES,
  CARD_DETAIL_MODAL,
  CONFIRM_DELETE_BOARD_MODAL,
  CONFIRM_DELETE_SPACE_MODAL,
  CONFIRM_LEAVE_BOARD_MODAL,
  CONFIRM_LEAVE_SPACE_MODAL,
  CONFIRM_REMOVE_BOARD_MEMBER_MODAL,
  CONFIRM_REMOVE_SPACE_MEMBER_MODAL,
  CREATE_BOARD_MODAL,
  CREATE_SPACE_MODAL,
  DEFAULT,
  ERROR,
  INFO,
  INVITE_SPACE_MEMBER_MODAL,
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

export interface Board {
  _id: string;
  name: string;
  description: string;
  bgImg: string;
  color: string;
  space: {
    _id: string;
    name: string;
  };
  lists: [];
  members: BoardMemberObj[];
  role:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  visibility:
    | typeof BOARD_VISIBILITY_TYPES.PRIVATE
    | typeof BOARD_VISIBILITY_TYPES.PUBLIC;
  isFavorite: boolean;
  favoriteId: string | null;
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
  spaceId?: string;
}

export interface BoardMemberObj {
  _id: string;
  username: string;
  profile: string;
  role:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  isSpaceAdmin: boolean;
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

export interface MemberObjBoard {
  _id: string;
  profile: string;
  username: string;
  isAdmin: boolean;
}

export interface MemberObjM {
  _id: string;
  profile: string;
  username: string;
}

export interface SettingsObj {
  icon: string;
  name: string;
  description: string;
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
  modalType:
    | typeof CREATE_SPACE_MODAL
    | typeof CREATE_BOARD_MODAL
    | typeof INVITE_SPACE_MEMBER_MODAL
    | typeof CONFIRM_LEAVE_SPACE_MODAL
    | typeof CONFIRM_REMOVE_SPACE_MEMBER_MODAL
    | typeof CONFIRM_DELETE_SPACE_MODAL
    | typeof CONFIRM_LEAVE_BOARD_MODAL
    | typeof CONFIRM_REMOVE_BOARD_MEMBER_MODAL
    | typeof CONFIRM_DELETE_BOARD_MODAL
    | typeof CARD_DETAIL_MODAL
    | typeof BOARD_LABEL_MODAL
    | null;
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

// select drop down option type
export interface OptionWithSub {
  value: string;
  label: string;
  sub: string;
}

// list obj
export interface ListObj {
  _id: string;
  name: string;
  pos: string;
}

export interface CardObj {
  _id: string;
  listId: string;
  pos: string;
  coverImg: string | null;
  color: string;
  name: string;
  description: string;
  isComplete: boolean;
  dueDate: string | null;
  members: MemberObjM[] | null;
  labels: LabelObj[] | null;
  comments: number | null;
}

export interface CardObjExt {
  _id: string;
  listId: string;
  pos: string;
  coverImg: string | null;
  color: string;
  name: string;
  description: string;
  spaceId: string;
  boardId: string;
  isComplete: boolean;
  dueDate: string | null;
  members: MemberObjM[] | null;
  labels: LabelObj[] | null;
  comments: number | null;
}

export interface LabelObj {
  _id: string;
  name: string | null;
  color: string;
}

export interface LabelObjCard {
  _id: string;
  name: string | null;
  color: string;
  pos: number;
  isPresent: boolean;
}

export interface CommentObj {
  _id: string;
  comment: string;
  createdAt: string;
  isUpdated: boolean;
  user: MemberObjBoard;
}

export interface CardDetailObj {
  _id: string;
  listId: string;
  pos: string;
  coverImg: string;
  color: string;
  name: string;
  isComplete: boolean;
  dueDate: string | null;
  description: string | null;
  members: MemberObjM[] | null;
  labels: LabelObj[] | null;
  comments: CommentObj[] | null;
  role:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

export interface BoardLabel {
  _id: string;
  name: string | null;
  color: string;
  pos: number;
}
