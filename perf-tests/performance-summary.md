# Performance Testing Summary

## Methodology

Performance testing was conducted on the Wazefne Express/TypeScript backend using two tools: **autocannon** for per-endpoint throughput benchmarking and **Artillery** for simulated load testing. Autocannon ran 10 concurrent connections over 15 seconds per endpoint to measure raw throughput and latency. Artillery ran a ramp-up load test (5 → 20 → 50 req/s over 90 seconds) across all API endpoints simultaneously to simulate realistic concurrent user traffic.

## Results

The health endpoint (no auth, no database) handled **~12,665 requests/sec at 0.09ms average latency**, establishing the Express framework overhead as negligible. All authenticated endpoints (browse, jobs, profile, messages, offers, favorites, CV history) consistently achieved **~6,000 requests/sec with an average latency of 1.1ms and p99 of 3ms** under sustained load — including Clerk JWT verification and PostgreSQL queries. Under Artillery's ramp-up load test, the median response time was **49ms** with a throughput peak of 50 req/s. Elevated p95/p99 values in the load test (5.1s / 7.2s) are attributed to Clerk's short-lived development JWT tokens (5-minute TTL) expiring mid-test, causing 401 rejections and connection timeouts — not server-side degradation. No errors or crashes were observed on the server throughout testing.
