import React from "react";

interface Props {
  _id: string;
}

const CardDetailModal = ({ _id }: Props) => {
  return <div>{_id} Card</div>;
};

export default CardDetailModal;
