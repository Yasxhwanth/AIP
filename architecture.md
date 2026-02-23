# C3 AIP Platform Architecture

```mermaid
graph TD
    %% Styling
    classDef external fill:#b35900,stroke:#ff8000,stroke-width:2px,color:#fff
    classDef ingestion fill:#004d40,stroke:#00bfa5,stroke-width:2px,color:#fff
    classDef ontology fill:#0d47a1,stroke:#448aff,stroke-width:2px,color:#fff
    classDef scheduler fill:#1a237e,stroke:#5c6bc0,stroke-width:2px,color:#fff
    classDef event fill:#4a148c,stroke:#ab47bc,stroke-width:2px,color:#fff
    classDef timeseries fill:#1b5e20,stroke:#4caf50,stroke-width:2px,color:#fff
    classDef intelligence fill:#f57f17,stroke:#ffeb3b,stroke-width:2px,color:#fff
    classDef ml fill:#b71c1c,stroke:#ef5350,stroke-width:2px,color:#fff
    classDef decision fill:#006064,stroke:#00bcd4,stroke-width:2px,color:#fff
    classDef db fill:#424242,stroke:#bdbdbd,stroke-width:2px,color:#fff
    classDef security fill:#3e2723,stroke:#8d6e63,stroke-width:2px,color:#fff
    
    %% ROW 0: SECURITY & GATEWAY (New in Phase 5)
    subgraph S0 [API Gateway & Security Layer]
        API_GW[API Gateway Router]:::security
        AUTH[Auth & API Key Middleware]:::security
        RATELIMIT[Rate Limiting Engine]:::security
        AUDIT[Audit Logging]:::security
        
        API_GW --> AUTH
        AUTH --> RATELIMIT
        RATELIMIT --> AUDIT
    end

    %% ROW 1: EXTERNAL SOURCES
    subgraph S1 [External Sources]
        REST[REST APIs]:::external
        JSON_CSV[JSON / CSV Upload]:::external
        DIRECT[Direct API Calls]:::external
    end

    %% ROW 2: DATA INGESTION
    subgraph S2 [Data Integration Layer]
        CONN[Connector Framework]:::ingestion
        TRANSFORM[Transform Engine]:::ingestion
        JOB[Job Executor & Scheduler]:::ingestion
        
        CONN --> TRANSFORM
        TRANSFORM --> JOB
    end

    %% ROW 3: CORE ONTOLOGY
    subgraph S3 [Core Ontology Layer]
        direction LR
        ENT_TYPES[Entity Types + Attributes]:::ontology
        ENT_INST[Entity Instances]:::ontology
        REL_DEFS[Relationship Definitions]:::ontology
        REL_GRAPH[Relationship Graph]:::ontology
    end

    %% BACKGROUND SCHEDULERS
    subgraph SB [Background Schedulers]
        INT_SCHED[Integration Scheduler - 60s]:::scheduler
        ROLL_SCHED[Rollup Scheduler - 5m]:::scheduler
    end

    %% ROW 4: EVENT & TIME-SERIES
    subgraph S4 [Event & Policy Layer]
        direction LR
        EVENTS[Domain Events - Append Only]:::event
        POLICY[Policy Engine]:::event
        ALERTS[Alerts]:::event
        
        EVENTS --> POLICY
        POLICY --> ALERTS
    end

    subgraph S5 [Time-Series Layer]
        direction LR
        TELEMETRY[Telemetry Ingestion]:::timeseries
        RAW_METRICS[Raw Metrics]:::timeseries
        ROLLUP[Rollup Engine]:::timeseries
        AGGS[Aggregated Buckets]:::timeseries
        
        TELEMETRY --> RAW_METRICS
        RAW_METRICS --> ROLLUP
        ROLLUP --> AGGS
    end

    %% ROW 5: INTELLIGENCE
    subgraph S6 [Intelligence Layer]
        COMP_METRICS[Computed Metrics - Expression Parser]:::intelligence
        CQRS[CQRS Read Models]:::intelligence
    end

    %% ROW 6: ML MODEL REGISTRY
    subgraph S7 [ML Model Registry]
        direction LR
        MODELS[Model Registry]:::ml
        VERSIONS[Version Lifecycle]:::ml
        INF_ENG[Inference Engine - 4 Strategies]:::ml
        INF_RES[Inference Results]:::ml
        
        MODELS --> VERSIONS
        VERSIONS --> INF_ENG
        INF_ENG --> INF_RES
    end

    %% ROW 7: DECISION & EXECUTION
    subgraph S8 [Decision & Execution Engine]
        direction LR
        RULES[Decision Rules AND/OR]:::decision
        COND_EVAL[Condition Evaluator]:::decision
        EXEC_PLANS[Execution Plans]:::decision
        ACTIONS[5 Action Types]:::decision
        DEC_LOGS[Audit / Decision Logs]:::decision
        
        RULES --> COND_EVAL
        COND_EVAL --> EXEC_PLANS
        EXEC_PLANS --> ACTIONS
        ACTIONS --> DEC_LOGS
    end

    %% DATABASE
    DB[(POSTGRESQL DATABASE<br/>23 Tables | Phase 5 Enterprise)]:::db

    %% Connections
    S1 --> S0
    S0 --> S2
    JOB --> ENT_INST
    
    ENT_TYPES -.-> ENT_INST
    REL_DEFS -.-> REL_GRAPH
    
    ENT_INST --> EVENTS
    REL_GRAPH --> EVENTS
    
    INT_SCHED -.-> JOB
    ROLL_SCHED -.-> ROLLUP
    
    S0 --> TELEMETRY
    S4 --> COMP_METRICS
    S5 --> COMP_METRICS
    
    COMP_METRICS --> CQRS
    CQRS --> INF_ENG
    
    INF_RES --> RULES
    EVENTS --> RULES
    
    S8 -.-> DB
    S7 -.-> DB
    S6 -.-> DB
    S5 -.-> DB
    S4 -.-> DB
    S3 -.-> DB
    S2 -.-> DB
    S0 -.-> DB

```

## Layers Explained

0. **API Gateway & Security**: (Added in Phase 5) Secures the entire platform with API Key validation, Role-Based Access Control (RBAC), and 100 req/min rate limiting.
1. **External Sources**: The various ways data enters the system.
2. **Data Integration Layer**: Handles polling from external `DataSource`s and mapping data into the ontology via `IntegrationJob`s and `JobExecution`s.
3. **Core Ontology Layer**: The heart of the system. Defines the shape of the world (`EntityType`, `AttributeDefinition`) and holds the bi-temporal state (`EntityInstance`). It treats relationships as first-class citizens.
4. **Event & Policy Layer**: Append-only log of changes (`DomainEvent`). The Policy Engine evaluates events in real-time to generate `Alert`s.
5. **Time-Series Layer**: (Added in Phase 4) High-velocity metrics ingestion (`TimeseriesMetric`) optimized for append-heavy workloads, aggregated periodically by the Rollup Engine.
6. **Intelligence Layer**: Combines ontology data and metrics to execute `ComputedMetricDefinition` formulas algebraically on the fly. Maintains CQRS read models for fast querying.
7. **ML Model Registry**: Manages predictive models (`ModelDefinition`, `ModelVersion`) and executes inferences using predefined strategies (Threshold, Z-Score, Linear Regression).
8. **Decision & Execution Engine**: Replaces human operators dynamically. Evaluates rules (`DecisionRule`) and executes a workflow of steps (`ExecutionPlan`) encompassing API calls, entity updates, and alert generation.
9. **Database (PostgreSQL)**: The bottom persistence layer backing all of the above, currently sitting at 23 tables.
