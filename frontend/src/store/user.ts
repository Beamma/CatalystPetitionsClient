import create from 'zustand';

interface UserState {
    id: string; // Changed from String to string
    setUser: (id: string) => void; // Changed from String to string
}

const useStore = create<UserState>((set) => ({
    id: "0",
    setUser: (id: string) => set(() => {
        return {id: id} // Update the search state with the provided string value
    }),
}));

export const useUserStore = useStore;