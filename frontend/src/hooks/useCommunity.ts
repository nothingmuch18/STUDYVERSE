
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../lib/api';

export function useCommunity() {
    const queryClient = useQueryClient();

    // 1. Fetch Groups
    const { data: groups, isLoading: groupsLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: async () => {
            const res = await communityApi.getGroups();
            return res.data;
        },
        initialData: []
    });

    // 2. Fetch Posts (Conditional)
    const { mutateAsync: fetchPosts } = useMutation({
        mutationFn: async (groupId: string) => {
            const res = await communityApi.getPosts(groupId);
            return res.data;
        }
    });

    // We can also use useQuery dependent on selectedGroup, but for now we'll keep the component driving the selection
    // Better pattern: A separate hook or passing groupId to useCommunity

    // 3. Create Group
    const createGroup = useMutation({
        mutationFn: (data: { name: string }) => communityApi.createGroup(data),
        onSuccess: (newGroup) => {
            // Optimistic update or refetch
            queryClient.setQueryData(['groups'], (old: any[]) => [newGroup.data, ...old]);
        }
    });

    // 4. Create Post
    const createPost = useMutation({
        mutationFn: ({ groupId, content }: { groupId: string; content: string }) =>
            communityApi.createPost(groupId, { content }),
        onSuccess: (_newPost, variables) => {
            // Invalidate specific group posts to refetch
            queryClient.invalidateQueries({ queryKey: ['posts', variables.groupId] });
        }
    });

    // 5. Like Post
    const likePost = useMutation({
        mutationFn: (postId: string) => communityApi.likePost(postId),
        onMutate: async (_postId) => {
            // Optimistic Update!
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            // Snapshot previous value... logic requires knowing the groupId of the post to update the right cache
            // For MVP simplicity, we just invalidate or let the component handle local state optimistically + mutation
        },
        onSuccess: () => {
            // ideally invalidate. simplified for now.
        }
    });

    return {
        groups,
        groupsLoading,
        createGroup,
        createPost,
        likePost,
        fetchPosts // Exposing this to manually load for now, or useQuery in component
    };
}

// Sub-hook for posts to make it cleaner
export function useGroupPosts(groupId: string | null) {
    return useQuery({
        queryKey: ['posts', groupId],
        queryFn: async () => {
            if (!groupId) return [];
            const res = await communityApi.getPosts(groupId);
            return res.data;
        },
        enabled: !!groupId, // Only run if groupId is selected
        initialData: []
    });
}
