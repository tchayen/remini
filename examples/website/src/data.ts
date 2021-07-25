export type UserType = {
  fullName: string;
  login: string;
  avatar: string;
  following: number;
  followers: number;
  bio: string;
};

export type PostType = {
  author: number;
  content: string;
  timestamp: number;
};

export const users: UserType[] = [
  {
    fullName: "Alice",
    login: "alice",
    avatar: "bg-red-400",
    following: 0,
    followers: 8631,
    bio: "Celebrity. Probably.",
  },
  {
    fullName: "Bob",
    login: "bob",
    avatar: "bg-yellow-500",
    following: 10,
    followers: 456,
    bio: "Hi 👋",
  },
  {
    fullName: "Charlie",
    login: "charlie",
    avatar: "bg-yellow-300",
    following: 2,
    followers: 100,
    bio: "Tweets are my own.",
  },
  {
    fullName: "Dylan",
    login: "dylan",
    avatar: "bg-green-400",
    following: 590,
    followers: 330,
    bio: "React Native developer at some company. I like trains.",
  },
  {
    fullName: "Ethan",
    login: "ethan",
    avatar: "bg-blue-400",
    following: 2,
    followers: 0,
    bio: "",
  },
  {
    fullName: "Franklin",
    login: "franklin",
    avatar: "bg-purple-400",
    following: 153,
    followers: 1121,
    bio: "I don't know what to write here",
  },
];

export const posts: PostType[] = [
  {
    author: 0,
    content: "Setting up my twitter",
    timestamp: 1627207002,
  },
  {
    author: 1,
    content: "Anyone wants to hang out some time later today?",
    timestamp: 1627210082,
  },
  {
    author: 2,
    content: "Twitter profile balloons day it is!",
    timestamp: 1627202300,
  },
  {
    author: 3,
    content:
      "I woke up and had coffee. Can't wait to start eating a breakfast. And then lunch. And then, who knows, maybe I will have a dinner, maybe I will skip eating for the rest of the day, maybe I will prepare food for the morning.",
    timestamp: 1627201733,
  },
  {
    author: 4,
    content: "Lorem ipsum dolor sit amet",
    timestamp: 1627202798,
  },
  {
    author: 5,
    content: "I just had a good sandwich",
    timestamp: 1627214404,
  },
];
