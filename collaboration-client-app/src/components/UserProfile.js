import React, { useContext } from "react";
import { SocketClientContext } from "../SocketClientContext";

// css import

import "../styles/component/comp-users.css";

const Users = () => {
  const context = useContext(SocketClientContext);
  return (
    <div className="header">
      {context.me && (
        <div className="header-item">
          <span>
            Logged in as : <b>{context.me.name}</b>
          </span>
        </div>
      )}
    </div>
  );
};

export default Users;
