import React from "react";
import ReactTooltip, { Place } from "react-tooltip";

interface Props {
  place?: Place;
}

const CustomReactToolTip = ({ place }: Props) => {
  return <ReactTooltip place={place} />;
};

export default CustomReactToolTip;
