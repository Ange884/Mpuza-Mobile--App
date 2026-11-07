import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Reaction = 'like' | 'dislike';

type UserData = {
  skills: string[];
  favorites: string[];
  applied: string[];
  reactions: Record<string, Reaction>;
  skillsBannerClosed: boolean;
};

type UserDataContextValue = UserData & {
  ready: boolean;
  setSkills: (skills: string[]) => void;
  toggleFavorite: (jobId: string) => void;
  apply: (jobId: string) => void;
  react: (postId: string, reaction: Reaction) => void;
  closeSkillsBanner: () => void;
};

const STORAGE_KEY = 'mpuza:userdata:v1';

const EMPTY: UserData = { skills: [], favorites: [], applied: [], reactions: {}, skillsBannerClosed: false };

const UserDataContext = createContext<UserDataContextValue | null>(null);

/**
 * Client-side data that lives on the device (AsyncStorage):
 * skills, favourite jobs, applications and post reactions.
 */
export function UserDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UserData>(EMPTY);
  const [ready, setReady] = useState(false);

  // Load once on start.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setData({ ...EMPTY, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Save after every change (once loaded, so we never overwrite with the empty state).
  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const value: UserDataContextValue = {
    ...data,
    ready,
    setSkills: (skills) => setData((d) => ({ ...d, skills })),
    toggleFavorite: (id) => setData((d) => ({ ...d, favorites: toggle(d.favorites, id) })),
    apply: (id) => setData((d) => (d.applied.includes(id) ? d : { ...d, applied: [...d.applied, id] })),
    react: (postId, reaction) =>
      setData((d) => {
        const reactions = { ...d.reactions };
        if (reactions[postId] === reaction) delete reactions[postId];
        else reactions[postId] = reaction;
        return { ...d, reactions };
      }),
    closeSkillsBanner: () => setData((d) => ({ ...d, skillsBannerClosed: true })),
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const value = useContext(UserDataContext);
  if (!value) throw new Error('useUserData must be used inside <UserDataProvider>');
  return value;
}
