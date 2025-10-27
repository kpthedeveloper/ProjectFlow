<!-- views/UsersView.vue -->
<template>
  <div class="users-view">
    <div class="view-header">
      <div class="header-content">
        <div>
          <h2>User Management</h2>
          <p>Manage system users and permissions</p>
        </div>
        <div class="user-stats">
          <div class="stat">
            <span class="stat-number">{{ usersStore.userCountByRole.admin }}</span>
            <span class="stat-label">Admins</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ usersStore.userCountByRole.manager }}</span>
            <span class="stat-label">Managers</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ usersStore.userCountByRole.user }}</span>
            <span class="stat-label">Users</span>
          </div>
        </div>
      </div>
    </div>

    <div class="users-content">
      <UserList
        :users="usersStore.users"
        @create-user="showCreateModal = true"
        @edit-user="handleEditUser"
        @toggle-status="handleToggleStatus"
        @delete-user="handleDeleteUser"
      />
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <UserForm
          :user="editingUser"
          @submit="handleUserSubmit"
          @cancel="closeModal"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <div class="delete-confirmation">
          <h3>Delete User</h3>
          <p>Are you sure you want to delete user "{{ userToDelete?.name }}"? This action cannot be undone.</p>
          <div class="confirmation-actions">
            <button @click="showDeleteModal = false" class="btn-secondary">
              Cancel
            </button>
            <button @click="confirmDelete" class="btn-danger">
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'; // Added watch import
import { useUsersStore } from '@/stores/users';
import UserList from '@/components/users/UserList.vue';
import UserForm from '@/components/users/UserForm.vue';
import type { User } from '@/types';

const usersStore = useUsersStore();

onMounted(() => {
  usersStore.initializeStore();
});

const showModal = ref(false);
const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const editingUser = ref<User | null>(null);
const userToDelete = ref<User | null>(null);

const handleEditUser = (user: User) => {
  editingUser.value = user;
  showModal.value = true;
};

const handleUserSubmit = (userData: Omit<User, 'id' | 'createdAt'>) => {
  if (editingUser.value) {
    // Update existing user
    usersStore.updateUser(editingUser.value.id, userData);
  } else {
    // Create new user
    usersStore.createUser(userData);
  }
  closeModal();
};

const handleToggleStatus = (userId: string) => {
  usersStore.toggleUserStatus(userId);
};

const handleDeleteUser = (userId: string) => {
  const user = usersStore.users.find(u => u.id === userId);
  if (user) {
    userToDelete.value = user;
    showDeleteModal.value = true;
  }
};

const confirmDelete = () => {
  if (userToDelete.value) {
    usersStore.deleteUser(userToDelete.value.id);
    showDeleteModal.value = false;
    userToDelete.value = null;
  }
};

const closeModal = () => {
  showModal.value = false;
  showCreateModal.value = false;
  editingUser.value = null;
};

// Watch for create modal trigger
watch(showCreateModal, (newVal) => {
  if (newVal) {
    showModal.value = true;
    editingUser.value = null;
  }
});
</script>

<style scoped>
.users-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 2rem;
}

.header-content h2 {
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.header-content p {
  color: #64748b;
  margin: 0;
}

.user-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #3b82f6;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.users-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.delete-confirmation {
  text-align: center;
}

.delete-confirmation h3 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.delete-confirmation p {
  color: #64748b;
  margin-bottom: 2rem;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-danger {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .user-stats {
    justify-content: space-around;
  }
  
  .confirmation-actions {
    flex-direction: column;
  }
}
</style>