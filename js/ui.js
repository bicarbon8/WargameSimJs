var WarGame = WarGame || {};
WarGame.UI = {
    counter: 0,
    ALERT_GOOD: 'alert-success',
    ALERT_INFO: 'alert-info',
    ALERT_BAD: 'alert-danger',

    displayAlert: function (message, type) {
        setTimeout(function () {
            if (!type) {
                type = WarGame.UI.ALERT_INFO;
            }
            var alertsContainer = WarGame.UI.getAlertsContainer();
            var alertId = WarGame.UI.counter++;
            alertsContainer.innerHTML = '<div id="alert-' + alertId + '" class="alert ' + type + '" role="alert" style="display: none;">' +
                message + '</div>' + alertsContainer.innerHTML;
            $("#alert-" + alertId).fadeIn(100, function () {
                $("#alert-" + alertId).delay(5000).fadeOut(1000, function () {
                    $("#alert-" + alertId).remove();
                });
            });
        },0);
    },

    displayDefeatedAlert: function (player) {
        WarGame.UI.displayAlert(player.team.name + ' - ' + player.name + ' defeated!', WarGame.UI.ALERT_BAD);
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

        var container = document.querySelector('#playfield');
        container.insertBefore(alertsContainer, container.firstChild);
    },
};
