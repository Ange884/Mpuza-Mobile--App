import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { setAdReaction } from '@/api/mpuza';
import { getToken } from '@/api/session';

type Reaction = 'like' | 'dislike';

type UserData = {
  skills: string[];
  favorites: string[];
  applied: string[];
  reactions: Record<string, Reaction>;
  skillsBannerClosed: boolean;
  profilePhotoUri: string | null;
};

type UserDataContextValue = UserData & {
  ready: boolean;
  setSkills: (skills: string[]) => void;
  replaceFavorites: (ids: string[]) => void;
  mergeFavorites: (ids: string[]) => void;
  toggleFavorite: (jobId: string) => void;
  apply: (jobId: string) => void;
  react: (postId: string, reaction: Reaction) => void;
  closeSkillsBanner: () => void;
  setProfilePhotoUri: (uri: string | null) => void;
};

const STORAGE_KEY = 'mpuza:userdata:v1';

const EMPTY: UserData = {
  skills: [],
  favorites: [],
  applied: [],
  reactions: {},
  skillsBannerClosed: false,
  profilePhotoUri: null,
};

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

  const replaceFavorites = useCallback((ids: string[]) => setData((d) => ({ ...d, favorites: ids })), []);
  const mergeFavorites = useCallback(
    (ids: string[]) => setData((d) => ({ ...d, favorites: [...new Set([...d.favorites, ...ids])] })),
    [],
  );

  const value: UserDataContextValue = {
    ...data,
    ready,
    setSkills: (skills) => setData((d) => ({ ...d, skills })),
    replaceFavorites,
    mergeFavorites,
    toggleFavorite: (id) => setData((d) => ({ ...d, favorites: toggle(d.favorites, id) })),
    apply: (id) => setData((d) => (d.applied.includes(id) ? d : { ...d, applied: [...d.applied, id] })),
    react: (postId, reaction) => {
      setData((d) => {
        const reactions = { ...d.reactions };
        if (reactions[postId] === reaction) delete reactions[postId];
        else reactions[postId] = reaction;
        return { ...d, reactions };
      });
      if (/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(postId)) {
        getToken()
          .then((token) => {
            if (token) return setAdReaction(postId, reaction);
          })
          .catch(() => {});
      }
    },
    closeSkillsBanner: () => setData((d) => ({ ...d, skillsBannerClosed: true })),
    setProfilePhotoUri: (profilePhotoUri) => setData((d) => ({ ...d, profilePhotoUri })),
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const value = useContext(UserDataContext);
  if (!value) throw new Error('useUserData must be used inside <UserDataProvider>');
  return value;
}
