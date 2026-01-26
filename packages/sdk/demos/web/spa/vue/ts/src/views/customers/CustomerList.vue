<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useClient } from "@/composables/useClient";
import DataTable, { type Column } from "@/components/DataTable.vue";
import Pagination from "@/components/Pagination.vue";
import CustomerCreateDialog from "@/components/CustomerCreateDialog.vue";
import { Input, Button, Badge } from "@/components/ui";
import { toast } from "vue-sonner";
import { Plus, Search } from "lucide-vue-next";

interface Customer {
  id: string;
  name: string | null;
  type: string;
  primaryEmail: string | null;
  primaryPhoneNumber: string | null;
  createdAt: string;
}

const router = useRouter();
const client = useClient();

const customers = ref<Customer[]>([]);
const isLoading = ref(true);
const totalCount = ref<number | null>(null);
const isCreateDialogOpen = ref(false);
const pageInfo = ref({
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null as string | null,
  endCursor: null as string | null,
});

// State
const search = ref("");
const sortField = ref("createdAt");
const sortDirection = ref<"asc" | "desc">("desc");
const cursor = ref<string | null>(null);
const direction = ref("forward");
const currentPage = ref(1);

async function fetchCustomers() {
  isLoading.value = true;
  try {
    const searchOptions = search.value
      ? { name: { textSearch: { value: search.value } } }
      : undefined;

    const countPromise = client.customers.getCustomers({
      first: 1,
      search: searchOptions,
      select: ["id"] as const,
      includeTotalCount: true,
    });

    const result = await client.customers.getCustomers({
      select: ["id", "name", "type", "primaryEmail", "primaryPhoneNumber", "createdAt"] as const,
      first: direction.value === "forward" ? 10 : undefined,
      last: direction.value === "backward" ? 10 : undefined,
      after: direction.value === "forward" ? cursor.value : undefined,
      before: direction.value === "backward" ? cursor.value : undefined,
      search: searchOptions,
      order: sortField.value ? [{ [sortField.value]: sortDirection.value === "asc" ? "ASC" : "DESC" }] : undefined,
      includeTotalCount: false,
    });

    if (result.isSuccess) {
      const nodes = result.data.nodes?.filter((n): n is NonNullable<typeof n> => n !== null) ?? [];
      customers.value = nodes.map(n => ({
        id: n.id,
        name: n.name ?? null,
        type: String(n.type),
        primaryEmail: n.primaryEmail ?? null,
        primaryPhoneNumber: n.primaryPhoneNumber ?? null,
        createdAt: String(n.createdAt),
      }));
      pageInfo.value = {
        hasNextPage: result.data.pageInfo.hasNextPage,
        hasPreviousPage: result.data.pageInfo.hasPreviousPage,
        startCursor: result.data.pageInfo.startCursor ?? null,
        endCursor: result.data.pageInfo.endCursor ?? null,
      };

      countPromise.then((countRes) => {
        if (countRes.isSuccess && countRes.data?.totalCount != null) {
          totalCount.value = countRes.data.totalCount;
        }
      }).catch(() => {});
    } else {
      toast.error("Failed to load customers");
    }
  } catch (error) {
    toast.error("An error occurred while loading customers");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}

watch([search, sortField, sortDirection, cursor, direction], () => {
  fetchCustomers();
}, { immediate: true });

function handleSearch(value: string) {
  search.value = value;
  cursor.value = null;
  direction.value = "forward";
  currentPage.value = 1;
  totalCount.value = null;
}

function handleSort(field: string) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
  cursor.value = null;
  direction.value = "forward";
  currentPage.value = 1;
}

function handleNextPage() {
  if (pageInfo.value.endCursor) {
    cursor.value = pageInfo.value.endCursor;
    direction.value = "forward";
    currentPage.value++;
  }
}

function handlePreviousPage() {
  if (pageInfo.value.startCursor) {
    cursor.value = pageInfo.value.startCursor;
    direction.value = "backward";
    currentPage.value = Math.max(1, currentPage.value - 1);
  }
}

const columns: Column<Customer>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    render: (customer) => customer.name || "-",
  },
  {
    key: "type",
    header: "Type",
  },
  {
    key: "primaryEmail",
    header: "Email",
    render: (customer) => customer.primaryEmail || "-",
  },
  {
    key: "primaryPhoneNumber",
    header: "Phone",
    render: (customer) => customer.primaryPhoneNumber || "-",
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    render: (customer) => new Date(customer.createdAt).toLocaleDateString(),
  },
];
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Customers</h1>
        <p class="text-muted-foreground">
          Manage customer records and information.
        </p>
      </div>
      <Button @click="isCreateDialogOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        New Customer
      </Button>
    </div>

    <CustomerCreateDialog v-model:open="isCreateDialogOpen" />

    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          :model-value="search"
          @update:model-value="handleSearch"
          class="pl-9"
        />
      </div>
    </div>

    <DataTable
      :columns="columns"
      :data="customers"
      :is-loading="isLoading"
      :sort-field="sortField"
      :sort-direction="sortDirection"
      :get-row-key="(customer: Customer) => customer.id"
      @sort="handleSort"
      @row-click="(customer: Customer) => router.push(`/customers/${customer.id}`)"
    >
      <template #cell-type="{ item }">
        <Badge variant="outline">{{ item.type }}</Badge>
      </template>
    </DataTable>

    <Pagination
      :has-next-page="pageInfo.hasNextPage"
      :has-previous-page="pageInfo.hasPreviousPage"
      :is-loading="isLoading"
      :total-count="totalCount"
      :current-page="currentPage"
      :page-size="10"
      @next="handleNextPage"
      @previous="handlePreviousPage"
    />
  </div>
</template>
