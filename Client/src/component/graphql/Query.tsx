import { gql } from "@apollo/client";

export const GET_AUTHENTIC_USER_QUERY = gql`
  query Query {
    currentUser {
      user {
        id
        email
        # isOnline
        # lastSeen
        # username
        # createdAt
      }
    }
  }
`;

export const GET_MESSSAGES_QUERY = gql`
  # query Query {
  #   getMessages {
  #     createdAt
  #     id
  #     senderId
  #     text
  #   }
  # }
  query Query($receiverId: Int!) {
    getMessages(receiverId: $receiverId) {
      createdAt
      id
      receiverId
      senderId
      text
    }
  }
`;

export const GET_ALL_USER_QUERY = gql`
  query Query {
    getUsers {
      createdAt
      email
      id
      isOnline
      username
      lastSeen
    }
  }
`;
