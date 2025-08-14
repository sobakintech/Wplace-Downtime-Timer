  // ========== CONFIG ==========
  const shutdownActive = true;
	const shutdownTimeCEST = "2025-08-12T15:27:00";
  const shutdownTime = new Date(shutdownTimeCEST + "+02:00");

  const lockdownActive = false;
	const lockdownEndCEST = "2025-08-12T15:47:00";
  const lockdownEnd = new Date(lockdownEndCEST + "+02:00");

  const lastEditTimestamp = "2025-08-12T15:47:00";

  const discordWebhookURL = "https://discord.com/api/webhooks/1404753040988307456/cc12jprNYtzxw3BSieNk5sD20Y9kjR2og9ruVHjflaabdrxcq5xvomrLKgOlB-U562v9";
  // ============================

  const statusEl = document.getElementById('status');
  const timeEl = document.getElementById('time');
  const lastUpdatedEl = document.getElementById('lastUpdated');
  const refreshBtn = document.getElementById('refreshBtn');
  const copyBtn = document.getElementById('copyBtn');

  let ticker = null;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') startTicker(); 
    else stopTicker();
  });

  function startTicker(){
    if (!ticker) {
      updateDisplay();
      ticker = setInterval(updateDisplay, 1000);
    }
  }
  function stopTicker(){
    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  }

  function pad(n){ return n.toString().padStart(2,'0'); }

  function formatTime(ms){
    const totalSeconds = Math.floor(Math.abs(ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`, `${pad(seconds)}s`);
    return parts.join(' ');
  }

  function formatDateTime(date){
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric', month:'2-digit', day:'2-digit',
      hour:'2-digit', minute:'2-digit', second:'2-digit',
      hour12:false
    }).format(date);
  }

  function updateDisplay(){
    const now = new Date();
    let targetTime, active, label;

    if (lockdownActive && now < lockdownEnd) {
      targetTime = lockdownEnd;
      active = true;
      label = "Temporary Lockdown Ends";
    } else if (shutdownActive) {
      targetTime = shutdownTime;
      active = true;
      label = "Shutdown Time";
    } else {
      active = false;
    }

    if (active) {
      const diff = now - targetTime;
      statusEl.textContent = diff >= 0 ? `${label} — since:` : `${label} — until:`;
      timeEl.textContent = diff >= 0 ? `${formatTime(diff)} ago` : `in ${formatTime(diff)}`;
    } else {
      statusEl.textContent = "Server Running Normally";
      timeEl.textContent = "";
    }

lastUpdatedEl.innerHTML = `Last updated: ${formatDateTime(new Date(lastEditTimestamp))}<br>(CEST/UTC+2)`;
  }

  refreshBtn.addEventListener('click', () => location.reload());
  copyBtn.addEventListener('click', async () => {
    try {
      const dt = new Date(lastEditTimestamp).toISOString();
      await navigator.clipboard.writeText(dt);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy Timestamp', 1200);
    } catch {
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => copyBtn.textContent = 'Copy Timestamp', 1200);
    }
  });

  setInterval(() => {
    if (document.visibilityState === 'visible') location.reload();
  }, 5 * 60 * 1000);

  startTicker();

  // --- Discord Form ---
  const form = document.getElementById('discordForm');
  const formStatus = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const headline = form.headline.value.trim();
  const context = form.context.value.trim();
  const discordUser = form.discordUser.value.trim();

  if (!headline || !context) {
    formStatus.textContent = "Please fill out both fields.";
    formStatus.style.color = "orange";
    return;
  }

  formStatus.textContent = "Sending...";
  formStatus.style.color = "white";

  try {
    let content = `**Headline:** ${headline}\n**Context:** ${context}`;
    if (discordUser) {
      content += `\n**Discord:** ${discordUser}`;
    }

    let payload = new URLSearchParams();
    payload.append("content", content);

    await fetch("https://discord.com/api/webhooks/1404753040988307456/cc12jprNYtzxw3BSieNk5sD20Y9kjR2og9ruVHjflaabdrxcq5xvomrLKgOlB-U562v9", {
      mode: "no-cors",
      method: 'POST',
      body: payload
    });

    // Always show success because no-cors hides response status
    formStatus.textContent = "Message sent successfully!";
    formStatus.style.color = "lightgreen";
    form.reset();

  } catch (error) {
    formStatus.textContent = `Network error: ${error.message}`;
    formStatus.style.color = "red";
  }
});