<script lang="ts">
  import { navigate } from "$lib/router";
  import { getClient } from "$lib/client";
  import type { QueryCustomerModelUnifiedFilterInput } from "@insurup/sdk";
  import type { Column } from "$lib/types";
  import DataTable from "$lib/components/DataTable.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import CustomerCreateDialog from "$lib/components/CustomerCreateDialog.svelte";
  import { Input, Button, Badge } from "$lib/components/ui";
  import { toast } from "svelte-sonner";
  import { Plus, Search } from "lucide-svelte";

  interface Customer {
    id: string;
    name: string | null;
    type: string;
    primaryEmail: string | null;
    primaryPhoneNumber: string | null;
    createdAt: string;
  }

  let customers = $state<Customer[]>([]);
  let isLoading = $state(true);
  let totalCount = $state<number | null>(null);
  let isCreateDialogOpen = $state(false);
  let pageInfo = $state({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null as string | null,
    endCursor: null as string | null,
  });

  // URL state
  let search = $state("");
  let sortField = $state("createdAt");
  let sortDirection = $state<"asc" | "desc">("desc");
  let cursor = $state<string | null>(null);
  let direction = $state("forward");
  let currentPage = $state(1);

  const client = getClient();

  async function fetchCustomers() {
    isLoading = true;
    try {
      const filterOptions: QueryCustomerModelUnifiedFilterInput | undefined = search
        ? { name: { $search: true, textSearch: { value: search } } }
        : undefined;

      // Fire count query in parallel
      const countPromise = client.customers.getCustomers({
        first: 1,
        filter: filterOptions,
        select: ["id"] as const,
        includeTotalCount: true,
      });

      const result = await client.customers.getCustomers({
        select: ["id", "name", "type", "primaryEmail", "primaryPhoneNumber", "createdAt"] as const,
        first: direction === "forward" ? 10 : undefined,
        last: direction === "backward" ? 10 : undefined,
        after: direction === "forward" ? cursor : undefined,
        before: direction === "backward" ? cursor : undefined,
        filter: filterOptions,
        order: sortField ? [{ [sortField]: sortDirection === "asc" ? "ASC" : "DESC" }] : undefined,
        includeTotalCount: false,
      });

      if (result.isSuccess) {
        const nodes = result.data.nodes?.filter((n): n is NonNullable<typeof n> => n !== null) ?? [];
        customers = nodes.map(n => ({
          id: n.id,
          name: n.name ?? null,
          type: String(n.type),
          primaryEmail: n.primaryEmail ?? null,
          primaryPhoneNumber: n.primaryPhoneNumber ?? null,
          createdAt: String(n.createdAt),
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
        toast.error("Failed to load customers");
      }
    } catch (error) {
      toast.error("An error occurred while loading customers");
      console.error(error);
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    fetchCustomers();
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

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Customers</h1>
      <p class="text-muted-foreground">
        Manage customer records and information.
      </p>
    </div>
    <Button onclick={() => isCreateDialogOpen = true}>
      <Plus class="mr-2 h-4 w-4" />
      New Customer
    </Button>
  </div>

  <CustomerCreateDialog
    bind:open={isCreateDialogOpen}
    onOpenChange={(open) => isCreateDialogOpen = open}
  />

  <div class="flex items-center gap-4">
    <div class="relative flex-1 max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search customers..."
        value={search}
        oninput={(e) => handleSearch(e.currentTarget.value)}
        class="pl-9"
      />
    </div>
  </div>

  <DataTable
    {columns}
    data={customers}
    {isLoading}
    {sortField}
    {sortDirection}
    onSort={handleSort}
    onRowClick={(customer) => navigate("/customers/:id", { params: { id: customer.id } })}
    getRowKey={(customer) => customer.id}
  >
    {#snippet renderCell({ item, column })}
      {#if column.key === "type"}
        <Badge variant="outline">{item.type}</Badge>
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
