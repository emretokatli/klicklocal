import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { aiService } from '@/services/ai.service';

export function useAiHistory(workspaceId: number | null) {
  return useQuery({
    queryKey: ['ai-generations', workspaceId],
    queryFn: () => aiService.history(workspaceId!),
    enabled: workspaceId !== null,
  });
}

export function useGenerateContent(workspaceId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      media_id?: number | null;
      prompt?: string | null;
      platform?: string | null;
      content_type?: string | null;
      seo_focus?: string | null;
    }) => aiService.generate(workspaceId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ai-generations', workspaceId],
      });
    },
  });
}
