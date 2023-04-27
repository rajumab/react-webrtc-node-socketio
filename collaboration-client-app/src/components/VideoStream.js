import React, { useContext } from "react";
import { SocketClientContext } from "../SocketClientContext";

import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

const VideoStream = () => {
  const context = useContext(SocketClientContext);
  console.log("@@@@", context);
  return (
    <div className="videos">
      {context.stream && (
        <div className="video-self">
          <video
            playsInline
            muted
            ref={context.ownVideo}
            autoPlay
            className="Video"
          ></video>
        </div>
      )}

      {context.callAccepted && !context.callEnded && (
        <div className="video-third-party">
          <div className="video-third-party-c">
            {" "}
            <video
              playsInline
              muted={context.callMuted}
              autoPlay
              ref={context.callerVideo}
              className="Video"
            ></video>
            <div className="video-third-party-btns">
              {" "}
              {!context.callMuted ? (
                <button className="btn-mute" onClick={context.muteCallHandler}>
                  <MicIcon fontSize="medium" />
                </button>
              ) : (
                <button
                  className="btn-muted"
                  onClick={context.unMuteCallHandler}
                >
                  <MicOffIcon fontSize="medium" />
                </button>
              )}
              {context.callAccepted && !context.callEnded && (
                <button className="btn-end" onClick={context.leaveCallHandler}>
                  <CallEndIcon fontSize="medium" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default VideoStream;
