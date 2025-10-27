// composables/useUserLookup.ts
import { computed } from 'vue';
import { useUsersStore } from '@/stores/users';

export function useUserLookup() {
  const usersStore = useUsersStore();

  const getUserById = (userId: string) => {
    return computed(() => {
      return usersStore.users.find(user => user.id === userId);
    });
  };

  const getUserNameById = (userId: string) => {
    return computed(() => {
      const user = usersStore.users.find(user => user.id === userId);
      return user?.name || 'Unknown User';
    });
  };

  return {
    getUserById,
    getUserNameById
  };
}