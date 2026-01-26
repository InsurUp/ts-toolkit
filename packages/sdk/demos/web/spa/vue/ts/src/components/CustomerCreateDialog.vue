<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useClient } from "@/composables/useClient";
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui";
import { toast } from "vue-sonner";
import { CustomerType } from "@insurup/contracts";

interface Props {
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const router = useRouter();
const client = useClient();

const isPending = ref(false);
const error = ref<string | null>(null);

// Form fields
const fullName = ref("");
const identityNumber = ref("");
const birthDate = ref("");
const email = ref("");
const phoneNumber = ref("");

function resetForm() {
  fullName.value = "";
  identityNumber.value = "";
  birthDate.value = "";
  email.value = "";
  phoneNumber.value = "";
  error.value = null;
}

watch(() => props.open, (newOpen) => {
  if (!newOpen) {
    resetForm();
  }
});

async function handleSubmit() {
  isPending.value = true;
  error.value = null;

  try {
    const result = await client.customers.createCustomer({
      type: CustomerType.Individual,
      fullName: fullName.value,
      email: email.value || undefined,
      phoneNumber: phoneNumber.value
        ? { countryCode: 90, number: phoneNumber.value }
        : undefined,
      identityNumber: identityNumber.value || "",
      birthDate: birthDate.value || undefined,
      fillMissingFields: false,
    });

    if (result.isSuccess) {
      toast.success("Customer created successfully");
      emit("update:open", false);
      router.push(`/customers/${result.data.id}`);
    } else {
      toast.error("Failed to create customer");
      error.value = "Failed to create customer";
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An error occurred";
    toast.error(errorMessage);
    error.value = errorMessage;
  } finally {
    isPending.value = false;
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create Customer</DialogTitle>
        <DialogDescription>
          Add a new individual customer to the system.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="fullName">
            Full Name <span class="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            v-model="fullName"
            placeholder="Enter full name"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="identityNumber">
            Identity Number (TC Kimlik No)
          </Label>
          <Input
            id="identityNumber"
            v-model="identityNumber"
            placeholder="11-digit identity number"
            :maxlength="11"
            pattern="[0-9]{11}"
          />
        </div>

        <div class="space-y-2">
          <Label for="birthDate">Birth Date</Label>
          <Input id="birthDate" v-model="birthDate" type="date" />
        </div>

        <div class="space-y-2">
          <Label for="email">Email Address</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="customer@example.com"
          />
        </div>

        <div class="space-y-2">
          <Label for="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            v-model="phoneNumber"
            placeholder="5XX XXX XX XX"
            :maxlength="10"
            pattern="[0-9]{10}"
          />
          <p class="text-xs text-muted-foreground">
            Enter 10-digit phone number without country code
          </p>
        </div>

        <div v-if="error" class="text-sm text-destructive">{{ error }}</div>

        <DialogFooter class="gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            :disabled="isPending"
            @click="emit('update:open', false)"
          >
            Cancel
          </Button>
          <Button type="submit" :disabled="isPending">
            {{ isPending ? "Creating..." : "Create Customer" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
