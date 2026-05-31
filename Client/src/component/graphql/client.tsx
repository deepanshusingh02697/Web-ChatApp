interface getmessageSubType {
  createdAt: string;
  id: number;
  senderId: string;
  text: string;
  sender: {
    username: string;
  };
}
export interface getmessageType {
  getMessages: getmessageSubType[];
}
export interface sentMessageType {
    sendMessage: {
      alert: string;
      message: {
        id: number;
        senderId: string;
        text: string;
      };
    };
  }