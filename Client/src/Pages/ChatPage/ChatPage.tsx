import { useMutation, useQuery } from "@apollo/client/react";
import {
  LogOut_MUTATION,
  SEND_MESSAGE_MUTATION,
} from "../../component/graphql/Mutation";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  GET_ALL_USER_QUERY,
  GET_AUTHENTIC_USER_QUERY,
  GET_MESSSAGES_QUERY,
} from "../../component/graphql/Query";
import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../../Socket";
import type {
  getAllUserType,
  getAuthenticUserType,
  getmessageType,
  sentMessageType,
} from "../../component/graphql/client";

export default function ChatPage() {
  const [textinput, setTextinput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<any>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const [logoutUser] = useMutation(LogOut_MUTATION, {
    refetchQueries: [{ query: GET_AUTHENTIC_USER_QUERY }],
  });
  const handleLogout = async () => {
    await logoutUser();
    navigate("/register");
    toast("logout successfylly", {
      position: "top-right",
      type: "success",
    });
  };

  const { data, loading, refetch } = useQuery<getmessageType>(
    GET_MESSSAGES_QUERY,
    {
      variables: { receiverId: selectedUserId?.id },
      skip: !selectedUserId, //it will not fetch until user selected
    },
  );

  console.log("data is : ", data);

  const { data: allUsers } = useQuery<getAllUserType>(GET_ALL_USER_QUERY);

  console.log("current authentic user : ", allUsers?.getUsers);

  const handleNewMessage = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on("connect", () => {
      console.log("socekt id: ", socket.id);
    });
    socket.on("newMessage", (message) => {
      console.log("New message received : ", message);
      handleNewMessage();
    });
    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [handleNewMessage]);

  const [sendMessage] = useMutation<sentMessageType>(SEND_MESSAGE_MUTATION);

  const handleSendMessage = async () => {
    if (!textinput.trim()) return;
    const response = await sendMessage({
      variables: {
        text: textinput,
        receiverId: selectedUserId?.id,
      },
    });
    if (!response) {
      toast("Invalid credentials! login again ", {
        position: "top-right",
        type: "warning",
      });
      return;
    }
    setTextinput("");
  };

  const { data: curUser } = useQuery<getAuthenticUserType>(
    GET_AUTHENTIC_USER_QUERY,
  );
  console.log(" curUser ", curUser);

  const handleSelectedUser = (user: any) => {
    // console.log("user data is ", user);
    // console.log(
    //   "current authentic user in frontend : ",
    //   curUser?.currentUser?.user
    // );

    setSelectedUserId(user);
    //join the room for private message
    const roomId = [curUser?.currentUser?.user?.id, user.id].sort().join("-");
    console.log("make room id in client side and room id is : ", roomId);
    socket.emit("joinRoom", roomId);
  };
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 30px",
          borderBottom: "2px solid black",
        }}
      >
        <div>Chat Page</div>
        <button
          onClick={handleLogout}
          style={{ padding: "10px 20px", fontSize: "18px" }}
        >
          Logout
        </button>
      </div>
      <br />
      <div style={{ display: "flex", gap: "30px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "300px",
            borderRight: "2px solid black",
          }}
        >
          {allUsers?.getUsers.map((user) => {
            return (
              <>
                <div
                  key={user.id}
                  onClick={() => handleSelectedUser(user)}
                  style={{ background: "gray", cursor: "pointer" }}
                >
                  <span>{!user.isOnline ? "offline" : "online"}</span>
                  <span style={{ padding: "10px 20px" }}>{user.username}</span>
                  <div style={{ fontSize: "12px" }}>{user.createdAt}</div>
                </div>
              </>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "90vh",
            flex: 1,
          }}
        >
          <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {data?.getMessages.map((msg) => {
                return <div key={msg.id}>{msg.text}</div>;
              })}
              <div ref={bottomRef} />
            </div>
          </div>
          <div style={{ display: "grid", placeItems: "center" }}>
            <div
              style={{
                display: "flex",
                padding: "1rem",
                gap: "0.5rem",
                width: "80%",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={textinput}
                onChange={(e) => setTextinput(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "0.5rem" }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage}
              />
              <button
                onClick={handleSendMessage}
                style={{ padding: "10px 15px" }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
