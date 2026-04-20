import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  tier: string;
  ai_score: number;
  channels: string;   // JSON array stored as text
  tags: string;        // JSON array stored as text
  status: string;
  total_orders: number;
  total_value: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

// ---------- Queries ----------

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => apiFetch<Customer[]>('/customers'),
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: () => apiFetch<Customer>(`/customers/${id}`),
    enabled: !!id,
  });
}

// ---------- Mutations ----------

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation<Customer, Error, CreateCustomerInput>({
    mutationFn: (data) =>
      apiFetch<Customer>('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation<Customer, Error, { id: string; data: UpdateCustomerInput }>({
    mutationFn: ({ id, data }) =>
      apiFetch<Customer>(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: true }, Error, string>({
    mutationFn: (id) =>
      apiFetch<{ deleted: true }>(`/customers/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
