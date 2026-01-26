import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useClient } from "@/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailSkeleton } from "@/components/DetailSkeleton";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, Calendar, User } from "lucide-react";
import { CustomerType, type GetCustomerResult } from "@insurup/contracts";

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useClient();

  const [customer, setCustomer] = useState<GetCustomerResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      if (!id) return;

      setIsLoading(true);
      try {
        const result = await client.customers.getCustomer(id);
        if (result.isSuccess) {
          setCustomer(result.data);
        } else {
          toast.error("Failed to load customer");
          navigate("/customers");
        }
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
        navigate("/customers");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCustomer();
  }, [id, client.customers, navigate]);

  if (isLoading) {
    return <DetailSkeleton cardCount={3} rowsPerCard={3} />;
  }

  if (!customer) {
    return null;
  }

  const getCustomerName = () => {
    if (customer.type === CustomerType.Company) {
      return (customer as { title?: string }).title || "Unknown Company";
    }
    return (customer as { fullName?: string }).fullName || "Unknown";
  };

  const formatPhoneNumber = (phone: unknown) => {
    if (!phone) return "-";
    if (typeof phone === "string") return phone;
    if (typeof phone === "object" && phone !== null) {
      const p = phone as { countryCode?: number; number?: string };
      return p.countryCode && p.number ? `+${p.countryCode} ${p.number}` : "-";
    }
    return "-";
  };

  const formatDate = (date: unknown) => {
    if (!date) return "-";
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString();
    }
    return "-";
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getCustomerName()}</h1>
          <p className="text-muted-foreground font-mono text-sm">ID: {customer.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Customer profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Type</span>
              <Badge>{customer.type}</Badge>
            </div>
            {customer.type === CustomerType.Individual && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Full Name</span>
                  <span>{(customer as { fullName?: string }).fullName || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Birth Date</span>
                  <span>
                    {formatDate((customer as { birthDate?: unknown }).birthDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Gender</span>
                  <span>{(customer as { gender?: string }).gender || "-"}</span>
                </div>
              </>
            )}
            {customer.type === CustomerType.Company && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Company Title</span>
                <span>{(customer as { title?: string }).title || "-"}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Email and phone details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Primary Email:</span>
              <span>{customer.primaryEmail || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Primary Phone:</span>
              <span>{formatPhoneNumber(customer.primaryPhoneNumber)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
            <CardDescription>Important dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Created</span>
              <span>{formatDate(customer.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
