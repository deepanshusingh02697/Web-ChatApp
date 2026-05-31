import { gql } from "@apollo/client";

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($username: String!, $email: String!, $password: String!) {
    signUp(username: $username, email: $email, password: $password) {
      alert
      success
      user {
        email
        isOnline
        lastSeen
        username
      }
    }
  }
`;

export const LOG_IN_MUTATION = gql`
  mutation Mutation($email: String!, $password: String!) {
    logIn(email: $email, password: $password) {
      alert
      success
      user {
        email
        lastSeen
        username
        isOnline
        id
      }
    }
  }
`;

export const LogOut_MUTATION = gql`
  mutation Mutation {
    logOut
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation Mutation($text: String!, $receiverId: Int!) {
    sendMessage(text: $text, receiverId: $receiverId) {
      message {
        receiverId
        senderId
        id
        text
        createdAt
      }
    }
  }
`;
