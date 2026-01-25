# Phase 3 — Ontology Query Interface

## Summary

This phase defines the internal query interfaces for the ontology runtime. The goal is to provide a metadata-driven, schema-aware Query DSL that abstracts away the underlying SQL and is optimized for both programmatic use and future AI tool integration.

---

## Core Components

### 1. Query DSL (`query-types.ts`)
A structured, JSON-like language for defining entity searches and relationship traversals.
- **Filters**: Support for logical (`AND`, `OR`, `NOT`) and comparison (`EQUALS`, `CONTAINS`, `IN`, etc.) operators.
- **Sorting**: Multi-attribute sorting support.
- **Pagination**: Built-in `limit` and `offset` support.
- **Temporal**: Optional `asOf` parameter for historical state queries.

### 2. Service Layer (`query-service.ts`)
- **`OntologyQueryService`**: The primary interface for executing queries.
- **`QueryBuilder`**: A fluent interface for constructing complex queries.

---

## Example Queries (AI-Ready)

### 1. Simple Entity Search
Find all `customer` entities where `status` is `active`.
```json
{
  "entityType": "customer",
  "filter": {
    "type": "attribute",
    "attributeName": "status",
    "operator": "EQUALS",
    "value": "active"
  }
}
```

### 2. Complex Filtered Search
Find `order` entities where `total_amount` > 1000 AND `created_at` > '2023-01-01'.
```json
{
  "entityType": "order",
  "filter": {
    "type": "logical",
    "operator": "AND",
    "filters": [
      {
        "type": "attribute",
        "attributeName": "total_amount",
        "operator": "GREATER_THAN",
        "value": 1000
      },
      {
        "type": "attribute",
        "attributeName": "created_at",
        "operator": "GREATER_THAN",
        "value": "2023-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 3. Relationship Traversal
Find all `product` entities linked to a specific `order`.
```json
{
  "from": "order-uuid-123",
  "relationshipType": "order_has_products",
  "direction": "OUTGOING"
}
```

### 4. Temporal Query
Find the state of a `customer` as of a specific date.
```json
{
  "entityType": "customer",
  "filter": {
    "type": "attribute",
    "attributeName": "id",
    "operator": "EQUALS",
    "value": "customer-uuid-456"
  },
  "asOf": "2022-12-31T23:59:59Z"
}
```

---

## Files Created

| File | Description |
|------|-------------|
| [query-types.ts](file:///c:/Users/YASHWANTH/Projects/AIP/src/ontology/query/query-types.ts) | Definitions for the Query DSL and Filters. |
| [query-service.ts](file:///c:/Users/YASHWANTH/Projects/AIP/src/ontology/query/query-service.ts) | Interfaces for the Query Service and Builder. |

---

## Verification

```bash
npm run check
```
✅ TypeScript compilation passed.
