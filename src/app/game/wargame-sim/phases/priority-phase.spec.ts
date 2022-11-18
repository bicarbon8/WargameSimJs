import { BattleManager } from '../battles/battle-manager';
import { PlayerManager } from '../players/player-manager';
import { Team } from '../teams/team';
import { TeamManager } from '../teams/team-manager';
import { UIManager } from '../ui/ui-manager';
import { PhaseManager } from './phase-manager';
import { PriorityPhase } from './priority-phase';

describe('Priority', () => {
  it('will randomly prioritise team orders on runPhase call', async () => {
    let teamMgr = new TeamManager(new PlayerManager());
    for (var i=0; i<10; i++) {
      teamMgr.addTeam({name:`team-${i}`, points:100});
    }
    const unordered: Team[] = teamMgr.teams;
    const uiMgr: UIManager = new UIManager();
    const priorityPhase: PriorityPhase = new PriorityPhase(new PhaseManager(teamMgr, uiMgr, new BattleManager(teamMgr, uiMgr)), teamMgr);
    priorityPhase.start();

    let same: boolean = true;
    for (var i=0; i<teamMgr.teams.length; i++) {
      if(priorityPhase.getTeam(i).id !== unordered[i].id) {
        same = false;
        break;
      }
    }
    expect(same).toBe(false);
  });
});
