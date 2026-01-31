
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // Data is fresh for 1 minute
            retry: 1, // Retry failed requests once
            refetchOnWindowFocus: false, // Don't refetch on window focus for now (can be annoying in dev)
        },
    },
});

export function QueryProvider({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
