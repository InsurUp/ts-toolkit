<script lang="ts">
  import { navigate } from "$lib/router";
  import { getClient } from "$lib/client";
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
  } from "$lib/components/ui";
  import { toast } from "svelte-sonner";
  import { CustomerType } from "@insurup/contracts";

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { open = $bindable(), onOpenChange }: Props = $props();

  let isPending = $state(false);
  let error = $state<string | null>(null);

  // Form fields
  let fullName = $state("");
  let identityNumber = $state("");
  let birthDate = $state("");
  let email = $state("");
  let phoneNumber = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isPending = true;
    error = null;

    try {
      const client = getClient();
      const result = await client.customers.createCustomer({
        type: CustomerType.Individual,
        fullName,
        email: email || undefined,
        phoneNumber: phoneNumber
          ? { countryCode: 90, number: phoneNumber }
          : undefined,
        identityNumber: identityNumber || "",
        birthDate: birthDate || undefined,
        fillMissingFields: false,
      });

      if (result.isSuccess) {
        toast.success("Customer created successfully");
        onOpenChange(false);
        resetForm();
        navigate("/customers/:id", { params: { id: result.data.id } });
      } else {
        toast.error("Failed to create customer");
        error = "Failed to create customer";
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
      error = errorMessage;
    } finally {
      isPending = false;
    }
  }

  function resetForm() {
    fullName = "";
    identityNumber = "";
    birthDate = "";
    email = "";
    phoneNumber = "";
    error = null;
  }

  function handleClose(newOpen: boolean) {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  }
</script>

<Dialog bind:open onOpenChange={handleClose}>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Create Customer</DialogTitle>
      <DialogDescription>
        Add a new individual customer to the system.
      </DialogDescription>
    </DialogHeader>
    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label for="fullName">
          Full Name <span class="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Enter full name"
          required
          bind:value={fullName}
        />
      </div>

      <div class="space-y-2">
        <Label for="identityNumber">
          Identity Number (TC Kimlik No)
        </Label>
        <Input
          id="identityNumber"
          name="identityNumber"
          placeholder="11-digit identity number"
          maxlength={11}
          pattern="[0-9]{11}"
          bind:value={identityNumber}
        />
      </div>

      <div class="space-y-2">
        <Label for="birthDate">Birth Date</Label>
        <Input id="birthDate" name="birthDate" type="date" bind:value={birthDate} />
      </div>

      <div class="space-y-2">
        <Label for="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="customer@example.com"
          bind:value={email}
        />
      </div>

      <div class="space-y-2">
        <Label for="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          placeholder="5XX XXX XX XX"
          maxlength={10}
          pattern="[0-9]{10}"
          bind:value={phoneNumber}
        />
        <p class="text-xs text-muted-foreground">
          Enter 10-digit phone number without country code
        </p>
      </div>

      {#if error}
        <div class="text-sm text-destructive">{error}</div>
      {/if}

      <DialogFooter class="gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onclick={() => handleClose(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Customer"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
