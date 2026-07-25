// Cross-platform: kills whatever process is holding PORT before the server
// starts, so a leftover process from a previous run never blocks npm run dev.
const { execSync } = require("child_process");

const PORT = process.env.PORT || 5000;

try {
  if (process.platform === "win32") {
    const output = execSync(`netstat -ano | findstr :${PORT}`).toString();
    const pids = new Set();
    output.split("\n").forEach((line) => {
      const match = line.trim().match(/\s(\d+)$/);
      if (match) pids.add(match[1]);
    });
    pids.forEach((pid) => {
      try {
        execSync(`taskkill /PID ${pid} /F`);
        console.log(`Freed port ${PORT} (killed PID ${pid})`);
      } catch (_) {
        // Process may already be gone -- that's fine.
      }
    });
  } else {
    execSync(`lsof -ti :${PORT} | xargs -r kill -9`);
    console.log(`Freed port ${PORT} (if anything was using it).`);
  }
} catch (_) {
  // No process was using the port -- nothing to do.
  console.log(`Port ${PORT} was already free.`);
}
