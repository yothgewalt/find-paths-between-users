import { create } from "zustand";
import { persist } from "zustand/middleware";

import { User } from "@typings/user_model";

export interface UserState {
    user: User | null;
    setUser: (user: any) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set(() => ({ user })),
        }),
        {
            name: "_stateManagement",
            storage: {
                getItem: async (name) => {
                    const item = window.localStorage.getItem(name);
                    if (item === null) {
                        return null;
                    }

                    return JSON.parse(item);
                },
                setItem: (name, value) => {
                    const serializedValue = JSON.stringify(value);
                    window.localStorage.setItem(name, serializedValue);
                },
                removeItem: (name) => window.localStorage.removeItem(name),
            },
        }
    )
);
