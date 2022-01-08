import React from "react";

interface Props {
  src?: string;
  alt?: string;
  classes?: string;
  onClick?: () => void;
}

const Profile = ({ src, alt, classes, onClick }: Props) => {
  return src ? (
    <img
      className={`w-8 h-8 rounded-full ${classes ? classes : ""}`}
      onClick={onClick}
      src={src}
      alt={alt!}
    />
  ) : (
    <div
      className={`w-8 h-8 rounded-full ${classes ? classes : ""}`}
      onClick={onClick}
    >
      *
    </div>
  );
};

export default Profile;
