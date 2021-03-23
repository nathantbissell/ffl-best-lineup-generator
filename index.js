import pkg from "espn-fantasy-football-api/node.js";
//import pkg from "espn-fantasy-football-api/node-dev.js";
const { Client } = pkg;
import _ from "lodash";
import analyzeLineup from "./components/analyzeLineup.js";
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
  runForWeek({ seasonId, matchupPeriodId, scoringPeriodId, teamId }) {
    let bestLineup = [];
    return myClient
      .getBoxscoreForWeek({ seasonId, matchupPeriodId, scoringPeriodId })
      .then((boxes) => {
        _.forEach(boxes, (matchup) => {
          matchup.awayTeamId == teamId
            ? bestLineup.push(
                analyzeLineup(matchup.awayRoster, matchup.awayScore)
              )
            : bestLineup.push(
                analyzeLineup(matchup.homeRoster, matchup.homeScore)
              );
        });
        return bestLineup;
      });
  }

  runForSeason({ seasonId, teamId }) {
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
        console.log(
          `------------------------------- Week ${i}-------------------------------`
        );
        if (!_.isEmpty(result)) {
          const key = result[Object.keys(result)[0]];
          arrayOfWeeklyData.push(key);
          counter = arrayOfWeeklyData.length - 1;
          totalNumChanges =
            totalNumChanges + arrayOfWeeklyData[counter].numChanges;
          totalPlusMinus =
            totalPlusMinus + arrayOfWeeklyData[counter].plusMinus;
          if (arrayOfWeeklyData[counter].bestSum > bestScoreOfYear) {
            bestScoreOfYear = arrayOfWeeklyData[counter].bestSum;
          }

          // for yearly amounts
          console.log(`Total Roster Changes: ${totalNumChanges}`);
          console.log(`Handicap: ${totalPlusMinus}`);
          console.log(`Best Score: ${bestScoreOfYear}`);
        } else {
          console.log(`Warning: it appears week ${i} has not been played yet.`);
        }
      });
    }

    return {
      arrayOfWeeklyData,
      totalNumChanges,
      totalPlusMinus,
      bestScoreOfYear,
    };
  }
}

let psy = new Psychic();
psy.runForSeason({
  seasonId: SEASON_ID,
  teamId: 1,
});

// let team = 1;
// for (let period = 1; period < 16; period++) {
//   Psychic.runForWeek({
//     seasonId: SEASON_ID,
//     scoringPeriodId: period,
//     matchupPeriodId: period,
//     teamId: team,
//   });
//   console.log(bestLineup);
// }
