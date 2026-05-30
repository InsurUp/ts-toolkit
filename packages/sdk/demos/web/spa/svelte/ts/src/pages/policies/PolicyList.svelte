<script lang="ts">
  import { navigate } from "$lib/router";
  import { getClient } from "$lib/client";
  import type { QueryPoliciesResultUnifiedFilterInput } from "@insurup/sdk";
  import type { Column } from "$lib/types";
  import DataTable from "$lib/components/DataTable.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { Input, Badge } from "$lib/components/ui";
  import { toast } from "svelte-sonner";
  import { Search } from "lucide-svelte";

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

  let policies = $state<Policy[]>([]);
  let isLoading = $state(true);
  let totalCount = $state<number | null>(null);
  let pageInfo = $state({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null as string | null,
    endCursor: null as string | null,
  });

  // URL state
  let search = $state("");
  let sortField = $state("startDate");
  let sortDirection = $state<"asc" | "desc">("desc");
  let cursor = $state<string | null>(null);
  let direction = $state("forward");
  let currentPage = $state(1);

  const client = getClient();

  async function fetchPolicies() {
    isLoading = true;
    try {
      const filterOptions: QueryPoliciesResultUnifiedFilterInput | undefined = search
        ? { insuranceCompanyPolicyNumber: { $search: true, textSearch: { value: search } } }
        : undefined;

      const apiSortField = sortFieldToApiField[sortField] || sortField;

      const countPromise = client.policies.getPolicies({
        first: 1,
        filter: filterOptions,
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
        first: direction === "forward" ? 10 : undefined,
        last: direction === "backward" ? 10 : undefined,
        after: direction === "forward" ? cursor : undefined,
        before: direction === "backward" ? cursor : undefined,
        filter: filterOptions,
        order: apiSortField ? [{ [apiSortField]: sortDirection === "asc" ? "ASC" : "DESC" }] : undefined,
        includeTotalCount: false,
      });

      if (result.isSuccess) {
        const nodes = result.data.nodes?.filter((n): n is NonNullable<typeof n> => n !== null) ?? [];
        policies = nodes.map(n => ({
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
        pageInfo = {
          hasNextPage: result.data.pageInfo.hasNextPage,
          hasPreviousPage: result.data.pageInfo.hasPreviousPage,
          startCursor: result.data.pageInfo.startCursor ?? null,
          endCursor: result.data.pageInfo.endCursor ?? null,
        };

        countPromise.then((countRes) => {
          if (countRes.isSuccess && countRes.data?.totalCount != null) {
            totalCount = countRes.data.totalCount;
          }
        }).catch(() => {});
      } else {
        toast.error("Failed to load policies");
      }
    } catch (error) {
      toast.error("An error occurred while loading policies");
      console.error(error);
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    fetchPolicies();
  });

  function handleSearch(value: string) {
    search = value;
    cursor = null;
    direction = "forward";
    currentPage = 1;
    totalCount = null;
  }

  function handleSort(field: string) {
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "asc";
    }
    cursor = null;
    direction = "forward";
    currentPage = 1;
  }

  function handleNextPage() {
    if (pageInfo.endCursor) {
      cursor = pageInfo.endCursor;
      direction = "forward";
      currentPage++;
    }
  }

  function handlePreviousPage() {
    if (pageInfo.startCursor) {
      cursor = pageInfo.startCursor;
      direction = "backward";
      currentPage = Math.max(1, currentPage - 1);
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
        value={search}
        oninput={(e) => handleSearch(e.currentTarget.value)}
        class="pl-9"
      />
    </div>
  </div>

  <DataTable
    {columns}
    data={policies}
    {isLoading}
    {sortField}
    {sortDirection}
    onSort={handleSort}
    onRowClick={(policy) => navigate("/policies/:id", { params: { id: policy.id } })}
    getRowKey={(policy) => policy.id}
  >
    {#snippet renderCell({ item, column })}
      {#if column.key === "productBranch"}
        <Badge variant="outline">{item.productBranch || "-"}</Badge>
      {:else if column.key === "state"}
        <Badge variant={getStateVariant(item.state)}>
          {item.state || "-"}
        </Badge>
      {:else if column.render}
        {column.render(item)}
      {:else}
        {String((item as unknown as Record<string, unknown>)[column.key] ?? "")}
      {/if}
    {/snippet}
  </DataTable>

  <Pagination
    hasNextPage={pageInfo.hasNextPage}
    hasPreviousPage={pageInfo.hasPreviousPage}
    onNext={handleNextPage}
    onPrevious={handlePreviousPage}
    {isLoading}
    {totalCount}
    {currentPage}
    pageSize={10}
  />
</div>
