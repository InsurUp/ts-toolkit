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
import {
  ArrowLeft,
  FileText,
  User,
  Building,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { GetPolicyDetailResult } from "@insurup/contracts";

export function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useClient();

  const [policy, setPolicy] = useState<GetPolicyDetailResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPolicy() {
      if (!id) return;

      setIsLoading(true);
      try {
        const result = await client.policies.getPolicyDetail({ policyId: id });
        if (result.isSuccess) {
          setPolicy(result.data);
        } else {
          toast.error("Failed to load policy");
          navigate("/policies");
        }
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
        navigate("/policies");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPolicy();
  }, [id, client.policies, navigate]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  };

  if (isLoading) {
    return <DetailSkeleton cardCount={5} rowsPerCard={3} />;
  }

  if (!policy) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/policies")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Policy {policy.insuranceCompanyPolicyNumber || id}
          </h1>
          <p className="text-muted-foreground font-mono text-sm">ID: {policy.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Policy Information
            </CardTitle>
            <CardDescription>Basic policy details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Policy Number</span>
              <span>{policy.insuranceCompanyPolicyNumber || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Branch</span>
              <Badge variant="outline">{policy.productBranch || "-"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Product ID</span>
              <span>{policy.productId || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Status</span>
              <Badge>{policy.state || "-"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Insurance Company
            </CardTitle>
            <CardDescription>Insurer information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Company ID</span>
              <span>{policy.insuranceCompanyId || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer
            </CardTitle>
            <CardDescription>Policyholder information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Insurer Customer ID</span>
              <span>{policy.insurerCustomerId || "-"}</span>
            </div>
            {policy.insurerCustomerId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/customers/${policy.insurerCustomerId}`)}
              >
                View Customer
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Premium Details
            </CardTitle>
            <CardDescription>Financial information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Gross Premium</span>
              <span className="font-bold">
                {formatCurrency(policy.grossPremium)}
              </span>
            </div>
            {policy.netPremium !== undefined && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Net Premium</span>
                <span>{formatCurrency(policy.netPremium)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Coverage Period
            </CardTitle>
            <CardDescription>Policy validity dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Start Date</span>
              <span>{formatDate(policy.startDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">End Date</span>
              <span>{formatDate(policy.endDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Created At</span>
              <span>{formatDate(policy.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
