import { format } from "date-fns";
import React from "react";
import {
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import { HiMenuAlt2, HiOutlineChatAlt, HiOutlineClock } from "react-icons/hi";
import { CardObj } from "../../types";
import { DUE_DATE_STATUSES } from "../../types/constants";
import { getStatus } from "../../utils/helpers";
import Profile from "../Profile/Profile";

interface Props {
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  card: CardObj;
}

const CardDummy = ({ card, provided, snapshot }: Props) => {
  return provided ? (
    <li
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="bg-white mb-2 rounded shadow hover:bg-slate-100 cursor-grabbing font-normal text-gray-900 text-sm list-none"
    >
      {/* card cover */}
      {(card.coverImg || card.color) && (
        <div className="cover mb-2 w-full rounded-t">
          {card.coverImg ? (
            <img className="img w-full h-full rounded-t" src={card.coverImg} />
          ) : (
            <div
              className="color w-full h-full rounded-t"
              style={{
                height: "100px",
                background: `${card.color}`,
              }}
            ></div>
          )}
        </div>
      )}

      {/* labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="labels flex items-center flex-wrap gap-2 px-2 my-2">
          {card.labels
            .sort((a: any, b: any) =>
              a.pos > b.pos ? 1 : b.pos > a.pos ? -1 : 0
            )
            .map((l) => (
              <div
                key={l._id}
                className="label text-xs p-1 rounded font-semibold text-white"
                style={{
                  background: l.color,
                }}
              >
                {l.name && l.name.length > 28
                  ? l.name?.slice(0, 28) + "..."
                  : l.name}
              </div>
            ))}
        </div>
      )}

      {/* name */}
      <div className="name px-2 my-2">
        {card.name.length > 100 ? card.name.slice(0, 100) + "..." : card.name}
      </div>

      {/* bottom */}
      <div className="extras flex items-center justify-between my-2 px-2 text-slate-600">
        <div className="left flex items-center gap-x-2">
          {/* due date */}
          {card.dueDate && (
            <div
              className={`due-date flex items-center rounded text-xs ${
                card.isComplete
                  ? "bg-green-400 text-white p-0.5"
                  : getStatus(card.dueDate, card.isComplete) ===
                    DUE_DATE_STATUSES.OVERDUE
                  ? "bg-red-400 text-white p-0.5"
                  : ""
              }`}
            >
              <HiOutlineClock size={14} className="mr-1" />
              <span className="date">
                {format(new Date(card.dueDate), "dd MMM, yyyy")}
              </span>
            </div>
          )}

          {/* description */}
          {card.description && <HiMenuAlt2 size={16} />}

          {/* comments */}
          {card.comments ? (
            <div className="comments flex items-center">
              <HiOutlineChatAlt size={16} className="mr-0.5" />
              <span>{card.comments}</span>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="members flex items-center gap-x-1">
          {card.members &&
            (card.members.length > 3 ? (
              <>
                {card.members.slice(0, 3).map((m) => (
                  <Profile
                    key={m._id}
                    classes="w-7 h-7 cursor-default"
                    src={m.profile}
                    styles={{
                      width: "1.65rem",
                      height: "1.65rem",
                    }}
                  />
                ))}
                <div>+{card.members.slice(3).length}</div>
              </>
            ) : (
              card.members.map((m) => (
                <Profile
                  key={m._id}
                  classes="w-7 h-7 cursor-default"
                  src={m.profile}
                  styles={{
                    width: "1.65rem",
                    height: "1.65rem",
                  }}
                />
              ))
            ))}
        </div>
      </div>
    </li>
  ) : (
    <li className="bg-white rounded mb-2 shadow hover:bg-slate-100 cursor-pointer font-normal text-gray-900 text-sm list-none">
      {/* card cover */}
      {(card.coverImg || card.color) && (
        <div className="cover mb-2 w-full rounded-t">
          {card.coverImg ? (
            <img className="img w-full h-full rounded-t" src={card.coverImg} />
          ) : (
            <div
              className="color w-full h-full rounded-t"
              style={{
                height: "100px",
                background: `${card.color}`,
              }}
            ></div>
          )}
        </div>
      )}

      {/* labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="labels flex items-center flex-wrap gap-2 px-2 my-2">
          {card.labels
            .sort((a: any, b: any) =>
              a.pos > b.pos ? 1 : b.pos > a.pos ? -1 : 0
            )
            .map((l) => (
              <div
                key={l._id}
                className="label text-xs p-1 rounded font-semibold text-white"
                style={{
                  background: l.color,
                }}
              >
                {l.name && l.name.length > 28
                  ? l.name?.slice(0, 28) + "..."
                  : l.name}
              </div>
            ))}
        </div>
      )}

      {/* name */}
      <div className="name px-2 my-2">
        {card.name.length > 100 ? card.name.slice(0, 100) + "..." : card.name}
      </div>

      {/* bottom */}
      <div className="extras flex items-center justify-between my-2 px-2 text-slate-600">
        <div className="left flex items-center gap-x-2">
          {/* due date */}
          {card.dueDate && (
            <div
              className={`due-date flex items-center rounded text-xs ${
                card.isComplete
                  ? "bg-green-400 text-white p-0.5"
                  : getStatus(card.dueDate, card.isComplete) ===
                    DUE_DATE_STATUSES.OVERDUE
                  ? "bg-red-400 text-white p-0.5"
                  : ""
              }`}
            >
              <HiOutlineClock size={14} className="mr-1" />
              <span className="date">
                {format(new Date(card.dueDate), "dd MMM, yyyy")}
              </span>
            </div>
          )}

          {/* description */}
          {card.description && <HiMenuAlt2 size={16} />}

          {/* comments */}
          {card.comments ? (
            <div className="comments flex items-center">
              <HiOutlineChatAlt size={16} className="mr-0.5" />
              <span>{card.comments}</span>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="members flex items-center gap-x-1">
          {card.members &&
            (card.members.length > 3 ? (
              <>
                {card.members.slice(0, 3).map((m) => (
                  <Profile
                    key={m._id}
                    classes="w-7 h-7 cursor-default"
                    src={m.profile}
                    styles={{
                      width: "1.65rem",
                      height: "1.65rem",
                    }}
                  />
                ))}
                <div>+{card.members.slice(3).length}</div>
              </>
            ) : (
              card.members.map((m) => (
                <Profile
                  key={m._id}
                  classes="w-7 h-7 cursor-default"
                  src={m.profile}
                  styles={{
                    width: "1.65rem",
                    height: "1.65rem",
                  }}
                />
              ))
            ))}
        </div>
      </div>
    </li>
  );
};

export default CardDummy;
