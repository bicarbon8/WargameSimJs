var WarGame = WarGame || {};
WarGame.WoundChart = {
    chart: [
    //    1   2   3   4   5   6   7   8   9   10+ defence ('[]' means cannot be hit)
        [[4],[5],[5],[6],[6],[6,4],[6,5],[6,6],[],[]],   // strength 1
        [[4],[4],[5],[5],[6],[6],[6,4],[6,5],[6,6],[]],  // strength 2
        [[3],[4],[4],[5],[5],[6],[6],[6,4],[6,5],[6,6]], // strength 3
        [[3],[3],[4],[4],[5],[5],[6],[6],[6,4],[6,5]],   // strength 4
        [[3],[3],[3],[4],[4],[5],[5],[6],[6],[6,4]],     // strength 5
        [[3],[3],[3],[3],[4],[4],[5],[5],[6],[6]],       // strength 6
        [[3],[3],[3],[3],[3],[4],[4],[5],[5],[6]],       // strength 7
        [[3],[3],[3],[3],[3],[3],[4],[4],[5],[5]],       // strength 8
        [[3],[3],[3],[3],[3],[3],[3],[4],[4],[5]],       // strength 9
        [[3],[3],[3],[3],[3],[3],[3],[3],[4],[4]],       // strength 10+
    ],

    /**
     * function will determine if a single attack point results in a success
     * or failure between two opponents
     * @param {WarGame.Player} attacker - the player initiating the attack
     * @param {WarGame.Player} defender - the player being attacked
     * @returns {boolean} true if the attack is successful, otherwise false
     */
    tryWound: function (attacker, defender) {
        var atk, def;
        if (attacker.attributes.strength > 10) {
            atk = 9;
        } else {
            atk = attacker.attributes.strength - 1;
        }
        if (attacker.attributes.defence > 10) {
            def = 9;
        } else {
            def = attacker.attributes.defence - 1;
        }
        var needed = WarGame.WoundChart.chart[atk][def];
        for (var i=0; i<needed.length; i++) {
            var need = needed[i];
            var roll = WarGame.Utils.diceRoll();
            if (roll < need) {
                return false; // exit on failure
            }
        }

        return true;
    },
};
