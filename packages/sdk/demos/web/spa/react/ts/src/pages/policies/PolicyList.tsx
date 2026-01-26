import { useState, useEffect, useDeferredValue, useCallback } from "react";
import { useNavigate } from "react-router";
import { useQueryState, parseAsString, parseAsInteger, parseAsStringLiteral } from "nuqs";
import { useClient } from "@/client";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search } from "lucide-react";

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

// Map UI column keys to API field names
const sortFieldToApiField: Record<string, string> = {
  policyNumber: "insuranceCompanyPolicyNumber",
};

export function PolicyList() {
  const client = useClient();
  const navigate = useNavigate();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [pageInfo, setPageInfo] = useState<{
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string | null;
    endCursor?: string | null;
  }>({ hasNextPage: false, hasPreviousPage: false });

  // URL state with nuqs
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [sortField, setSortField] = useQueryState("sort", parseAsString.withDefault("startDate"));
  const [sortDirection, setSortDirection] = useQueryState("dir", parseAsStringLiteral(["asc", "desc"] as const).withDefault("desc"));
  const [cursor, setCursor] = useQueryState("cursor", parseAsString);
  const [direction, setDirection] = useQueryState("direction", parseAsString.withDefault("forward"));
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const deferredSearch = useDeferredValue(search);

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const searchOptions = deferredSearch
        ? { insuranceCompanyPolicyNumber: { textSearch: { value: deferredSearch } } }
        : undefined;

      // Map UI sort field to API field name
      const apiSortField = sortFieldToApiField[sortField] || sortField;

      // Fire count query in parallel (non-blocking)
      const countPromise = client.policies.getPolicies({
        first: 1,
        search: searchOptions,
        select: ["id"] as const,
        includeTotalCount: true,
      });

      // Await only the main data query
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
        search: searchOptions,
        order: apiSortField ? [{ [apiSortField]: sortDirection === "asc" ? "ASC" : "DESC" }] : undefined,
        includeTotalCount: false,
      });

      if (result.isSuccess) {
        const nodes = result.data.nodes?.filter((n): n is NonNullable<typeof n> => n !== null) ?? [];
        setPolicies(nodes.map(n => ({
          id: n.id,
          policyNumber: n.insuranceCompanyPolicyNumber ?? null,
          productBranch: n.productBranch ? String(n.productBranch) : null,
          insuranceCompanyName: n.insuranceCompanyName ?? null,
          customerName: n.insuredCustomerName ?? null,
          grossPremium: n.grossPremium ?? null,
          startDate: n.startDate ? String(n.startDate) : null,
          endDate: n.endDate ? String(n.endDate) : null,
          state: n.state ? String(n.state) : null,
        })));
        setPageInfo(result.data.pageInfo);

        // Update count when it resolves (non-blocking)
        countPromise.then((countRes) => {
          if (countRes.isSuccess && countRes.data?.totalCount != null) {
            setTotalCount(countRes.data.totalCount);
          }
        }).catch(() => {
          // Silently ignore count errors - not critical
        });
      } else {
        toast.error("Failed to load policies");
      }
    } catch (error) {
      toast.error("An error occurred while loading policies");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [client.policies, cursor, deferredSearch, direction, sortDirection, sortField]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

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
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    // Reset pagination when sorting
    setCursor(null);
    setDirection(null);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (pageInfo.endCursor) {
      setCursor(pageInfo.endCursor);
      setDirection("forward");
      setCurrentPage((p) => (p ?? 1) + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageInfo.startCursor) {
      setCursor(pageInfo.startCursor);
      setDirection("backward");
      setCurrentPage((p) => Math.max(1, (p ?? 1) - 1));
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  };

  const getStateVariant = (state: string | null) => {
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
  };

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
      render: (policy) => (
        <Badge variant="outline">{policy.productBranch || "-"}</Badge>
      ),
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
      render: (policy) => (
        <Badge variant={getStateVariant(policy.state)}>
          {policy.state || "-"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
        <p className="text-muted-foreground">
          Browse and manage insurance policies.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search policies..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div style={{ opacity: search !== deferredSearch ? 0.7 : 1 }}>
        <DataTable
          columns={columns}
          data={policies}
          isLoading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={(policy) => navigate(`/policies/${policy.id}`)}
          getRowKey={(policy) => policy.id}
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
