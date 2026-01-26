<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useClient } from "@/composables/useClient";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import DetailSkeleton from "@/components/DetailSkeleton.vue";
import { toast } from "vue-sonner";
import {
  ArrowLeft,
  FileText,
  User,
  Building,
  Calendar,
  DollarSign,
} from "lucide-vue-next";
import type { GetPolicyDetailResult } from "@insurup/contracts";

const route = useRoute();
const router = useRouter();
const client = useClient();

const policy = ref<GetPolicyDetailResult | null>(null);
const isLoading = ref(true);

watch(() => route.params.id, async (id) => {
  if (!id) return;

  isLoading.value = true;
  try {
    const result = await client.policies.getPolicyDetail({ policyId: id as string });
    if (result.isSuccess) {
      policy.value = result.data;
    } else {
      toast.error("Failed to load policy");
      router.push("/policies");
    }
  } catch (error) {
    toast.error("An error occurred");
    console.error(error);
    router.push("/policies");
  } finally {
    isLoading.value = false;
  }
}, { immediate: true });

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

<template>
  <DetailSkeleton v-if="isLoading" :card-count="5" :rows-per-card="3" />

  <div v-else-if="policy" class="space-y-6 animate-in fade-in-50 duration-300">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.push('/policies')">
        <ArrowLeft class="h-5 w-5" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Policy {{ policy.insuranceCompanyPolicyNumber || route.params.id }}
        </h1>
        <p class="text-muted-foreground font-mono text-sm">ID: {{ policy.id }}</p>
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
            <span>{{ policy.insuranceCompanyPolicyNumber || "-" }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Branch</span>
            <Badge variant="outline">{{ policy.productBranch || "-" }}</Badge>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Product ID</span>
            <span>{{ policy.productId || "-" }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Status</span>
            <Badge>{{ policy.state || "-" }}</Badge>
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
            <span>{{ policy.insuranceCompanyId || "-" }}</span>
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
            <span>{{ policy.insurerCustomerId || "-" }}</span>
          </div>
          <Button
            v-if="policy.insurerCustomerId"
            variant="outline"
            size="sm"
            @click="router.push(`/customers/${policy.insurerCustomerId}`)"
          >
            View Customer
          </Button>
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
            <span class="font-bold">{{ formatCurrency(policy.grossPremium) }}</span>
          </div>
          <div v-if="policy.netPremium !== undefined" class="flex items-center justify-between">
            <span class="font-medium">Net Premium</span>
            <span>{{ formatCurrency(policy.netPremium) }}</span>
          </div>
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
            <span>{{ formatDate(policy.startDate) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">End Date</span>
            <span>{{ formatDate(policy.endDate) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Created At</span>
            <span>{{ formatDate(policy.createdAt) }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
