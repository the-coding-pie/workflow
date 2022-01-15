import {
  CREATE_SPACE_MODAL,
  DEFAULT,
  ERROR,
  INFO,
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

export interface SpaceObj {
  _id: string;
  name: string;
  icon: string | null;
  isGuestSpace: boolean;
  boards: BoardObj[];
}

export interface BoardObj {
  _id: string;
  name: string;
  color: string;
  img?: string;
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
  modalType: typeof CREATE_SPACE_MODAL | null;
  modalProps?: any;
  modalTitle?: string;
  showCloseBtn?: boolean;
  bgColor?: string;
  textColor?: string;
}
