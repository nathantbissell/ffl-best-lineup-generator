export default function handleRosterChanges(pos, numChanges) {
  if (pos.position === "Bench") {
    numChanges =+ 1;
  }
  return numChanges;
}
