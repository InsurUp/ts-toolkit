# Schema Asymmetries

Known places where the live GraphQL server is _not_ uniform across entities
and our hand-declared contracts intentionally mirror that asymmetry. Each
entry is verified server-faithful via introspection at the date listed.

Use this as a checklist when a "harmonize the contracts" PR is proposed: if
the entry below is still in the live schema, the contract is correct as-is.
If the server has since been changed, update both the contract and this
file.

## How to verify

```bash
# 1. Get an access token
TOKEN=$(curl -s -X POST "$INSURUP_E2E_AUTH_URL/connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=$INSURUP_E2E_CLIENT_ID&client_secret=$INSURUP_E2E_CLIENT_SECRET&scope=core-api" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")

# 2. Introspect a specific input type
curl -s -X POST "$INSURUP_E2E_BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ __type(name: \"<TYPE_NAME>\") { inputFields { name type { name } } } }"}' \
  | python3 -m json.tool
```

## Registry

| Entity            | Surface                                           | Asymmetry                                                                                                                                                                                                                                                                                                                         | Verified   |
| ----------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `PolicyTransfers` | `searching_QueryPolicyTransfersResultFilterInput` | Exposes non-string fields (`startDate`, `endDate`, `createdAt`, `succeededPolicyCount`, `failedPolicyCount`, `skippedPolicyCount`) on the **search** input with `searching_LocalDate*` / `searching_DateTime*` / `searching_Int*` ops. Every other entity's search input contains only `SearchStringOperationFilterInput` fields. | 2026-05-20 |
