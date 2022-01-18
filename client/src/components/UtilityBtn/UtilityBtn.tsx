import ReactTooltip from "react-tooltip";
import { IconType } from "react-icons";

interface Props {
  Icon: IconType;
  label: string;
  classes?: string;
  iconClasses?: string;
  isSubmitting?: boolean;
  onClick: Function;
  color?: string;
}

const UtilityBtn = ({
  Icon,
  label,
  classes,
  iconClasses,
  onClick,
  isSubmitting = false,
  color = "primary",
}: Props) => {
  return (
    <>
      <button
        type="button"
        data-tip
        data-for={label}
        aria-label={label}
        onClick={(e) => onClick()}
        className={`
       flex items-center justify-center disabled:opacity-30 mr-2 ${
         isSubmitting === false
           ? `hover:bg-${color}-50 hover:border-${color}-200 hover:text-${color}-600`
           : ``
       }   ${classes}`}
        disabled={isSubmitting ? true : false}
      >
        <Icon className={`icon ${iconClasses}`} />
      </button>
      {label && (
        <ReactTooltip
          id={label}
          place="bottom"
          effect="solid"
          className="bg-gray-700"
        >
          <span className="capitalize">{label}</span>
        </ReactTooltip>
      )}
    </>
  );
};

export default UtilityBtn;
