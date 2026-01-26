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
import { ArrowLeft, Mail, Phone, Calendar, User } from "lucide-vue-next";
import { CustomerType, type GetCustomerResult } from "@insurup/contracts";

const route = useRoute();
const router = useRouter();
const client = useClient();

const customer = ref<GetCustomerResult | null>(null);
const isLoading = ref(true);

watch(() => route.params.id, async (id) => {
  if (!id) return;

  isLoading.value = true;
  try {
    const result = await client.customers.getCustomer(id as string);
    if (result.isSuccess) {
      customer.value = result.data;
    } else {
      toast.error("Failed to load customer");
      router.push("/customers");
    }
  } catch (error) {
    toast.error("An error occurred");
    console.error(error);
    router.push("/customers");
  } finally {
    isLoading.value = false;
  }
}, { immediate: true });

function getCustomerName(): string {
  if (!customer.value) return "";
  if (customer.value.type === CustomerType.Company) {
    return (customer.value as { title?: string }).title || "Unknown Company";
  }
  return (customer.value as { fullName?: string }).fullName || "Unknown";
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

<template>
  <DetailSkeleton v-if="isLoading" :card-count="3" :rows-per-card="3" />

  <div v-else-if="customer" class="space-y-6 animate-in fade-in-50 duration-300">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.push('/customers')">
        <ArrowLeft class="h-5 w-5" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ getCustomerName() }}</h1>
        <p class="text-muted-foreground font-mono text-sm">ID: {{ customer.id }}</p>
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
            <Badge>{{ customer.type }}</Badge>
          </div>
          <template v-if="customer.type === CustomerType.Individual">
            <div class="flex items-center justify-between">
              <span class="font-medium">Full Name</span>
              <span>{{ (customer as { fullName?: string }).fullName || "-" }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium">Birth Date</span>
              <span>{{ formatDate((customer as { birthDate?: unknown }).birthDate) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium">Gender</span>
              <span>{{ (customer as { gender?: string }).gender || "-" }}</span>
            </div>
          </template>
          <template v-if="customer.type === CustomerType.Company">
            <div class="flex items-center justify-between">
              <span class="font-medium">Company Title</span>
              <span>{{ (customer as { title?: string }).title || "-" }}</span>
            </div>
          </template>
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
            <span>{{ customer.primaryEmail || "-" }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Phone class="h-4 w-4 text-muted-foreground" />
            <span class="font-medium">Primary Phone:</span>
            <span>{{ formatPhoneNumber(customer.primaryPhoneNumber) }}</span>
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
            <span>{{ formatDate(customer.createdAt) }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
