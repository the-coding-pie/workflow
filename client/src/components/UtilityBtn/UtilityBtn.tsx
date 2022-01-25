import ReactTooltip from "react-tooltip";
import { IconType } from "react-icons";

interface Props {
  Icon: IconType;
  label: string;
  classes?: string;
  iconSize?: number;
  iconColor?: string;
  iconFillColor?: string;
  iconClasses?: string;
  isSubmitting?: boolean;
  onClick?: Function;
  color?: string;
  tooltipPosition?: "bottom" | "right" | "left" | "top";
}

const UtilityBtn = ({
  Icon,
  label,
  classes,
  iconColor,
  iconFillColor,
  iconSize = 18,
  iconClasses,
  onClick,
  isSubmitting = false,
  color = "primary",
  tooltipPosition = "bottom",
}: Props) => {
  return (
    <>
      <button
        type="button"
        data-tip
        data-for={label}
        aria-label={label}
        onClick={(e) => onClick && onClick(e)}
        className={`
       flex items-center justify-center disabled:opacity-30 ${
         isSubmitting === false
           ? `hover:bg-${color}-50 hover:border-${color}-200 hover:text-${color}-600`
           : ``
       }   ${classes}`}
        disabled={isSubmitting ? true : false}
      >
        <Icon
          color={iconColor ? iconColor : "currentColor"}
          fill={iconFillColor ? iconFillColor : "none"}
          size={iconSize}
          className={`icon ${iconClasses}`}
        />
      </button>
      {label && (
        <ReactTooltip
          id={label}
          place={tooltipPosition}
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
