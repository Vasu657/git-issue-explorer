import { useStorage } from "@/context/StorageContext";

export function useAuthToken() {
  const { token, setToken, user, scopes, isLoadingUser } = useStorage();
  return { token, setToken, user, scopes, isLoadingUser };
}
