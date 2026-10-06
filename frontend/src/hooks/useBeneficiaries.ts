import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beneficiaryApi, BeneficiaryItem, CreateBeneficiaryPayload } from '@/lib/api/beneficiaryApi';

export function useBeneficiaries() {
  const queryClient = useQueryClient();

  const query = useQuery<BeneficiaryItem[], Error>({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const res = await beneficiaryApi.getMyBeneficiaries();
      return res?.data || [];
    },
  });

  const addMutation = useMutation<BeneficiaryItem, Error, CreateBeneficiaryPayload>({
    mutationFn: async (payload: CreateBeneficiaryPayload) => {
      const res = await beneficiaryApi.createBeneficiary(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await beneficiaryApi.deleteBeneficiary(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });

  return {
    beneficiaries: query.data || [],
    isLoading: query.isLoading,
    addBeneficiary: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    deleteBeneficiary: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
