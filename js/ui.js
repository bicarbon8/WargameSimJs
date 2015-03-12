var WarGame = WarGame || {};
WarGame.UI = {
    counter: 0,

    displayAlert: function (message) {
        var alertsContainer = WarGame.UI.getAlertsContainer();
        var alertId = WarGame.UI.counter++;
        alertsContainer.innerHTML = '<div id="' + alertId + '" class="alert alert-danger" role="alert" style="display: none;">' +
            message + '</div>' + alertsContainer.innerHTML;
        $("#" + alertId).fadeIn(100).delay(5000).fadeOut(1000);
    },

    displayDefeatedAlert: function (player) {
        WarGame.UI.displayAlert(player.team.name + ' - ' + player.name + ' defeated!');
    },

    getAlertsContainer: function () {
        var alertsContainer;
        try {
            alertsContainer = document.querySelector('#alertsContainer');
            if (!alertsContainer) {
                throw 'does not exist';
            }
        } catch (e) {
            WarGame.UI.createAlertsContainer();
            alertsContainer = document.querySelector('#alertsContainer');
        }
        return alertsContainer;
    },

    createAlertsContainer: function () {
        alertsContainer = document.createElement('div');
        alertsContainer.setAttribute("id", 'alertsContainer');
        alertsContainer.style.position = 'fixed';
        alertsContainer.style.top = 0;
        alertsContainer.style.left = 0;
        alertsContainer.style.width = '100%';

        var container = document.querySelector('#playfield');
        container.insertBefore(alertsContainer, container.firstChild);
    },
};
