export const dashboardHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Orion Pulse Lite</title>
  <style>
    body{font-family:Inter,system-ui,sans-serif;background:#0f1117;color:#d8dee9;margin:0;padding:24px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
    .card{background:#161a22;border:1px solid #2a3242;border-radius:10px;padding:14px}
    button{background:#2a61ff;color:white;border:none;padding:10px 14px;border-radius:8px;cursor:pointer}
    pre{max-height:260px;overflow:auto;background:#0b0e14;padding:12px;border-radius:8px}
  </style>
</head>
<body>
  <h1>Orion Pulse Lite</h1>
  <div class="grid" id="stats"></div>
  <p><button id="ping">Ping Now</button></p>
  <h3>Logs</h3><pre id="logs"></pre>
<script>
  const fmt = v => v ? new Date(v).toLocaleString() : '-';
  async function refresh(){
    const res = await fetch('/api/status');
    const data = await res.json();
    const online = data.running && data.dbConnected;
    document.getElementById('stats').innerHTML = [
      ['Status', online ? 'Online' : 'Offline'],
      ['Last Heartbeat', fmt(data.lastSuccessAt)],
      ['Next Heartbeat', fmt(data.nextPingAt)],
      ['Success Count', data.successCount],
      ['Error Count', data.errorCount],
      ['Uptime (s)', Math.floor((data.uptimeMs||0)/1000)]
    ].map(([k,v])=>`<div class='card'><div style='opacity:.75'>${k}</div><div>${v}</div></div>`).join('');
    const logsRes = await fetch('/api/logs');
    const logs = await logsRes.json();
    document.getElementById('logs').textContent = logs.map(l=>`[${l.at}] ${l.level.toUpperCase()} ${l.message}`).join('\n');
  }
  document.getElementById('ping').onclick = async ()=>{ await fetch('/api/ping-now',{method:'POST'}); refresh(); };
  setInterval(refresh, 3000); refresh();
</script>
</body></html>`;
