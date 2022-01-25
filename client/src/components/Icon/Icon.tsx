import React from "react";

interface Props {
  src: string;
  alt: string;
  classes?: string;
  size?: number;
}

const Icon = ({ src, alt, classes, size = 48 }: Props) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded ${classes}`}
      style={{
        width: size,
        height: size,
      }}
    />
  );
};

export default Icon;
