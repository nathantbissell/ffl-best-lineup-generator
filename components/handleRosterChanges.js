export default function handleRosterChanges(pos, numChanges) {
  if (pos.position === "Bench") {
    numChanges++;
  }
  return numChanges;
}
export default {
  handleRosterChanges,
};
