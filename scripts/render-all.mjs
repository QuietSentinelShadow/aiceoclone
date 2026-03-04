import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "out");

const compositions = [
  { id: "FiveYearOld", output: "01-nullclaw-five-year-old.mp4" },
  { id: "Professional", output: "02-nullclaw-professional.mp4" },
  { id: "Influencer", output: "03-nullclaw-influencer.mp4" },
  { id: "CeoConceptual", output: "04-ceo-clone-conceptual.mp4" },
  { id: "CeoNullclawAdvanced", output: "05-ceo-clone-nullclaw-advanced.mp4" },
  { id: "CeoClawEmpire", output: "06-ceo-clone-claw-empire.mp4" },
];

mkdirSync(OUT_DIR, { recursive: true });

for (const comp of compositions) {
  const outputPath = join(OUT_DIR, comp.output);
  console.log(`\nRendering: ${comp.id} -> ${comp.output}`);

  try {
    execSync(
      `npx remotion render src/index.ts ${comp.id} ${outputPath}`,
      { stdio: "inherit", cwd: join(__dirname, "..") }
    );
    console.log(`Done: ${comp.output}`);
  } catch (err) {
    console.error(`FAILED: ${comp.id}`, err.message);
  }
}

console.log("\nAll renders complete!");
