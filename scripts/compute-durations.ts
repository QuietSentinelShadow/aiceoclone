import { parseFile } from "music-metadata";
import { writeFileSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";

const AUDIO_DIR = join(__dirname, "..", "public", "audio");
const OUTPUT_FILE = join(__dirname, "..", "src", "audio-durations.json");
const FPS = 30;
const PADDING_SECONDS = 1.5; // extra time after audio ends for visual breathing room

interface DurationMap {
  [videoId: string]: {
    [segmentId: string]: {
      durationSeconds: number;
      durationFrames: number;
    };
  };
}

async function main() {
  const durations: DurationMap = {};
  const videoTotals: { [videoId: string]: number } = {};

  const videoDirs = readdirSync(AUDIO_DIR).filter((d) =>
    statSync(join(AUDIO_DIR, d)).isDirectory()
  );

  for (const videoDir of videoDirs) {
    durations[videoDir] = {};
    let totalFrames = 0;
    const dirPath = join(AUDIO_DIR, videoDir);
    const files = readdirSync(dirPath)
      .filter((f) => f.endsWith(".mp3"))
      .sort();

    for (const file of files) {
      const filePath = join(dirPath, file);
      const segmentId = basename(file, ".mp3");

      try {
        const metadata = await parseFile(filePath);
        const durationSec = metadata.format.duration || 0;
        const durationWithPadding = durationSec + PADDING_SECONDS;
        const frames = Math.ceil(durationWithPadding * FPS);

        durations[videoDir][segmentId] = {
          durationSeconds: Math.round(durationSec * 100) / 100,
          durationFrames: frames,
        };
        totalFrames += frames;

        console.log(
          `  ${segmentId}: ${durationSec.toFixed(1)}s → ${frames} frames`
        );
      } catch (err) {
        console.error(`  [ERROR] ${segmentId}: ${err}`);
      }
    }

    videoTotals[videoDir] = totalFrames;
    console.log(
      `\n${videoDir}: ${files.length} segments, total ${totalFrames} frames (${(totalFrames / FPS).toFixed(1)}s)\n`
    );
  }

  const output = { durations, videoTotals };
  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nWritten to ${OUTPUT_FILE}`);
  console.log("\nVideo totals (for Root.tsx):");
  for (const [id, frames] of Object.entries(videoTotals)) {
    console.log(`  ${id}: ${frames} frames (${(frames / FPS).toFixed(1)}s)`);
  }
}

main().catch(console.error);
