export interface getmessageSubType {
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

interface curUser {
  id: number;
  email: string;
  username: string;
  isOnline: boolean;
  lastSeen: string;
}
export interface getAuthenticUserType {
  currentUser:{
    user:curUser
  }
}

interface UsersData {
  createdAt: string;
  email: string;
  id: number;
  isOnline: string;
  username: string;
  lastSeen: string;
}
export interface getAllUserType {
  getUsers: UsersData[];
}
