import {
  createElement as c,
  useEffect,
  useState,
} from "../../../../packages/remini/lib";
import { getFriendlyTime } from "../utils/date";
import Author from "./Author";
import Avatar from "./Avatar";
import { LOADING_TIME, TEXT_SECONDARY } from "../constants";
import { posts, PostType, users } from "../data";
import LoginForm from "./LoginForm";
import { SessionContext } from "./SessionContext";
import AutoScale from "../ui/AutoScale";

const Post = ({ author, content, timestamp }: PostType) => {
  const time = getFriendlyTime(new Date(timestamp * 1000));

  return (
    <div class="p-4">
      <div class="flex space-x-3">
        <Avatar author={author} />
        <div class="flex-1">
          <div class="flex">
            <Author author={author} />
            <div
              class={`ml-1 ${TEXT_SECONDARY}`}
            >{`@${users[author].login} · ${time}`}</div>
          </div>
          <div class={`${TEXT_SECONDARY}`}>{content}</div>
        </div>
      </div>
    </div>
  );
};

const PlaceholderPost = () => {
  return (
    <div class="p-4">
      <div class="flex space-x-3">
        <div class="rounded-full bg-gray-200 h-12 w-12"></div>
        <div class="flex-1 space-y-3 py-1">
          <div class="flex space-x-1">
            <div class="h-3 bg-gray-200 rounded w-1/5"></div>
            <div class="h-3 bg-gray-200 rounded w-1/6"></div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PostType[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setData(posts);
      setLoading(false);
    }, LOADING_TIME);
  }, []);

  return (
    <div class="mx-auto border-l border-r" style={{ width: "600px" }}>
      <div class="border-b border-gray-200 p-4 flex">
        <div class="rounded-full bg-gray-400 h-12 w-12"></div>
        <AutoScale
          class="flex flex-1 text-xl ml-3 focus:outline-none"
          placeholder="What's happening?"
        />
      </div>
      {loading ? (
        <div class="divide-y">
          <PlaceholderPost />
          <PlaceholderPost />
          <PlaceholderPost />
          <PlaceholderPost />
        </div>
      ) : (
        <div class="divide-y">
          {data.map((post) => (
            <Post {...post} />
          ))}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  return (
    <SessionContext.Provider value={{ token, setToken }}>
      <div class="w-screen h-screen flex justify-center">
        {token ? <Page /> : <LoginForm />}
      </div>
    </SessionContext.Provider>
  );
};

export default App;
