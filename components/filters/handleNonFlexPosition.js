import _ from "lodash";
import filterPosition from "./filterPosition.js";

export default function handleNonFlexPosition(lineup, position, amount) {
  const players = _.filter(lineup, (player) =>
    filterPosition(player, position)
  );
  const sortedPlayers = _.sortBy(players, ["totalPoints"]);
  if (amount === 2) {
    let list = [];
    list.push(_.last(sortedPlayers));
    sortedPlayers.pop();
    list.push(_.last(sortedPlayers));
    return list;
  } else {
    return _.last(sortedPlayers);
  }
}
