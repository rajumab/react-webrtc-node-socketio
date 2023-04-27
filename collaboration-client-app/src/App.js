import "./App.css";
import "./styles/component/comp-content-window.css";
import CallNotification from "./components/CallReceiveNotification";
import UserList from "./components/UserList";
import UserProfile from "./components/UserProfile";
import VideoStream from "./components/VideoStream";
import CallInitiateNotification from "./components/CallInitiateNotification";
import ChatWindow from "./components/ChatWindow";
function App() {
  return (
    <div className="App">
      <UserProfile></UserProfile>
      <div className="content">
        <div className="content-side-bar">
          {" "}
          <UserList></UserList>
        </div>
        <div className="content-main-window">
          <div className="content-video-call">
            <CallInitiateNotification></CallInitiateNotification>
            <CallNotification></CallNotification>
            <VideoStream></VideoStream>
          </div>
          <div className="content-chat">
            <ChatWindow></ChatWindow>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
