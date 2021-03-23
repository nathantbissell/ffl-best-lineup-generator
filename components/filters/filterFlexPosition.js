import _ from "lodash";

export default function filterFlexPosition(boxscorePlayer, bestRosterNames) {
  for (let i = 0; i < bestRosterNames.length; i++) {
    if (_.isEqual(boxscorePlayer.player.fullName, bestRosterNames[i])) {
      return false;
    }
  }
  return true;
}
