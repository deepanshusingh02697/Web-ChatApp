import { gql } from "@apollo/client";

export const GET_CURRENT_USER_QUERY = gql`
  query Query {
    currentUser {
      alert
      success
      user {
        email
        username
        isOnline
      }
    }
  }
`;

export const GET_MESSSAGES_QUERY = gql`
  query Query {
    getMessages {
      createdAt
      id
      senderId
      text
    }
  }
`;
