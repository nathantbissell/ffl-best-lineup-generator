const QB = "QB";
const RB = "RB";
const WR = "WR";
const SLOT = "RB/WR";
const TE = "TE";
const FLEX = "FLEX";
const OP = "OP";
const DST = "D/ST";
const K = "K";
import _ from "lodash";
import handleNonFlexPosition from "./filters/handleNonFlexPosition.js";
import filterFlexPosition from "./filters/filterFlexPosition.js";
import handleRosterChanges from "./handleRosterChanges.js";

export default function analyzeLineup(lineup) {
  let bestSum = 0;
  let numChanges = 0;
  const bestRoster = [];
  const bestRosterNames = [];
  getQB();
  getRB();
  getWR();
  getTE();
  getFlex();
  getDefense();
  getKicker();

  function getQB() {
    const bestQB = handleNonFlexPosition(lineup, "QB", 2);
    bestQB.forEach((pos) => {
      bestRoster.push(`${QB} - ${pos.player.fullName}: ${pos.totalPoints}pts`);
      bestRosterNames.push(pos.player.fullName);
      bestSum += pos.totalPoints;
      handleRosterChanges(pos, numChanges);
    });
    return bestQB;
  }

  function getRB() {
    const bestRB = handleNonFlexPosition(lineup, "RB", 2);
    bestRB.forEach((pos) => {
      bestRoster.push(`${RB} - ${pos.player.fullName}: ${pos.totalPoints}pts`);
      bestRosterNames.push(pos.player.fullName);
      bestSum += pos.totalPoints;
      handleRosterChanges(pos, numChanges);
    });
  }

  function getWR() {
    const bestWR = handleNonFlexPosition(lineup, "WR", 2);
    bestWR.forEach((pos) => {
      bestRoster.push(`${WR} - ${pos.player.fullName}: ${pos.totalPoints}pts`);
      bestRosterNames.push(pos.player.fullName);
      bestSum += pos.totalPoints;
      handleRosterChanges(pos, numChanges);
    });
  }

  function getTE() {
    const bestTE = handleNonFlexPosition(lineup, "TE", 1);
    bestRoster.push(
      `${TE} - ${bestTE.player.fullName}: ${bestTE.totalPoints}pts`
    );
    bestRosterNames.push(bestTE.player.fullName);
    bestSum += bestTE.totalPoints;
    handleRosterChanges(bestTE, numChanges);
  }

  function getFlex() {
    const flexPos = { SLOT: 1, FLEX: 1, OP: 1 };
    const flexPlayers = _.filter(lineup, (player) =>
      filterFlexPosition(player, bestRosterNames)
    );
    const sortedFlexPlayers = _.sortBy(flexPlayers, ["totalPoints"]);

    while (_.sum(_.values(flexPos)) && !_.isEmpty(sortedFlexPlayers)) {
      const player = sortedFlexPlayers.pop();
      const acceptPlayer = (pos) => {
        bestRoster.push(
          `${pos} - ${player.player.fullName}: ${player.totalPoints}pts`
        );
        bestSum += player.totalPoints;
        if (player.position === "Bench") {
          numChanges += 1;
        }
      };
      if (
        flexPos.SLOT > 0 &&
        _.includes(player.player.eligiblePositions, "RB/WR")
      ) {
        acceptPlayer(SLOT);
        flexPos.SLOT -= 1;
      } else if (
        flexPos.FLEX > 0 &&
        _.includes(player.player.eligiblePositions, "RB/WR/TE")
      ) {
        acceptPlayer(FLEX);
        flexPos.FLEX -= 1;
      } else if (
        flexPos.OP > 0 &&
        _.includes(player.player.eligiblePositions, "OP")
      ) {
        acceptPlayer(OP);
        flexPos.OP -= 1;
      }
    }
  }

  function getDefense() {
    const bestDefense = handleNonFlexPosition(lineup, "D/ST", 1);
    bestRoster.push(
      `${DST} - ${bestDefense.player.fullName}: ${bestDefense.totalPoints}pts`
    );
    handleSum(bestSum, bestDefense.totalPoints);
    handleChanges(numChanges, bestDefense);
  }

  function getKicker() {
    const bestKicker = handleNonFlexPosition(lineup, "K", 1);
    bestRoster.push(
      `${K} - ${bestKicker.player.fullName}: ${bestKicker.totalPoints}pts`
    );
    handleSum(bestSum, bestKicker.totalPoints);
    handleChanges(numChanges, bestKicker);
    return bestKicker;
  }

  function handleChanges(numChanges, pos) {
    pos.position === "Bench" ? numChanges++ : numChanges;
    return numChanges;
  }

  function handleSum(bestSum, pos) {
    bestSum += pos.totalPoints;
    return bestSum;
  }

  return { bestRoster, bestRosterNames, bestSum, numChanges };
}
