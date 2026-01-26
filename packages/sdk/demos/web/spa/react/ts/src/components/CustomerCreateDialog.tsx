import { useActionState } from "react";
import { useNavigate } from "react-router";
import { useClient } from "@/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CustomerType } from "@insurup/contracts";

interface CustomerCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  success: boolean;
  error?: string;
}

export function CustomerCreateDialog({
  open,
  onOpenChange,
}: CustomerCreateDialogProps) {
  const navigate = useNavigate();
  const client = useClient();

  const [state, submitAction, isPending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const fullName = formData.get("fullName") as string;
      const email = formData.get("email") as string;
      const phoneNumber = formData.get("phoneNumber") as string;
      const identityNumber = formData.get("identityNumber") as string;
      const birthDate = formData.get("birthDate") as string;

      try {
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
          navigate(`/customers/${result.data.id}`);
          return { success: true };
        } else {
          toast.error("Failed to create customer");
          return { success: false, error: "Failed to create customer" };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    { success: false }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Customer</DialogTitle>
          <DialogDescription>
            Add a new individual customer to the system.
          </DialogDescription>
        </DialogHeader>
        <form action={submitAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="identityNumber">
              Identity Number (TC Kimlik No)
            </Label>
            <Input
              id="identityNumber"
              name="identityNumber"
              placeholder="11-digit identity number"
              maxLength={11}
              pattern="[0-9]{11}"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Birth Date</Label>
            <Input id="birthDate" name="birthDate" type="date" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="customer@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="5XX XXX XX XX"
              maxLength={10}
              pattern="[0-9]{10}"
            />
            <p className="text-xs text-muted-foreground">
              Enter 10-digit phone number without country code
            </p>
          </div>

          {state.error && (
            <div className="text-sm text-destructive">{state.error}</div>
          )}

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
  );
}
