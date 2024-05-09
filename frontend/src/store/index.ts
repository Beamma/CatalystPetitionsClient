import create from 'zustand';

interface SearchState {
    search: string; // Changed from String to string
    setSearch: (search: string) => void; // Changed from String to string
}

const useStore = create<SearchState>((set) => ({
    search: "",
    setSearch: (search: string) => set(() => {
        return {search: search} // Update the search state with the provided string value
    }),
}));

export const useSearchStore = useStore;
