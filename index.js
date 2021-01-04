// importing ff node package
import pkg from "espn-fantasy-football-api/node.js";
const { Client } = pkg;
import _ from "lodash";
const QB = "QB";
const RB = "RB";
const WR = "WR";
const SLOT = "RB/WR";
const TE = "TE";
const FLEX = "FLEX";
const OP = "OP";
const DST = "D/ST";
const K = "K";
const SEASON_ID = 2020;
const TEAM_ID = 5;
const LEAGUE_ID = 22824;
const SWID = "{12AA4968-2A22-4BB1-9FCE-204F0C714B89}";
const ESPNSS2 =
  "AECljsfesEWuioJ8K1iTu7XbKl6dRl%2B96VdROPcbMGV5SuRNRvFsa8Qqu8DOIiiDG554QksZmdvKlOpWf14HYPiA6A%2F69MOPEHSrvUpRFggfjK8ISMA8fkGe9ue0g7%2B7Lq%2FVr%2BnN7XCVfodfhq9nMrDwDwk8jTJt187rDuAZz5zFU%2F1tnNcdZmVg%2BQesP2LuuKcd3flZaL%2BMa2VPXsWFGyzkzPVkVzW8um9VNGdCWcSUWyptgnad%2BV9KdTud852hTrVl2RTQC9z9NFbBjnApFnn5";
// Creating client
const myClient = new Client({
  leagueId: LEAGUE_ID,
  seasonId: SEASON_ID,
  teamId: TEAM_ID,
});
// Setting session cookies, this is required if your league is private
myClient.setCookies({ espnS2: ESPNSS2, SWID: SWID });
// Scoring period is the week of the year.
// Preseason being week 0, the last week being 18
class Psychic {
  static filterPosition(boxscorePlayer, position) {
    return (
      boxscorePlayer.position === position ||
      _.includes(boxscorePlayer.player.eligiblePositions, position)
    );
  }
  static filterFlexPosition(boxscorePlayer, bestPos, position) {
    return (
      (boxscorePlayer.position === position ||
        _.includes(boxscorePlayer.player.eligiblePositions, position)) &&
      !_.isEqual(bestPos[0].player, boxscorePlayer.player) &&
      !_.isEqual(bestPos[1].player, boxscorePlayer.player)
    );
  }
  static handleNonFlexPosition(lineup, position, amount) {
    const players = _.filter(lineup, (player) =>
      this.filterPosition(player, position)
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

  static handleSumAndChanges(pos, bestSum, numChanges) {
    bestSum += pos.totalPoints;
    if (pos.position === "Bench") {
      numChanges += 1;
    }
  }

  static analyzeLineup(lineup, score) {
    let bestSum = 0;
    let numChanges = 0;
    const bestRoster = [];

    const bestQB = this.handleNonFlexPosition(lineup, "QB", 2);
    bestQB.forEach((qb) => {
      bestRoster.push(`${QB} - ${qb.player.fullName}: ${qb.totalPoints}pts`);
      //this.handleSumAndChanges(qb, bestSum, numChanges);
      bestSum += qb.totalPoints;
      if (qb.position === "Bench") {
        numChanges += 1;
      }
    });

    const bestRB = this.handleNonFlexPosition(lineup, "RB", 2);
    bestRB.forEach((rb) => {
      bestRoster.push(`${RB} - ${rb.player.fullName}: ${rb.totalPoints}pts`);
      bestSum += rb.totalPoints;
      if (rb.position === "Bench") {
        numChanges += 1;
      }
    });

    const bestWR = this.handleNonFlexPosition(lineup, "WR", 2);
    bestWR.forEach((wr) => {
      bestRoster.push(`${WR} - ${wr.player.fullName}: ${wr.totalPoints}pts`);
      bestSum += wr.totalPoints;
      if (wr.position === "Bench") {
        numChanges += 1;
      }
    });

    const flexPlayers = _.filter(
      lineup,
      (player) =>
        this.filterFlexPosition(player, bestQB, "QB") ||
        this.filterFlexPosition(player, bestRB, "RB") ||
        this.filterFlexPosition(player, bestWR, "WR") ||
        this.filterFlexPosition(player, "TE")
    );
    const sortedFlexPlayers = _.sortBy(flexPlayers, ["totalPoints"]);

    const flexPos = { SLOT: 1, FLEX: 1, OP: 1 };
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

    const bestTE = this.handleNonFlexPosition(lineup, "TE", 1);
    bestRoster.push(
      `${TE} - ${bestTE.player.fullName}: ${bestTE.totalPoints}pts`
    );
    bestSum += bestTE.totalPoints;
    if (bestTE.position === "Bench") {
      numChanges += 1;
    }
    const bestDefense = this.handleNonFlexPosition(lineup, "D/ST", 1);
    bestRoster.push(
      `${DST} - ${bestDefense.player.fullName}: ${bestDefense.totalPoints}pts`
    );
    bestSum += bestDefense.totalPoints;
    if (bestDefense.position === "Bench") {
      numChanges += 1;
    }
    const bestKicker = this.handleNonFlexPosition(lineup, "K", 1);
    bestRoster.push(
      `${K} - ${bestKicker.player.fullName}: ${bestKicker.totalPoints}pts`
    );
    bestSum += bestKicker.totalPoints;
    if (bestKicker.position === "Bench") {
      numChanges += 1;
    }

    if (score === bestSum) {
      numChanges = 0;
    }
    const plusMinus = score - bestSum;

    return {
      bestRoster,
      bestSum,
      currentScore: score,
      plusMinus,
      numChanges,
    };
  }

  static runForWeek({ seasonId, matchupPeriodId, scoringPeriodId, teamId }) {
    let bestLineup = [];
    return myClient
      .getBoxscoreForWeek({ seasonId, matchupPeriodId, scoringPeriodId })
      .then((boxes) => {
        _.forEach(boxes, (matchup) => {
          if (matchup.awayTeamId == teamId) {
            bestLineup.push(
              this.analyzeLineup(matchup.awayRoster, matchup.awayScore)
            );
          }
          if (matchup.homeTeamId == teamId) {
            bestLineup.push(
              this.analyzeLineup(matchup.homeRoster, matchup.homeScore)
            );
          }
        });
        return bestLineup;
      });
  }

  static runForSeason({ seasonId, teamId }) {
    let counter = 0;
    let arrayOfWeeklyData = [];
    let totalNumChanges = 0;
    let totalPlusMinus = 0;
    let bestScoreOfYear = 0;
    for (let i = 1; i < 17; i++) {
      this.runForWeek({
        seasonId: seasonId,
        matchupPeriodId: i,
        scoringPeriodId: i,
        teamId: teamId,
      }).then((result) => {
        // console.log(`------------------------------- Week ${i}-------------------------------`);
        if (!_.isEmpty(result)) {
          const key = result[Object.keys(result)[0]];
          arrayOfWeeklyData.push(key);
          counter = arrayOfWeeklyData.length - 1;
          totalNumChanges = totalNumChanges + arrayOfWeeklyData[counter].numChanges;
          totalPlusMinus = totalPlusMinus + arrayOfWeeklyData[counter].plusMinus;
          if (arrayOfWeeklyData[counter].bestSum > bestScoreOfYear) {
            bestScoreOfYear = arrayOfWeeklyData[counter].bestSum;
          }
          console.log(`Total Changes: ${totalNumChanges}`);
          console.log(`+/- : ${totalPlusMinus}`);
          console.log(`Best Score: ${bestScoreOfYear}`)
        } else {
          console.log(`Warning: it appears week ${i} has not been played yet.`);
        }

      });
    }


        console.log("Total Number of Changes: " + totalNumChanges);
        console.log("Actual Score Handicap: " + totalPlusMinus);
        console.log("Best Score of the Year: " + bestScoreOfYear);
        return {
          arrayOfWeeklyData,
          totalNumChanges,
          totalPlusMinus,
          bestScoreOfYear,
        };
  }
}

Psychic.runForSeason({
  seasonId: SEASON_ID,
  teamId: 5,
});
