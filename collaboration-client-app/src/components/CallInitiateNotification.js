import React, { useContext } from "react";
import { SocketClientContext } from "../SocketClientContext";
import "../App.css";

const CallInitiateNotification = () => {
  const { call, callAccepted, leaveCallHandler } =
    useContext(SocketClientContext);

  return (
    <>
      {call.isReceivingCall && call.isInitiator && !callAccepted && (
        <div className="overlay">
          <div className="popup">
            <h1>Calling....</h1>
            <button className="popup-hangup" onClick={leaveCallHandler}>
              Hang Up
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CallInitiateNotification;
