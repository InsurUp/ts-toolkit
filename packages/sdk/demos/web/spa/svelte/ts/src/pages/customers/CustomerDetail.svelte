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
  import { ArrowLeft, Mail, Phone, Calendar, User } from "lucide-svelte";
  import { CustomerType, type GetCustomerResult } from "@insurup/contracts";

  interface Props {
    params: { id: string };
  }

  let { params }: Props = $props();

  let customer = $state<GetCustomerResult | null>(null);
  let isLoading = $state(true);

  const client = getClient();

  $effect(() => {
    async function fetchCustomer() {
      if (!params.id) return;

      isLoading = true;
      try {
        const result = await client.customers.getCustomer(params.id);
        if (result.isSuccess) {
          customer = result.data;
        } else {
          toast.error("Failed to load customer");
          push("/customers");
        }
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
        push("/customers");
      } finally {
        isLoading = false;
      }
    }

    fetchCustomer();
  });

  function getCustomerName(): string {
    if (!customer) return "";
    if (customer.type === CustomerType.Company) {
      return (customer as { title?: string }).title || "Unknown Company";
    }
    return (customer as { fullName?: string }).fullName || "Unknown";
  }

  function formatPhoneNumber(phone: unknown): string {
    if (!phone) return "-";
    if (typeof phone === "string") return phone;
    if (typeof phone === "object" && phone !== null) {
      const p = phone as { countryCode?: number; number?: string };
      return p.countryCode && p.number ? `+${p.countryCode} ${p.number}` : "-";
    }
    return "-";
  }

  function formatDate(date: unknown): string {
    if (!date) return "-";
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString();
    }
    return "-";
  }
</script>

{#if isLoading}
  <DetailSkeleton cardCount={3} rowsPerCard={3} />
{:else if customer}
  <div class="space-y-6 animate-in fade-in-50 duration-300">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" onclick={() => push("/customers")}>
        <ArrowLeft class="h-5 w-5" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{getCustomerName()}</h1>
        <p class="text-muted-foreground font-mono text-sm">ID: {customer.id}</p>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <User class="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Customer profile details</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">Type</span>
            <Badge>{customer.type}</Badge>
          </div>
          {#if customer.type === CustomerType.Individual}
            <div class="flex items-center justify-between">
              <span class="font-medium">Full Name</span>
              <span>{(customer as { fullName?: string }).fullName || "-"}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium">Birth Date</span>
              <span>{formatDate((customer as { birthDate?: unknown }).birthDate)}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium">Gender</span>
              <span>{(customer as { gender?: string }).gender || "-"}</span>
            </div>
          {/if}
          {#if customer.type === CustomerType.Company}
            <div class="flex items-center justify-between">
              <span class="font-medium">Company Title</span>
              <span>{(customer as { title?: string }).title || "-"}</span>
            </div>
          {/if}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Mail class="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>Email and phone details</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center gap-2">
            <Mail class="h-4 w-4 text-muted-foreground" />
            <span class="font-medium">Primary Email:</span>
            <span>{customer.primaryEmail || "-"}</span>
          </div>
          <div class="flex items-center gap-2">
            <Phone class="h-4 w-4 text-muted-foreground" />
            <span class="font-medium">Primary Phone:</span>
            <span>{formatPhoneNumber(customer.primaryPhoneNumber)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Calendar class="h-5 w-5" />
            Timeline
          </CardTitle>
          <CardDescription>Important dates</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">Created</span>
            <span>{formatDate(customer.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
{/if}
