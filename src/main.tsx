import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import App from "./App.tsx";
import "./index.css";

import { StorageProvider } from "@/context/StorageContext";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60 * 10, // 10 minutes
            retry: (failureCount, error: any) => {
                if (error?.status === 403 || error?.status === 429) return false;
                return failureCount < 3;
            },
            refetchOnWindowFocus: true, // Realtime feel
        },
    },
});

const persister = createSyncStoragePersister({
    storage: window.localStorage,
});

createRoot(document.getElementById("root")!).render(
    <StorageProvider>
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
        >
            <App />
        </PersistQueryClientProvider>
    </StorageProvider>
);
