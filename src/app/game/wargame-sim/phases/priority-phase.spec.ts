import { Team } from '../teams/team';
import { TeamManager } from '../teams/team-manager';
import { PriorityPhase } from './priority-phase';

describe('Priority', () => {
  it('will randomly prioritise team orders on runPhase call', async () => {
    let teamMgr = new TeamManager();
    for (var i=0; i<10; i++) {
      let team: Team = new Team({name:`team-${i}`, points:100});
      teamMgr.addTeam(team);
    }
    let unordered: Team[] = teamMgr.teams();
    let priorityPhase: PriorityPhase = new PriorityPhase(teamMgr);

    priorityPhase.start();

    let ordered: Team[] = teamMgr.teams();
    expect(ordered).not.toEqual(unordered);
  });
});
