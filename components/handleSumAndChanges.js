export default function handleSumAndChanges(pos, bestSum, numChanges) {
  bestSum += pos.totalPoints;
  if (pos.position === "Bench") {
    numChanges += 1;
  }
}
export default {
  handleSumAndChanges,
};
