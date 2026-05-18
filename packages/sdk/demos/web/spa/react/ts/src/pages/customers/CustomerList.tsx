import { useState, useEffect, useDeferredValue, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useQueryState, parseAsString, parseAsInteger, parseAsStringLiteral } from 'nuqs';
import { useClient } from '@/client';
import { DataTable, type Column } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { CustomerCreateDialog } from '@/components/CustomerCreateDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';

interface Customer {
  id: string;
  name: string | null;
  type: string;
  primaryEmail: string | null;
  primaryPhoneNumber: string | null;
  createdAt: string;
}

export function CustomerList() {
  const client = useClient();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [pageInfo, setPageInfo] = useState<{
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string | null;
    endCursor?: string | null;
  }>({ hasNextPage: false, hasPreviousPage: false });

  // URL state with nuqs
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [sortField, setSortField] = useQueryState('sort', parseAsString.withDefault('createdAt'));
  const [sortDirection, setSortDirection] = useQueryState(
    'dir',
    parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc')
  );
  const [cursor, setCursor] = useQueryState('cursor', parseAsString);
  const [direction, setDirection] = useQueryState(
    'direction',
    parseAsString.withDefault('forward')
  );
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const deferredSearch = useDeferredValue(search);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const searchOptions = deferredSearch
        ? { name: { textSearch: { value: deferredSearch } } }
        : undefined;

      // Fire count query in parallel (non-blocking)
      const countPromise = client.customers.getCustomers({
        first: 1,
        search: searchOptions,
        select: ['id'] as const,
        includeTotalCount: true,
      });

      // Await only the main data query
      const result = await client.customers.getCustomers({
        select: ['id', 'name', 'type', 'primaryEmail', 'primaryPhoneNumber', 'createdAt'] as const,
        first: direction === 'forward' ? 10 : undefined,
        last: direction === 'backward' ? 10 : undefined,
        after: direction === 'forward' ? cursor : undefined,
        before: direction === 'backward' ? cursor : undefined,
        search: searchOptions,
        order: sortField ? [{ [sortField]: sortDirection === 'asc' ? 'ASC' : 'DESC' }] : undefined,
        includeTotalCount: false,
      });

      if (result.isSuccess) {
        const nodes =
          result.data.nodes?.filter((n): n is NonNullable<typeof n> => n !== null) ?? [];
        // Map to our Customer interface
        setCustomers(
          nodes.map((n) => ({
            id: n.id,
            name: n.name ?? null,
            type: String(n.type),
            primaryEmail: n.primaryEmail ?? null,
            primaryPhoneNumber: n.primaryPhoneNumber ?? null,
            createdAt: String(n.createdAt),
          }))
        );
        setPageInfo(result.data.pageInfo);

        // Update count when it resolves (non-blocking)
        countPromise
          .then((countRes) => {
            if (countRes.isSuccess && countRes.data?.totalCount != null) {
              setTotalCount(countRes.data.totalCount);
            }
          })
          .catch(() => {
            // Silently ignore count errors - not critical
          });
      } else {
        toast.error('Failed to load customers');
      }
    } catch (error) {
      toast.error('An error occurred while loading customers');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [client.customers, cursor, deferredSearch, direction, sortDirection, sortField]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (value: string) => {
    setSearch(value || null);
    // Reset pagination when searching
    setCursor(null);
    setDirection(null);
    setCurrentPage(1);
    setTotalCount(null);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset pagination when sorting
    setCursor(null);
    setDirection(null);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (pageInfo.endCursor) {
      setCursor(pageInfo.endCursor);
      setDirection('forward');
      setCurrentPage((p) => (p ?? 1) + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageInfo.startCursor) {
      setCursor(pageInfo.startCursor);
      setDirection('backward');
      setCurrentPage((p) => Math.max(1, (p ?? 1) - 1));
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (customer) => customer.name || '-',
    },
    {
      key: 'type',
      header: 'Type',
      render: (customer) => <Badge variant="outline">{customer.type}</Badge>,
    },
    {
      key: 'primaryEmail',
      header: 'Email',
      render: (customer) => customer.primaryEmail || '-',
    },
    {
      key: 'primaryPhoneNumber',
      header: 'Phone',
      render: (customer) => customer.primaryPhoneNumber || '-',
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (customer) => new Date(customer.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage customer records and information.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </div>

      <CustomerCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div style={{ opacity: search !== deferredSearch ? 0.7 : 1 }}>
        <DataTable
          columns={columns}
          data={customers}
          isLoading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
          getRowKey={(customer) => customer.id}
        />
      </div>

      <Pagination
        hasNextPage={pageInfo.hasNextPage}
        hasPreviousPage={pageInfo.hasPreviousPage}
        onNext={handleNextPage}
        onPrevious={handlePreviousPage}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={10}
      />
    </div>
  );
}
