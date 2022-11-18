var WarGame = WarGame || {};
WarGame.UI = {
    COUNTER: 0,
    ALERT_GOOD: 'alert-success',
    ALERT_INFO: 'alert-info',
    ALERT_BAD: 'alert-danger',
    PLAYFIELD: null,

    initialize: function () {
        WarGame.UI.PLAYFIELD = document.querySelector('#playfield');
        WarGame.UI.Plotter.initialize();
        WarGame.UI.createMenusContainer();
    },

    getPlayField: function () {
        return WarGame.UI.PLAYFIELD;
    },

    addMesh: function (mesh) {
        WarGame.UI.Plotter.addMesh(mesh);
    },

    removeMesh: function (mesh) {
        WarGame.UI.Plotter.removeMesh(mesh);
    },

    displayAlert: function (message, type) {
        setTimeout(function () {
            if (!type) {
                type = WarGame.UI.ALERT_INFO;
            }
            var alertsContainer = WarGame.UI.getAlertsContainer();
            var alertId = WarGame.UI.COUNTER++;
            alertsContainer.innerHTML = '<div id="alert-' + alertId + '" class="alert ' + type + '" role="alert" style="display: none;">' +
                message + '</div>' + alertsContainer.innerHTML;
            $("#alert-" + alertId).fadeIn(100, function () {
                $("#alert-" + alertId).delay(5000).fadeOut(1000, function () {
                    $("#alert-" + alertId).remove();
                });
            });
        }, 0);
    },

    displayDefeatedAlert: function (player) {
        setTimeout(function () {
            WarGame.UI.displayAlert(player.team.name + ' - ' + player.name + ' defeated!', WarGame.UI.ALERT_BAD);
        }, 0);
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
        var alertsContainer = document.createElement('div');
        alertsContainer.setAttribute("id", 'alertsContainer');

        var container = document.querySelector('#middle');
        container.insertBefore(alertsContainer, container.firstChild);
    },

    getMenusContainer: function () {
        var menusContainer;
        try {
            menusContainer = document.querySelector('#menusContainer');
            if (!menusContainer) {
                throw 'does not exist';
            }
        } catch (e) {
            WarGame.UI.createAlertsContainer();
            menusContainer = document.querySelector('#menusContainer');
        }
        return menusContainer;
    },

    createMenusContainer: function () {
        var menusContainer = document.createElement('div');
        menusContainer.setAttribute('id', 'menusContainer');
        menusContainer.className = 'container-fluid';
        menusContainer.innerHTML = '' +
'<div class="row-fluid">' +
'<div id="left" class="col-xs-3"></div>' +
'<div id="middle" class="col-xs-6"></div>' +
'<div id="right" class="col-xs-3"></div>' +
'</div>';

        WarGame.UI.getPlayField().insertBefore(menusContainer, playfield.firstChild);
    },

    removeMenusContainer: function () {
        var menusContainer = document.querySelector('#menusContainer');
        WarGame.UI.getPlayField().removeChild(menusContaner);
    },

    getPhaseContainers: function () {
        var phases = [];
        var p = document.querySelector('#priorityRow');
        if (!p) {
            var parentElement;
            if (WarGame.Teams.CURRENT === 0) {
                parentElement = document.querySelector('#left');
            } else {
                parentElement = document.querySelector('#right');
            }
            WarGame.UI.createPhaseContainers(parentElement);
            p = document.querySelector('#priorityRow');
            phases.push(p);
        }
        phases.push(document.querySelector('#moveRow'));
        phases.push(document.querySelector('#shootRow'));
        phases.push(document.querySelector('#fightRow'));

        return phases;
    },

    createPhaseContainers: function (parentElement) {
        for (var i=0; i<=WarGame.Phases.FIGHTING; i++) {
            var pc = document.createElement('div');
            pc.className = 'row-fluid';
            switch (i) {
                case WarGame.Phases.PRIORITY:
                    pc.setAttribute('id', 'priorityRow');
                    pc.innerHTML = '' +
                    '<h3><span id="currentTeam" class="label label-default">loading...</span> ' +
                    '<span id="currentPhase" class="label label-default">loading...</span></h3>';
                    break;
                case WarGame.Phases.MOVEMENT:
                    pc.setAttribute('id', 'moveRow');
                    break;
                case WarGame.Phases.SHOOTING:
                    pc.setAttribute('id', 'shootRow');
                    break;
                case WarGame.Phases.FIGHTING:
                    pc.setAttribute('id', 'fightRow');
                    break;
            }
            parentElement.appendChild(pc);
        }
    },

    removePhaseContainers: function () {
        WarGame.UI.setContents('left', '');
        WarGame.UI.setContents('right', '');
    },

    setCurrentPhaseText: function (phaseName) {
        WarGame.UI.setContents('currentPhase', phaseName);
    },

    setCurrentTeamText: function (teamName) {
        WarGame.UI.removePhaseContainers();
        var phases = WarGame.UI.getPhaseContainers();
        WarGame.UI.setContents('currentTeam', teamName);
        WarGame.UI.setCurrentPhaseText(WarGame.Phases.getCurrentPhaseName());
    },

    setContents: function (containerId, contentsStr) {
        document.querySelector('#' + containerId).innerHTML = contentsStr;
    },

    getContents: function (containerId) {
        return document.querySelector('#' + containerId).innerHTML;
    },

    setValue: function (fieldId, valueStr) {
        document.querySelector('#' + fieldId).value = valueStr;
    },

    getValue: function (fieldId) {
        return document.querySelector('#' + fieldId).value;
    },

    update: function () {
        WarGame.UI.Plotter.render();
    },

    reset: function () {
        WarGame.UI.removeMenusContainer();
        WarGame.UI.Plotter.reset();
    },
};
