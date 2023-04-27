import React, { useContext } from "react";
import { SocketClientContext } from "../SocketClientContext";

import "../styles/component/comp-users-list.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CallIcon from "@mui/icons-material/Call";
import ChatIcon from "@mui/icons-material/Chat";
const UserList = () => {
  const context = useContext(SocketClientContext);
  return (
    <>
      {/* <pre>{JSON.stringify(context.users)}</pre> */}
      {context.users && context.users.length === 1 && (
        <div className="user-list-none">
          <p>Uh oh! no users online</p>
        </div>
      )}
      {context.users &&
        context.users.length >= 1 &&
        context.users
          .filter((user) => user.socketId !== context.me.socketId)
          .map((user) => (
            <div className="user-list-online" key={user.socketId}>
              <div className="user-list-online-item">
                <AccountCircleIcon fontSize="large" />
                <div className="user-list-txt">{user.name}</div>
                <div className="user-list-btns">
                  <button
                    className="user-list-btn"
                    onClick={() => context.openIndividualHandler(user)}
                  >
                    <ChatIcon fontSize="medium" />
                  </button>
                  {!context.callAccepted && (
                    <button
                      className="user-list-btn"
                      onClick={() => context.callUserHandler(user.socketId)}
                    >
                      <CallIcon fontSize="medium" />
                    </button>
                  )}
                </div>
              </div>{" "}
            </div>
          ))}
    </>
  );
};

export default UserList;
