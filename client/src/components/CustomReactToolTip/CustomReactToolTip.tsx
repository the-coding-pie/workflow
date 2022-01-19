import React from "react";
import ReactTooltip, { Place } from "react-tooltip";

interface Props {
  id: string;
  place?: Place;
}

const CustomReactToolTip = ({ id, place }: Props) => {
  return <ReactTooltip id={id} place={place} />;
};

export default CustomReactToolTip;
