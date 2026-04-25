import { runDebate } from "./runDebate";

const topic = process.argv.slice(2).join(" ") || "是否应该加征商税以充实国库";

console.log(`\n=== debating: ${topic} ===\n`);

for await (const ev of runDebate(topic, { minStepDelayMs: 50 })) {
  console.log(JSON.stringify(ev));
}
