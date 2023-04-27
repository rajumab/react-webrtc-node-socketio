import React, { useContext } from "react";

import { SocketClientContext } from "../SocketClientContext";
import "../App.css";

const CallNotification = () => {
  const { answerCallHandler, call, callAccepted } =
    useContext(SocketClientContext);
  return (
    <>
      {call.isReceivingCall && !call.isInitiator && !callAccepted && (
        <div className="overlay">
          <div
            className="popup"
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <h1>{call.name} is calling ....</h1>
            <button className="popup-answer" onClick={answerCallHandler}>
              Answer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CallNotification;
