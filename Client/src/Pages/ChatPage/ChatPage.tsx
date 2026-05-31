import { useMutation, useQuery } from "@apollo/client/react";
import {
  LogOut_MUTATION,
  SEND_MESSAGE_MUTATION,
} from "../../component/graphql/Mutation";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  GET_CURRENT_USER_QUERY,
  GET_MESSSAGES_QUERY,
} from "../../component/graphql/Query";
import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../../Socket";
import type {
  getmessageType,
  sentMessageType,
} from "../../component/graphql/client";

export default function ChatPage() {
  const [textinput, setTextinput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [logoutUser] = useMutation(LogOut_MUTATION, {
    refetchQueries: [{ query: GET_CURRENT_USER_QUERY }],
  });
  const handleLogout = async () => {
    await logoutUser();
    navigate("/register");
    toast("logout successfylly", {
      position: "top-right",
      type: "success",
    });
  };

  const { data, loading, refetch } =
    useQuery<getmessageType>(GET_MESSSAGES_QUERY);

  const handleNewMessage = useCallback(() => {
    refetch();
  }, [refetch]);
  useEffect(() => {
    // socket.connect();
    socket.on("connect", () => {
      console.log("socekt id: ", socket.id);
    });
    socket.on("newMessage", (message) => {
      console.log("New message received : ", message);
      handleNewMessage();
    });
    return () => {
      socket.off("newMessage");
      // socket.disconnect()
    };
  }, [handleNewMessage]);

  const [sendMessage] = useMutation<sentMessageType>(SEND_MESSAGE_MUTATION);

  const handleSendMessage = async () => {
    if (!textinput.trim()) return;
    const response = await sendMessage({
      variables: {
        text: textinput,
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div>Chat Page</div>
      <br />
      <button
        onClick={handleLogout}
        style={{ padding: "10px 20px", fontSize: "18px" }}
      >
        Logout
      </button>
      <div style={{ display: "flex", flexDirection: "column", height: "80vh" }}>
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
        <div style={{ display: "flex", padding: "1rem", gap: "0.5rem" }}>
          <input
            type="text"
            value={textinput}
            onChange={(e) => setTextinput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "0.5rem" }}
          />
        </div>
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </>
  );
}
