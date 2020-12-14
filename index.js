// importing ff node package
const { Client } = require('espn-fantasy-football-api/node');
const _ = require('lodash');
QB = 'QB';
RB = 'RB';
WR = 'WR';
SLOT = 'RB/WR';
TE = 'TE';
FLEX = 'FLEX';
OP = 'OP';
DST = 'D/ST';
K = 'K';
SEASON_ID = 2020;
TEAM_ID = 5;
LEAGUE_ID = 22824;
SWID = "{12AA4968-2A22-4BB1-9FCE-204F0C714B89}";
ESPNSS2 = "AECljsfesEWuioJ8K1iTu7XbKl6dRl%2B96VdROPcbMGV5SuRNRvFsa8Qqu8DOIiiDG554QksZmdvKlOpWf14HYPiA6A%2F69MOPEHSrvUpRFggfjK8ISMA8fkGe9ue0g7%2B7Lq%2FVr%2BnN7XCVfodfhq9nMrDwDwk8jTJt187rDuAZz5zFU%2F1tnNcdZmVg%2BQesP2LuuKcd3flZaL%2BMa2VPXsWFGyzkzPVkVzW8um9VNGdCWcSUWyptgnad%2BV9KdTud852hTrVl2RTQC9z9NFbBjnApFnn5";
// Creating client
const myClient = new Client({ leagueId:  LEAGUE_ID, seasonId: SEASON_ID, teamId: TEAM_ID });
// Setting session cookies, this is required if your league is private
myClient.setCookies({ espnS2: ESPNSS2, SWID: SWID});
// Scoring period is the week of the year. 
// Preseason being week 0, the last week being 18
class Psychic {
  static filterPosition(boxscorePlayer, position) {
    return (
      boxscorePlayer.position === position ||
      _.includes(boxscorePlayer.player.eligiblePositions, position)
    );
  }
  static handleNonFlexPosition(lineup, position, amount) {
    const players = _.filter(lineup, (player) => this.filterPosition(player, position));
    const sortedPlayers = _.sortBy(players, ['totalPoints']);
    if (amount === 2) {
        let list = [];
        list.push(_.last(sortedPlayers))
        sortedPlayers.pop();
        list.push(_.last(sortedPlayers));
        return list;
    } else {
        return _.last(sortedPlayers);
    }
  }

//   static handleMultipleOfSamePosition(position) {
//     bestPos.forEach(pos => {
//         bestRoster.push(`${QB} - ${qb.player.fullName}: ${qb.totalPoints}pts`);
//         bestSum += qb.totalPoints;
//         if (qb.position === 'Bench') {
//           numChanges += 1;
//         }
//     })
// }



  static analyzeLineup(lineup, score) {
    let bestSum = 0;
    let numChanges = 0;
    const bestRoster = [];

    handleSumAndChanges = (pos) => {
        bestSum += pos.totalPoints;
        if (pos.position === 'Bench') {
          numChanges += 1;
        }
    }

    const bestDefense = this.handleNonFlexPosition(lineup, 'D/ST', 1)
    bestRoster.push(`${DST} - ${bestDefense.player.fullName}: ${bestDefense.totalPoints}pts`);
    bestSum += bestDefense.totalPoints;
    if (bestDefense.position === 'Bench') {
      numChanges += 1;
    }
    const bestKicker = this.handleNonFlexPosition(lineup, 'K', 1)
    bestRoster.push(`${K} - ${bestKicker.player.fullName}: ${bestKicker.totalPoints}pts`);
    bestSum += bestKicker.totalPoints;
    if (bestKicker.position === 'Bench') {
      numChanges += 1;
    }

    const bestQB = this.handleNonFlexPosition(lineup, 'QB', 2)
    bestQB.forEach(qb => {
        bestRoster.push(`${QB} - ${qb.player.fullName}: ${qb.totalPoints}pts`);
        this.handleSumAndChanges(qb);
    })




    const bestRB = this.handleNonFlexPosition(lineup, 'RB', 2)
    bestRoster.push(`${RB} - ${bestRB.player.fullName}: ${bestRB.totalPoints}pts`);
    bestSum += bestRB.totalPoints;
    if (bestRB.position === 'Bench') {
      numChanges += 1;
    }

    const bestWR = this.handleNonFlexPosition(lineup, 'WR', 2)
    bestRoster.push(`${WR} - ${bestWR.player.fullName}: ${bestWR.totalPoints}pts`);
    bestSum += bestWR.totalPoints;
    if (bestWR.position === 'Bench') {
      numChanges += 1;
    }

    const flexPlayers = _.filter(lineup, (player) => this.filterPosition(player, 'QB') ||
    this.filterPosition(player, 'RB') ||
      this.filterPosition(player, 'WR') ||
      this.filterPosition(player, 'TE')
    );
    const sortedFlexPlayers = _.sortBy(flexPlayers, ['totalPoints']);
    const flexPos = { QB: 2, RB: 2, WR: 2, SLOT: 1, TE: 1, FLEX: 1, OP: 1 };
    while (_.sum(_.values(flexPos)) && !_.isEmpty(sortedFlexPlayers)) {
      const player = sortedFlexPlayers.pop();
      const acceptPlayer = (pos) => {
        bestRoster.push(`${pos} - ${player.player.fullName}: ${player.totalPoints}pts`);
        bestSum += player.totalPoints;
        if (player.position === 'Bench') {
          numChanges += 1;
        }
      }
      if (flexPos.QB && _.includes(player.player.eligiblePositions, 'QB')) {
        acceptPlayer(QB);
        flexPos.QB -= 1;
      } else if (flexPos.RB && _.includes(player.player.eligiblePositions, 'RB')) {
        acceptPlayer(RB);
        flexPos.RB -= 1;
      } else if (flexPos.WR && _.includes(player.player.eligiblePositions, 'WR')) {
        acceptPlayer(WR);
        flexPos.WR -= 1;
      } else if (flexPos.TE && _.includes(player.player.eligiblePositions, 'TE')) {
        acceptPlayer(TE);
        flexPos.TE -= 1;
      }  else if (flexPos.SLOT > 0 && (flexPos.RB || flexPos.WR) && _.includes(player.player.eligiblePositions, 'RB/WR')) {
        acceptPlayer(SLOT);
        flexPos.SLOT -= 1;
      } else if (flexPos.FLEX > 0 && (flexPos.RB || flexPos.WR || flexPos.TE) && _.includes(player.player.eligiblePositions, 'RB/WR/TE')) {
        acceptPlayer(FLEX);
        flexPos.FLEX -= 1;
      } else if (flexPos.OP > 0 && (flexPos.QB || flexPos.RB || flexPos.WR || flexPos.TE) && _.includes(player.player.eligiblePositions, 'OP')) {
        acceptPlayer(OP);
        flexPos.OP -= 1;
      }
    }
    return {
      bestSum,
      bestRoster,
      currentScore: score,
      numChanges
    };
  }
  static runForWeek({ seasonId, matchupPeriodId, scoringPeriodId }) {
    const bestLineups = {};
    return myClient.getBoxscoreForWeek({ seasonId, matchupPeriodId, scoringPeriodId }).then((boxes) => {
      _.forEach(boxes, (box) => {
       // bestLineups[box.awayTeamId] = this.analyzeLineup(box.awayRoster, box.awayScore);
         bestLineups[box.homeTeamId] = this.analyzeLineup(box.homeRoster, box.homeScore);
      });
      return bestLineups;
    });
  }
}
Psychic.runForWeek({ seasonId: 2020, matchupPeriodId: 13, scoringPeriodId: 13 }).then((result) => {
  console.log(result);
  return result;
});