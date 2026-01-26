<script lang="ts">
  import { push } from "svelte-spa-router";
  import { getClient } from "$lib/client";
  import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Badge,
  } from "$lib/components/ui";
  import DetailSkeleton from "$lib/components/DetailSkeleton.svelte";
  import { toast } from "svelte-sonner";
  import {
    ArrowLeft,
    FileText,
    User,
    Building,
    Calendar,
    DollarSign,
  } from "lucide-svelte";
  import type { GetPolicyDetailResult } from "@insurup/contracts";

  interface Props {
    params: { id: string };
  }

  let { params }: Props = $props();

  let policy = $state<GetPolicyDetailResult | null>(null);
  let isLoading = $state(true);

  const client = getClient();

  $effect(() => {
    async function fetchPolicy() {
      if (!params.id) return;

      isLoading = true;
      try {
        const result = await client.policies.getPolicyDetail({ policyId: params.id });
        if (result.isSuccess) {
          policy = result.data;
        } else {
          toast.error("Failed to load policy");
          push("/policies");
        }
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
        push("/policies");
      } finally {
        isLoading = false;
      }
    }

    fetchPolicy();
  });

  function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);
  }

  function formatDate(value: string | null | undefined): string {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  }
</script>

{#if isLoading}
  <DetailSkeleton cardCount={5} rowsPerCard={3} />
{:else if policy}
  <div class="space-y-6 animate-in fade-in-50 duration-300">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" onclick={() => push("/policies")}>
        <ArrowLeft class="h-5 w-5" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Policy {policy.insuranceCompanyPolicyNumber || params.id}
        </h1>
        <p class="text-muted-foreground font-mono text-sm">ID: {policy.id}</p>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5" />
            Policy Information
          </CardTitle>
          <CardDescription>Basic policy details</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">Policy Number</span>
            <span>{policy.insuranceCompanyPolicyNumber || "-"}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Branch</span>
            <Badge variant="outline">{policy.productBranch || "-"}</Badge>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Product ID</span>
            <span>{policy.productId || "-"}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Status</span>
            <Badge>{policy.state || "-"}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Building class="h-5 w-5" />
            Insurance Company
          </CardTitle>
          <CardDescription>Insurer information</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">Company ID</span>
            <span>{policy.insuranceCompanyId || "-"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <User class="h-5 w-5" />
            Customer
          </CardTitle>
          <CardDescription>Policyholder information</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">Insurer Customer ID</span>
            <span>{policy.insurerCustomerId || "-"}</span>
          </div>
          {#if policy.insurerCustomerId}
            <Button
              variant="outline"
              size="sm"
              onclick={() => push(`/customers/${policy!.insurerCustomerId}`)}
            >
              View Customer
            </Button>
          {/if}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <DollarSign class="h-5 w-5" />
            Premium Details
          </CardTitle>
          <CardDescription>Financial information</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">Gross Premium</span>
            <span class="font-bold">{formatCurrency(policy.grossPremium)}</span>
          </div>
          {#if policy.netPremium !== undefined}
            <div class="flex items-center justify-between">
              <span class="font-medium">Net Premium</span>
              <span>{formatCurrency(policy.netPremium)}</span>
            </div>
          {/if}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Calendar class="h-5 w-5" />
            Coverage Period
          </CardTitle>
          <CardDescription>Policy validity dates</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">Start Date</span>
            <span>{formatDate(policy.startDate)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">End Date</span>
            <span>{formatDate(policy.endDate)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Created At</span>
            <span>{formatDate(policy.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
{/if}
