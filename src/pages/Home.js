import React, { useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidV4 } from "uuid";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  // Create a new room
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("New Room Created!");
  };

  // Join the room
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Room ID and Username are required!");
      return;
    }

    // Redirect to editor page
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  // Handle "Enter" key press
  const handleEnterPress = (e) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  return (
    <>
      <div className="homePageWrapper">
        <div className="formWrapper">
          <img className="rectangular-image" src="/Code.png" alt="Code-logo" />
          <div className="inputGroup">
            <h4 className="mainLabel">Paste Invitation Room ID</h4>
            <input
              type="text"
              className="inputBox"
              placeholder="ROOM ID"
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleEnterPress}
            />
            <input
              type="text"
              className="inputBox"
              placeholder="USERNAME"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleEnterPress}
            />
            <button className="btn joinBtn" onClick={joinRoom}>
              Join
            </button>
            <span className="createInfo">
              If you don't have an invite, create a&nbsp;
              <a onClick={createNewRoom} href="#" className="createNewBtn">
                New Room
              </a>
            </span>
          </div>
        </div>
      </div>
      <footer>
        <h4>
          Created with 💙 by&nbsp;
          <a href="https://github.com/Sharma-Akhil">Akhil Sharma</a>
        </h4>
      </footer>
    </>
  );
};

export default Home;
