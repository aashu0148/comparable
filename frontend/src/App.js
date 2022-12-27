import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";

import Search from "components/Search/Search";
import Home from "components/Home/Home";
import Navbar from "components/Navbar/Navbar";
import FashionEntryPage from "components/FashionEntryPage/FashionEntryPage";

import { getConnection } from "api/connection/connection";
import { themeColors } from "constants.js";

import "./main.scss";

let socket;
let backendUrl = process.env.REACT_APP_BACKEND_URL;
function App() {
  const isDarkTheme =
    localStorage.getItem("isDarkTheme") == "true" ? true : false;
  const [connectionId, setConnectionId] = useState("");
  const [isConnectedToSocket, setIsConnectedToSocket] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [userName, setUserName] = useState(localStorage.getItem("userName"));

  const getConnectionId = () => {
    getConnection()
      .then((res) => {
        if (!res) return;

        const connectionId = res.data.connectionId;
        if (!connectionId) {
          setErrorMsg("Can't establish connection");
          return;
        }
        setConnectionId(connectionId);
        socket = io.connect(`${backendUrl}/${connectionId}`);
        listenToConnection();
      })
      .catch((err) => {
        console.log(
          "Error establishing connection. Please refresh and try again.",
          err
        );
        setErrorMsg(
          "Error establishing connection. Please refresh and try again."
        );
      });
  };

  const listenToConnection = () => {
    socket.on("connect", function () {
      setIsConnectedToSocket(socket.connected);
    });
    socket.on("disconnect", function () {
      setIsConnectedToSocket(socket.connected);
    });
  };

  useEffect(() => {
    if (!userName) return;
    getConnectionId();
    return () => {
      if (socket?.connected) {
        socket.disconnect();
        socket.close();
      }
    };
  }, [userName]);

  useEffect(() => {
    if (isDarkTheme) {
      const root = document.documentElement;

      Object.keys(themeColors.dark).forEach((item) => {
        root.style.setProperty(`--${item}`, themeColors.dark[item]);
      });
    }
  }, []);

  return (
    <div className={"app"}>
      <Toaster
        toastOptions={{
          duration: 4000,
          position: "bottom-right",
          style: { marginBottom: "30px", marginLeft: "30px" },
        }}
      />
      {errorMsg && <p className="global-error">{errorMsg}</p>}
      <Router>
        <Navbar
          isConnectedToSocket={isConnectedToSocket ? true : false}
          isConnectingToSocket={typeof isConnectedToSocket !== "boolean"}
          connectionId={connectionId}
          setName={(name) => setUserName(name)}
        />
        <Routes>
          <Route
            path="/search/:category/*"
            element={
              <Search
                socket={socket}
                isConnectedToSocket={isConnectedToSocket ? true : false}
                isConnectingToSocket={typeof isConnectedToSocket !== "boolean"}
                connectionId={connectionId}
              />
            }
          />
          <Route
            path="/search/fashionSelect"
            element={
              <FashionEntryPage
                socket={socket}
                isConnectedToSocket={isConnectedToSocket ? true : false}
                isConnectingToSocket={typeof isConnectedToSocket !== "boolean"}
                connectionId={connectionId}
              />
            }
          />
          <Route path="/" element={<Home />} />
          <Route
            path="/*"
            element={
              <div>
                <h2>Page not found</h2>
              </div>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
