export const typeDefs = `#graphql

type User{
    id:Int
    username:String!
    email:String!
    password:String
    isOnline:Boolean!
    lastSeen:String
    createdAt:String!
}
type AuthPayload{
    user:User!
}

type Message{
    id:Int
    text:String
    createdAt:String

    senderId:Int
    receiverId:Int
}
type MessagePayload{
    message:Message!
}

type Query{
    currentUser:AuthPayload!
    getMessages(receiverId:Int!):[Message] #return array of message objects
    getUsers:[User]# to show all users to individual in sidebar
}
type Mutation{
    signUp(username:String!,email:String!,password:String!):AuthPayload!
    logIn(email:String!,password:String!):AuthPayload!
    logOut:Boolean!

    sendMessage(text:String!,receiverId:Int!):MessagePayload!
    # receiveMessage(text:String!):MessagePayload!
}
`;
