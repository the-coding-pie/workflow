import React from "react";
import { HiChevronDoubleUp } from "react-icons/hi";
import AdminIcon from "../../assets/icons/admin.png";

interface Props {
  src?: string;
  alt?: string;
  classes?: string;
  isAdmin?: boolean;
  styles?: Object;
  onClick?: () => void;
}

const Profile = ({ src, alt, isAdmin, classes, onClick, styles }: Props) => {
  return (
    <div className="relative">
      {src ? (
        <img
          referrerPolicy="no-referrer"
          className={`w-8 h-8 rounded-full ${classes ? classes : ""}`}
          onClick={onClick}
          src={src}
          alt={alt!}
          style={styles ? styles : {}}
        />
      ) : (
        <div
          className={`w-8 h-8 rounded-full ${classes ? classes : ""}`}
          onClick={onClick}
          style={styles ? styles : {}}
        >
          *
        </div>
      )}

      {isAdmin && (
        <img
          src={AdminIcon}
          alt="admin-indicator"
          className="absolute bottom-0 right-0"
          style={{
            width: "11px",
          }}
        />
      )}
    </div>
  );
};

export default Profile;
