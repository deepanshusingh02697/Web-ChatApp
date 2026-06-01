import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
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
import { useEffect, useRef, useState } from "react";
import { socket } from "../../Socket";
import type {
  getAllUserType,
  getAuthenticUserType,
  getmessageType,
  sentMessageType,
} from "../../component/graphql/client";
import Header from "../../component/Header/Header";
import styles from "./ChatPage.module.css";
import { BsChatText } from "react-icons/bs";
import { IoSend } from "react-icons/io5";

export default function ChatPage() {
  const client = useApolloClient();
  const [textinput, setTextinput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const navigate = useNavigate();

  const [logoutUser] = useMutation(LogOut_MUTATION, {
    refetchQueries: [{ query: GET_AUTHENTIC_USER_QUERY }],
  });

  const handleLogout = async () => {
    await logoutUser();
    //clear cache to protected so protected route redirect
    await client.clearStore();
    navigate("/register");
    toast("Logged out successfully", {
      position: "top-right",
      type: "success",
    });
  };

  const { data, loading } = useQuery<getmessageType>(GET_MESSSAGES_QUERY, {
    variables: { receiverId: selectedUserId?.id },
    skip: !selectedUserId,
  });

  useEffect(() => {
    if (data?.getMessages) {
      setMessages(data.getMessages);
    }
  }, [data]);
  const { data: allUsers } = useQuery<getAllUserType>(GET_ALL_USER_QUERY);
  const { data: curUser } = useQuery<getAuthenticUserType>(
    GET_AUTHENTIC_USER_QUERY,
  );

  const currentUserId = curUser?.currentUser?.user?.id;

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on("connect", () => {
      console.log("socket : ", socket.id);
    });
    socket.on("newRoomMessage", (newMessage) => {
      console.log("received : ", newMessage);
      setMessages((prev) => [...prev, newMessage]);
      setTextinput("");
    });
    return () => {
      socket.off("connect");
      socket.off("newRoomMessage");
    };
  }, []);

  //when user switch clear messages
  useEffect(() => {
    setMessages([]);
  }, [selectedUserId]);


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
      toast("Something went wrong!", {
        position: "top-right",
        type: "warning",
      });
      return;
    }
  };

  const handleSelectedUser = (user: any) => {
    setSelectedUserId(user);
    const roomId = [currentUserId, user.id].sort().join("-");
    console.log("room id:", roomId);
    socket.emit("joinRoom", roomId);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.container}>
      <Header
        username={curUser?.currentUser?.user?.username ?? ""}
        onLogout={handleLogout}
      />

      <div className={styles.body}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Contacts</div>
          {allUsers?.getUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectedUser(user)}
              className={`${styles.userItem} ${
                selectedUserId?.id === user.id ? styles.userItemActive : ""
              }`}
            >
              <div className={styles.avatar}>
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{user.username}</div>
                <div
                  className={`${styles.userStatus} ${
                    user.isOnline ? styles.statusOnline : styles.statusOffline
                  }`}
                >
                  {user.isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.chatArea}>
          {selectedUserId ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatAvatar}>
                  {selectedUserId?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={styles.chatUsername}>
                    {selectedUserId?.username}
                  </div>
                  <div className={styles.chatUserStatus}>
                    {selectedUserId?.isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
              <div className={styles.messages}>
                {loading && (
                  <div className={styles.loadingText}>Loading messages...</div>
                )}

                {/* {data?.getMessages.map((msg) => { */}
                {messages.map((msg) => {
                  const isMe = Number(msg.senderId) === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`${styles.messageRow} ${
                        isMe ? styles.messageRowMe : styles.messageRowOther
                      }`}
                    >
                      <div
                        className={`${styles.bubble} ${
                          isMe ? styles.bubbleMe : styles.bubbleOther
                        }`}
                      >
                        {/* {!isMe && (
                          <div className={styles.senderName}>
                            {msg.sender?.username}
                          </div>
                        )} */}
                        {msg.text}
                        <div className={styles.messageTime}>
                          {/* {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} */}
                          Date
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className={styles.inputBar}>
                <input
                  type="text"
                  value={textinput}
                  onChange={(e) => setTextinput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className={styles.input}
                />
                <button onClick={handleSendMessage} className={styles.sendBtn}>
                  <IoSend />
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <BsChatText />
              </div>
              <div className={styles.emptyTitle}>Welcome to ChatApp</div>
              <div className={styles.emptySubtitle}>
                Select a contact to start chatting
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
