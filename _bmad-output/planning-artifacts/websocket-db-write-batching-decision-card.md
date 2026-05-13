# WebSocket DB Write Batching Decision Card

Source: https://chatgpt.com/share/6a048dac-9ecc-832c-ba44-facdb0421a1c  
Imported: 2026-05-13  
Original title: Should websockets batch writes to DB?

This document captures the decision guidance from the shared ChatGPT conversation. The visible shared content was a decision card for deciding whether to add a cache/write-batch layer between WebSocket handlers and a database. The share also referenced a generated downloadable document, but that generated document body was redacted in the shared page payload.

## When To Add A Write-Batch Layer

Use it when:

- You have high write rates, roughly 500 to 1,000 writes per second or more, or bursty traffic with 10x spikes that overwhelm the database.
- Many writes are deduplicable or mergeable, such as presence, typing indicators, counters, and idempotent updates.
- Latency tolerance exists for persistence, for example 50 to 500 ms is acceptable.

Skip it when:

- Writes are rare, strictly transactional, or must be durably committed before ACK with a sub-20 ms SLA.
- The database already handles the load after indexes, partitioning, and bulk inserts are tuned.

## Pros And Cons

Pros:

- Reduced write amplification: coalesce many small operations into one bulk write.
- Higher throughput and lower cost: fewer round trips and better IOPS utilization.
- Backpressure safety: absorb spikes without dropping connections.

Cons:

- New failure modes: in-memory loss, partial flushes, and duplicate delivery.
- More complexity: batching windows, flush policies, retries, and idempotency.
- Staleness risk: data is not instantly durable or visible.

## One-Minute Rules Of Thumb

- If P99 WebSocket-to-database queue time is above 30 to 50 ms, or database CPU is above 70% during spikes, add batching.
- If the domain tolerates 100 to 300 ms of durability lag, batching is likely acceptable.
- If each write is under 2 KB and volume is above 5,000 writes per minute, batching is likely worth it.
- If idempotent upserts cannot be guaranteed, do not batch until that is fixed.

## Minimal Design

Safe defaults:

- Ingress: the WebSocket handler enqueues `{ key, op, ts }` to an in-process queue.
- Coalescer: merge by key, such as last-write-wins or increment sums.
- Flush policy: `max_batch = 1000`, `max_age = 100 ms`, `max_bytes = 1-2 MB`.
- Durability: use a WAL or append-only disk-backed buffer plus idempotent upserts.
- Backpressure: if queue length exceeds a threshold, begin shedding load or slow-ACKing clients.
- Observability: track queue length, batch size, flush age, and retry count.

## Failure Handling Checklist

- Use at-least-once semantics plus idempotent keys, such as a natural key or `(type, entity_id, version)`.
- For crash safety, replay the WAL to the database before accepting traffic after restart.
- Quarantine poison batches so one bad row can be isolated while the remaining rows continue.
- Add a circuit breaker. If the database is degraded, extend `max_age` but cap it at a hard limit, for example 1 second, then degrade features.

## Simple Pseudocode

```ts
queue.push(evt);
if (shouldFlush(now)) flushBatch();

function flushBatch() {
  const batch = coalesce(queue.drain(maxBatch));
  try {
    db.bulkUpsert(batch); // idempotent on (type, id, version)
    wal.compact(batch);
  } catch (e) {
    wal.persist(batch);
    retryWithBackoff(batch);
  }
}
```

## Database Tips

- Prefer bulk upsert with primary keys and `ON CONFLICT DO UPDATE` in Postgres, or `MERGE` in databases that support it.
- Keep hot indexes minimal.
- Avoid per-row triggers on the hot path.
- For time-series or log-like data, consider partitioned tables plus `COPY` or unlogged staging followed by a merge.

## Alternatives To Consider First

- Tune the database pool and batch writes in the app without adding a cache layer.
- Add per-connection rate limits and backpressure.
- Use a message broker such as Kafka, Redpanda, or Pub/Sub if cross-service fan-out and durable queues are required.

## Quick Decision Flow

1. Can writes be made idempotent? If not, do not add the layer.
2. Can the product accept up to 300 ms of persistence lag? If not, skip batching.
3. Are bursts saturating the database, or is P99 queue time above 50 ms? If yes, add batching.
4. Is cross-service durability or replay required? If yes, use a broker plus a batcher consumer.

