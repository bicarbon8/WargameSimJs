import { Team } from './team';
import { TeamManager } from './team-manager';

describe('TeamManager', () => {
  it('can return teams sorted by priority', () => {
    let mgr: TeamManager = new TeamManager();
    let teamA = new Team('teamA', 'red', 100);
    teamA.setPriority(2);
    let teamB = new Team('teamB', 'blue', 100);
    teamB.setPriority(0);
    let teamC = new Team('teamC', 'green', 100);
    teamC.setPriority(1);
    mgr.addTeams(teamA, teamB, teamC);

    let expected: Team[] = [teamB, teamC, teamA];
    expect(mgr.getTeamsByPriority()).toEqual(expected);
  });

  it('can get teams sorted by score', () => {
    let mgr: TeamManager = new TeamManager();
    let teamA = new Team('teamA', 'red', 100);
    teamA.addToScore(1);
    let teamB = new Team('teamB', 'blue', 100);
    teamB.addToScore(100);
    let teamC = new Team('teamC', 'green', 100);
    teamC.addToScore(50);
    mgr.addTeams(teamA, teamB, teamC);

    let expected: Team[] = [teamB, teamC, teamA];
    expect(mgr.getTeamsByScore()).toEqual(expected);
  });
});
