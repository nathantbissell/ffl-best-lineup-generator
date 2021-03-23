import _ from "lodash";

export default function filterPosition(boxscorePlayer, position) {
  return (
    boxscorePlayer.position === position ||
    _.includes(boxscorePlayer.player.eligiblePositions, position)
  );
}
