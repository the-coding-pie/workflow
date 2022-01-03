export interface UserObj {
  _id: string;
  username: string;
  profile: string;
  joinedAt: string;
}

export interface ProjectObj {
  _id: string;
  name: string;
  icon: string | null;
  boards: BoardObj[];
}

export interface BoardObj {
  _id: string;
  name: string;
  color: string;
  img?: string;
}
