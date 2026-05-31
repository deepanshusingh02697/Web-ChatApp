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
    success:Boolean
    alert:String
}

type Message{
    id:Int
    text:String
    createdAt:String
    senderId:String
}
type MessagePayload{
    message:Message!
    alert:String
}

type Query{
    currentUser:AuthPayload!
    getMessages:[Message] #return array of message objects
}
type Mutation{
    signUp(username:String!,email:String!,password:String!):AuthPayload!
    logIn(email:String!,password:String!):AuthPayload!
    logOut:Boolean!

    sendMessage(text:String!):MessagePayload!
}
`;
