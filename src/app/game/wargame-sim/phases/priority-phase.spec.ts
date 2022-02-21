import { Team } from '../teams/team';
import { TeamManager } from '../teams/team-manager';
import { PriorityPhase } from './priority-phase';

describe('Priority', () => {
  it('will randomly prioritise team orders on runPhase call', async () => {
    let teamMgr = new TeamManager();
    for (var i=0; i<10; i++) {
      let team: Team = new Team(`team-${i}`, 'c0c0c0', 100);
      teamMgr.addTeams(team);
    }
    let unordered: Team[] = teamMgr.getTeamsByPriority();
    let priorityPhase: PriorityPhase = new PriorityPhase(teamMgr);

    for (var i=0; i<unordered.length; i++) {
      expect(unordered[i].getPriority()).toBe(0);
    }

    await priorityPhase.runPhase();

    let ordered: Team[] = teamMgr.getTeamsByPriority();
    expect(ordered).not.toEqual(unordered);
    for (var i=0; i<ordered.length; i++) {
      expect(ordered[i].getPriority()).toBe(i);
    }
  });
});
