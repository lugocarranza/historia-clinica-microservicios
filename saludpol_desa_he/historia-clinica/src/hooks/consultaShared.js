import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useResumenResource(queryKey, recordId, getResumen) {
  return useQuery({
    queryKey: [queryKey, recordId],
    queryFn: () => getResumen(recordId),
    enabled: !!recordId,
  })
}

export function useSaveResource(queryKey, atencionId, saveFn) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => saveFn(atencionId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey, atencionId] }),
  })
}
