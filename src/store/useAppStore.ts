import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;

    // You can add more global state here, like user preferences
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            theme: 'system',
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'habitflow-storage', // name of the item in storage (must be unique)
        }
    )
);
