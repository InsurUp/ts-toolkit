<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useClient } from "@/composables/useClient";
import DataTable, { type Column } from "@/components/DataTable.vue";
import Pagination from "@/components/Pagination.vue";
import { Input, Badge } from "@/components/ui";
import { toast } from "vue-sonner";
import { Search } from "lucide-vue-next";

interface Policy {
  id: string;
  policyNumber: string | null;
  productBranch: string | null;
  insuranceCompanyName: string | null;
  customerName: string | null;
  grossPremium: number | null;
  startDate: string | null;
  endDate: string | null;
  state: string | null;
}

const sortFieldToApiField: Record<string, string> = {
  policyNumber: "insuranceCompanyPolicyNumber",
};

const router = useRouter();
const client = useClient();

const policies = ref<Policy[]>([]);
const isLoading = ref(true);
const totalCount = ref<number | null>(null);
const pageInfo = ref({
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null as string | null,
  endCursor: null as string | null,
});

const search = ref("");
const sortField = ref("startDate");
const sortDirection = ref<"asc" | "desc">("desc");
const cursor = ref<string | null>(null);
const direction = ref("forward");
const currentPage = ref(1);

async function fetchPolicies() {
  isLoading.value = true;
  try {
    const searchOptions = search.value
      ? { insuranceCompanyPolicyNumber: { textSearch: { value: search.value } } }
      : undefined;

    const apiSortField = sortFieldToApiField[sortField.value] || sortField.value;

    const countPromise = client.policies.getPolicies({
      first: 1,
      search: searchOptions,
      select: ["id"] as const,
      includeTotalCount: true,
    });

    const result = await client.policies.getPolicies({
      select: [
        "id",
        "insuranceCompanyPolicyNumber",
        "productBranch",
        "insuranceCompanyName",
        "insuredCustomerName",
        "grossPremium",
        "startDate",
        "endDate",
        "state",
      ] as const,
      first: direction.value === "forward" ? 10 : undefined,
      last: direction.value === "backward" ? 10 : undefined,
      after: direction.value === "forward" ? cursor.value : undefined,
      before: direction.value === "backward" ? cursor.value : undefined,
      search: searchOptions,
      order: apiSortField ? [{ [apiSortField]: sortDirection.value === "asc" ? "ASC" : "DESC" }] : undefined,
      includeTotalCount: false,
    });

    if (result.isSuccess) {
      const nodes = result.data.nodes?.filter((n): n is NonNullable<typeof n> => n !== null) ?? [];
      policies.value = nodes.map(n => ({
        id: n.id,
        policyNumber: n.insuranceCompanyPolicyNumber ?? null,
        productBranch: n.productBranch ? String(n.productBranch) : null,
        insuranceCompanyName: n.insuranceCompanyName ?? null,
        customerName: n.insuredCustomerName ?? null,
        grossPremium: n.grossPremium ?? null,
        startDate: n.startDate ? String(n.startDate) : null,
        endDate: n.endDate ? String(n.endDate) : null,
        state: n.state ? String(n.state) : null,
      }));
      pageInfo.value = result.data.pageInfo;

      countPromise.then((countRes) => {
        if (countRes.isSuccess && countRes.data?.totalCount != null) {
          totalCount.value = countRes.data.totalCount;
        }
      }).catch(() => {});
    } else {
      toast.error("Failed to load policies");
    }
  } catch (error) {
    toast.error("An error occurred while loading policies");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}

watch([search, sortField, sortDirection, cursor, direction], () => {
  fetchPolicies();
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

function formatCurrency(value: number | null): string {
  if (value === null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function getStateVariant(state: string | null): "default" | "secondary" | "destructive" | "outline" {
  switch (state) {
    case "Active":
    case "ACTIVE":
      return "default";
    case "Expired":
    case "EXPIRED":
      return "secondary";
    case "Cancelled":
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

const columns: Column<Policy>[] = [
  {
    key: "policyNumber",
    header: "Policy Number",
    sortable: true,
    render: (policy) => policy.policyNumber || "-",
  },
  {
    key: "productBranch",
    header: "Branch",
  },
  {
    key: "insuranceCompanyName",
    header: "Insurance Company",
    render: (policy) => policy.insuranceCompanyName || "-",
  },
  {
    key: "customerName",
    header: "Customer",
    render: (policy) => policy.customerName || "-",
  },
  {
    key: "grossPremium",
    header: "Premium",
    sortable: true,
    render: (policy) => formatCurrency(policy.grossPremium),
  },
  {
    key: "startDate",
    header: "Start Date",
    sortable: true,
    render: (policy) => formatDate(policy.startDate),
  },
  {
    key: "endDate",
    header: "End Date",
    render: (policy) => formatDate(policy.endDate),
  },
  {
    key: "state",
    header: "Status",
  },
];
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Policies</h1>
      <p class="text-muted-foreground">
        Browse and manage insurance policies.
      </p>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search policies..."
          :model-value="search"
          @update:model-value="handleSearch"
          class="pl-9"
        />
      </div>
    </div>

    <DataTable
      :columns="columns"
      :data="policies"
      :is-loading="isLoading"
      :sort-field="sortField"
      :sort-direction="sortDirection"
      :get-row-key="(policy: Policy) => policy.id"
      @sort="handleSort"
      @row-click="(policy: Policy) => router.push(`/policies/${policy.id}`)"
    >
      <template #cell-productBranch="{ item }">
        <Badge variant="outline">{{ item.productBranch || "-" }}</Badge>
      </template>
      <template #cell-state="{ item }">
        <Badge :variant="getStateVariant(item.state)">
          {{ item.state || "-" }}
        </Badge>
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
