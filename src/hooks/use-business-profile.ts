import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { businessProfileService } from '@/services/business-profile.service';
import type { BusinessProfileInput } from '@/types/api';

export function useBusinessProfile(workspaceId: number | null) {
  return useQuery({
    queryKey: ['business-profile', workspaceId],
    queryFn: () => businessProfileService.get(workspaceId!),
    enabled: workspaceId !== null,
  });
}

export function useSaveBusinessProfile(workspaceId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BusinessProfileInput) =>
      businessProfileService.save(workspaceId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['business-profile', workspaceId],
      });
    },
  });
}
