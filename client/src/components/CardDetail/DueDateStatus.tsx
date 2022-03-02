import React from "react";
import { DUE_DATE_STATUSES } from "../../types/constants";
import { getStatus } from "../../utils/helpers";

interface Props {
  date: string;
  isComplete: boolean;
}

const DueDateStatus = ({ date, isComplete }: Props) => {
  const status = getStatus(date, isComplete);

  let component = null;

  switch (status) {
    case DUE_DATE_STATUSES.COMPLETE:
      component = <div className="bg-green-400  p-0.5 text-sm rounded text-white">Complete</div>;
      break;
    case DUE_DATE_STATUSES.OVERDUE:
      component = <div className="bg-red-400  p-0.5 text-sm rounded text-white">Overdue</div>;
      break;
    default:
      return null;
  }

  return <div className="due-date-status ml-2">{component && component}</div>;
};

export default DueDateStatus;
