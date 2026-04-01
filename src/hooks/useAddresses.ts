import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAddresses, createAddress, updateAddress,
  deleteAddress, setDefaultAddress,
} from "@/lib/addressService";
import type { AddressInsert, Address } from "@/lib/supabase.types";

export const addressKeys = {
  all: ["addresses"] as const,
  list: (profileId: string) => [...addressKeys.all, profileId] as const,
};

export function useAddresses(profileId: string | undefined) {
  return useQuery({
    queryKey: addressKeys.list(profileId ?? ""),
    queryFn: () => getAddresses(profileId!),
    enabled: !!profileId,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressInsert) => createAddress(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.all }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Address, "id" | "profile_id" | "created_at">> }) =>
      updateAddress(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.all }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.all }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, addressId }: { profileId: string; addressId: string }) =>
      setDefaultAddress(profileId, addressId),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.all }),
  });
}
