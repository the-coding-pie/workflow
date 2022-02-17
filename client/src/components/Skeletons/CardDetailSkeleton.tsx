import React from "react";
import Skeleton from "react-loading-skeleton";

const CardDetailSkeleton = () => {
  return (
    <div
      className="h-full w-full p-4"
      style={{
        minWidth: "600px",
      }}
    >
      <Skeleton className="name mb-2" height={30} />
      <Skeleton className="description" height={200} />

      <div className="comments mt-4">
        <Skeleton className="comments" height={40} />
        <Skeleton className="comments" height={40} />
        <Skeleton className="comments" height={40} />
      </div>
    </div>
  );
};

export default CardDetailSkeleton;
