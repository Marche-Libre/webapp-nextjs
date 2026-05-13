# Architecture future - front / API / services / adapters

Diagrammes Mermaid des blocs cibles pour une migration vers une architecture pseudo DDD / pseudo hexagonale.

## Vue cible logique

```mermaid
flowchart TB
    subgraph FE["Frontend"]
        UI["UI<br/>React puis Angular"]
        Hooks["Hooks React / Angular services<br/>state, cache, loading, errors"]
        ClientServices["Client services<br/>classes TS pures"]
        ApiClient["API client<br/>HTTP / WS / SSE"]
    end

    subgraph API["Interface publique"]
        Http["Backend API<br/>REST / RPC"]
        Realtime["Realtime Gateway<br/>WS / SSE"]
        DTO["DTO contracts<br/>validation entree/sortie"]
    end

    subgraph APP["Application"]
        Authz["AuthN / AuthZ<br/>access state"]
        UseCases["Application services / use cases<br/>AdmissionService<br/>MemberService<br/>ChatService<br/>AdminService"]
        Queries["Query facade<br/>read use cases"]
    end

    subgraph DOMAIN["Domain core"]
        Model["Domain model<br/>Member<br/>Admission<br/>Sponsorship<br/>Channel<br/>Message<br/>Notification"]
        Rules["Domain rules<br/>status<br/>admission<br/>chat<br/>admin"]
    end

    subgraph PORTS["Ports"]
        MemberPort["MemberRepositoryPort"]
        AdmissionPort["AdmissionRepositoryPort"]
        ChatPort["ChatRepositoryPort"]
        NotificationPort["NotificationPort"]
        IdentityPort["IdentityProviderPort"]
        CachePort["CachePort"]
        EventBusPort["EventBusPort"]
    end

    subgraph ADAPTERS["Adapters infrastructure"]
        ACL["Anti-Corruption Layer<br/>Legacy Supabase adapter"]
        PgAdapter["Postgres adapter"]
        RedisAdapter["Redis adapter"]
        XAdapter["X OAuth adapter"]
        NotifyAdapter["Notification adapter"]
    end

    subgraph DATA["Stores / providers"]
        Legacy[("Legacy Supabase<br/>Auth / DB / Realtime")]
        PG[("Postgres")]
        Redis[("Redis")]
        XOAuth[("X OAuth")]
    end

    UI --> Hooks
    Hooks --> ClientServices
    ClientServices --> ApiClient
    ApiClient -->|HTTP| Http
    ApiClient -->|WS / SSE| Realtime
    Http --> DTO
    Realtime --> DTO
    DTO --> Authz
    Authz --> UseCases
    Authz --> Queries
    UseCases --> Model
    UseCases --> Rules
    Queries --> PORTS
    UseCases --> PORTS
    PORTS --> ACL
    PORTS --> PgAdapter
    PORTS --> RedisAdapter
    PORTS --> XAdapter
    PORTS --> NotifyAdapter
    ACL --> Legacy
    PgAdapter --> PG
    RedisAdapter --> Redis
    XAdapter --> XOAuth
```

## Vue transitoire dans Next.js

```mermaid
flowchart TB
    subgraph NEXT["Application Next.js existante"]
        UI["UI React"]
        Hooks["React hooks"]
        ClientServices["Client services<br/>classes TS pures"]
        ApiClient["API client"]
        Routes["API routes / server actions"]
        Services["Application services / use cases"]
        Domain["Domain model"]
        Ports["Ports"]
        SupabaseAdapter["Supabase legacy adapter / ACL"]
    end

    subgraph SUPA["Supabase actuel"]
        Auth[("Supabase Auth")]
        DB[("Supabase DB")]
        RT[("Supabase Realtime")]
    end

    UI --> Hooks
    Hooks --> ClientServices
    ClientServices --> ApiClient
    ApiClient --> Routes
    Routes --> Services
    Services --> Domain
    Services --> Ports
    Ports --> SupabaseAdapter
    SupabaseAdapter --> Auth
    SupabaseAdapter --> DB
    SupabaseAdapter --> RT
```

## Vue separee backend + Angular

```mermaid
flowchart TB
    subgraph PUBLIC["Next.js public"]
        Landing["Landing / site public"]
        Legal["Pages legales / SEO"]
    end

    subgraph ANGULAR["Application Angular"]
        AngularUI["UI Angular"]
        AngularServices["Angular services<br/>wrappers framework"]
        ClientServices["Client services<br/>classes TS pures"]
        AngularClient["API client Angular"]
    end

    subgraph BACKEND["Backend applicatif"]
        BackendApi["HTTP API"]
        BackendRealtime["WS / SSE"]
        BackendServices["Application services"]
        BackendDomain["Domain core"]
        BackendPorts["Ports"]
        BackendAdapters["Adapters infrastructure"]
    end

    subgraph INFRA["Infrastructure"]
        Supabase[("Supabase legacy<br/>Auth / DB / Realtime")]
        Postgres[("Postgres")]
        Redis[("Redis")]
        OAuth[("OAuth providers")]
    end

    Landing --> BackendApi
    AngularUI --> AngularServices
    AngularServices --> ClientServices
    ClientServices --> AngularClient
    AngularClient --> BackendApi
    AngularClient --> BackendRealtime
    BackendApi --> BackendServices
    BackendRealtime --> BackendServices
    BackendServices --> BackendDomain
    BackendServices --> BackendPorts
    BackendPorts --> BackendAdapters
    BackendAdapters --> Supabase
    BackendAdapters --> Postgres
    BackendAdapters --> Redis
    BackendAdapters --> OAuth
```

## Flux de dependances

```text
UI
  -> React hooks / Angular services
    -> Client services, classes TS pures
      -> API client
        -> Backend API
          -> Application services / use cases
            -> Domain model
            -> Ports
              -> Adapters
                -> Supabase aujourd'hui
                -> Postgres / Redis / autre demain
```
