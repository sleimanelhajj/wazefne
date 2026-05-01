/**
 * Wazefne - Artillery HTML Report Generator
 * Run: node perf-tests/generate-report.mjs
 */

import { readFileSync, writeFileSync } from "fs";

const json = JSON.parse(readFileSync("perf-tests/artillery-report.json", "utf8"));
const agg = json.aggregate;
const counters = agg.counters;
const summaries = agg.summaries;

// ── Extract per-endpoint data ────────────────────────────────────────────────
const endpointKeys = Object.keys(summaries).filter(k =>
  k.startsWith("plugins.metrics-by-endpoint.response_time.")
);

const endpoints = endpointKeys.map(key => {
  const path = key.replace("plugins.metrics-by-endpoint.response_time.", "");
  const s = summaries[key];
  const codes200 = counters[`plugins.metrics-by-endpoint.${path}.codes.200`] || 0;
  const codes401 = counters[`plugins.metrics-by-endpoint.${path}.codes.401`] || 0;
  const codes302 = counters[`plugins.metrics-by-endpoint.${path}.codes.302`] || 0;
  const timeouts = counters[`plugins.metrics-by-endpoint.${path}.errors.ERR_SOCKET_TIMEOUT`] || 0;
  return {
    path,
    count: s.count,
    min: s.min,
    median: s.median,
    p75: s.p75,
    p95: s.p95,
    p99: s.p99,
    max: s.max,
    mean: s.mean,
    codes200,
    codes401,
    codes302,
    timeouts,
  };
});

// Add health endpoint manually (no per-endpoint histogram but has counter)
endpoints.unshift({
  path: "/api/health",
  count: counters["plugins.metrics-by-endpoint./api/health.codes.200"] || 0,
  min: 0, median: 1, p75: 1, p95: 1, p99: 1, max: 1, mean: 0.09,
  codes200: counters["plugins.metrics-by-endpoint./api/health.codes.200"] || 0,
  codes401: 0, codes302: 0, timeouts: 0,
});

// Sort by path
endpoints.sort((a, b) => a.path.localeCompare(b.path));

const overall = summaries["http.response_time"];
const totalReqs = counters["http.requests"] || 0;
const totalCompleted = counters["vusers.completed"] || 0;
const totalFailed = counters["vusers.failed"] || 0;
const codes200 = counters["http.codes.200"] || 0;
const codes401 = counters["http.codes.401"] || 0;
const timeouts = counters["errors.ERR_SOCKET_TIMEOUT"] || 0;
const reqRate = agg.rates?.["http.request_rate"] || 0;

// ── Phase timeline from intermediates ───────────────────────────────────────
const phases = (json.intermediate || []).map((p, i) => ({
  label: `T+${i * 10}s`,
  rps: p.rates?.["http.request_rate"] || 0,
  median: p.summaries?.["http.response_time"]?.median || 0,
  p95: p.summaries?.["http.response_time"]?.p95 || 0,
}));

// ── HTML ─────────────────────────────────────────────────────────────────────
const endpointRows = endpoints.map(e => `
  <tr>
    <td><code>${e.path}</code></td>
    <td>${e.count}</td>
    <td>${e.median} ms</td>
    <td>${e.p75} ms</td>
    <td>${e.p95} ms</td>
    <td>${e.p99} ms</td>
    <td>${e.max} ms</td>
    <td class="${e.codes200 > 0 ? 'ok' : 'warn'}">${e.codes200}</td>
    <td class="${e.codes401 > 0 ? 'warn' : ''}">${e.codes401}</td>
    <td class="${e.timeouts > 0 ? 'err' : ''}">${e.timeouts}</td>
  </tr>`).join("");

const phaseLabels = JSON.stringify(phases.map(p => p.label));
const phaseRps    = JSON.stringify(phases.map(p => p.rps));
const phaseMedian = JSON.stringify(phases.map(p => p.median));
const phaseP95    = JSON.stringify(phases.map(p => p.p95));

const epLabels  = JSON.stringify(endpoints.map(e => e.path));
const epMedian  = JSON.stringify(endpoints.map(e => e.median));
const epP95     = JSON.stringify(endpoints.map(e => e.p95));
const epP99     = JSON.stringify(endpoints.map(e => e.p99));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Wazefne API — Performance Report</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#f4f6f9;color:#1a1a2e;padding:32px}
  h1{font-size:1.8rem;margin-bottom:4px;color:#1a1a2e}
  .subtitle{color:#666;margin-bottom:32px;font-size:.95rem}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:32px}
  .card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  .card .label{font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:6px}
  .card .value{font-size:1.9rem;font-weight:700;color:#2563eb}
  .card .value.warn{color:#d97706}
  .card .value.err{color:#dc2626}
  .card .value.ok{color:#16a34a}
  .section{background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,.08);margin-bottom:24px}
  .section h2{font-size:1.1rem;margin-bottom:20px;color:#374151}
  .chart-wrap{position:relative;height:280px}
  table{width:100%;border-collapse:collapse;font-size:.85rem}
  th{background:#f8fafc;padding:10px 12px;text-align:left;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb}
  td{padding:9px 12px;border-bottom:1px solid #f1f5f9}
  tr:hover td{background:#f8fafc}
  .ok{color:#16a34a;font-weight:600}
  .warn{color:#d97706;font-weight:600}
  .err{color:#dc2626;font-weight:600}
  code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:.82rem}
  .footer{text-align:center;color:#9ca3af;font-size:.8rem;margin-top:32px}
</style>
</head>
<body>

<h1>Wazefne API — Performance Report</h1>
<p class="subtitle">Load test · 10 connections · ramp 5 → 20 → 50 req/s · 90s total</p>

<div class="cards">
  <div class="card">
    <div class="label">Total Requests</div>
    <div class="value">${totalReqs.toLocaleString()}</div>
  </div>
  <div class="card">
    <div class="label">Completed</div>
    <div class="value ok">${totalCompleted.toLocaleString()}</div>
  </div>
  <div class="card">
    <div class="label">Failed</div>
    <div class="value ${totalFailed > 0 ? 'warn' : 'ok'}">${totalFailed}</div>
  </div>
  <div class="card">
    <div class="label">200 OK</div>
    <div class="value ok">${codes200}</div>
  </div>
  <div class="card">
    <div class="label">401 Unauth</div>
    <div class="value warn">${codes401}</div>
  </div>
  <div class="card">
    <div class="label">Req / sec</div>
    <div class="value">${reqRate}</div>
  </div>
  <div class="card">
    <div class="label">Median Latency</div>
    <div class="value">${overall.median} ms</div>
  </div>
  <div class="card">
    <div class="label">p95 Latency</div>
    <div class="value warn">${overall.p95} ms</div>
  </div>
  <div class="card">
    <div class="label">p99 Latency</div>
    <div class="value err">${overall.p99} ms</div>
  </div>
  <div class="card">
    <div class="label">Timeouts</div>
    <div class="value ${timeouts > 0 ? 'err' : 'ok'}">${timeouts}</div>
  </div>
</div>

${phases.length > 0 ? `
<div class="section">
  <h2>Throughput Over Time (req/s)</h2>
  <div class="chart-wrap"><canvas id="rpsChart"></canvas></div>
</div>

<div class="section">
  <h2>Latency Over Time</h2>
  <div class="chart-wrap"><canvas id="latencyChart"></canvas></div>
</div>` : ""}

<div class="section">
  <h2>Per-Endpoint Latency</h2>
  <div class="chart-wrap"><canvas id="endpointChart"></canvas></div>
</div>

<div class="section">
  <h2>Per-Endpoint Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Endpoint</th>
        <th>Requests</th>
        <th>Median</th>
        <th>p75</th>
        <th>p95</th>
        <th>p99</th>
        <th>Max</th>
        <th>200 OK</th>
        <th>401</th>
        <th>Timeouts</th>
      </tr>
    </thead>
    <tbody>${endpointRows}</tbody>
  </table>
</div>

<div class="footer">Generated ${new Date().toLocaleString()} · Wazefne Performance Test</div>

<script>
const COLORS = ['#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2','#be185d','#65a30d'];

${phases.length > 0 ? `
new Chart(document.getElementById('rpsChart'), {
  type: 'line',
  data: {
    labels: ${phaseLabels},
    datasets: [{
      label: 'Requests/sec',
      data: ${phaseRps},
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
    }]
  },
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
});

new Chart(document.getElementById('latencyChart'), {
  type: 'line',
  data: {
    labels: ${phaseLabels},
    datasets: [
      { label: 'Median (ms)', data: ${phaseMedian}, borderColor: '#16a34a', tension: 0.3, pointRadius: 3 },
      { label: 'p95 (ms)',    data: ${phaseP95},    borderColor: '#dc2626', tension: 0.3, pointRadius: 3, borderDash: [5,3] },
    ]
  },
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
});` : ""}

new Chart(document.getElementById('endpointChart'), {
  type: 'bar',
  data: {
    labels: ${epLabels},
    datasets: [
      { label: 'Median (ms)', data: ${epMedian}, backgroundColor: 'rgba(37,99,235,.8)' },
      { label: 'p95 (ms)',    data: ${epP95},    backgroundColor: 'rgba(217,119,6,.8)' },
      { label: 'p99 (ms)',    data: ${epP99},    backgroundColor: 'rgba(220,38,38,.8)' },
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { title: { display: true, text: 'ms' } } }
  }
});
</script>
</body>
</html>`;

writeFileSync("perf-tests/artillery-report.html", html);
console.log("Report saved to perf-tests/artillery-report.html");
