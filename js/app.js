// Initialize Firebase
var config = {
  apiKey: "AIzaSyAsf0kx-0p2SYu-pJPCaLFLO3zhjcDlOcY",
  authDomain: "fiver-3bf1d.firebaseapp.com",
  databaseURL: "https://fiver-3bf1d.firebaseio.com",
  projectId: "fiver-3bf1d",
  storageBucket: "fiver-3bf1d.appspot.com",
  messagingSenderId: "471072820035"
};
firebase.initializeApp(config);

var players = JSON.parse(localStorage.getItem('players')) || [
  { id: 0, name: "tbc", weighting: 0, balance: 0.00},
  { id: 1, name: "Lee", weighting: 3, balance: 0.00},
  { id: 2, name: "Auldrius", weighting: 3, balance: 0.00},
  { id: 3, name: "Paul", weighting: 3, balance: 0.00},
  { id: 4, name: "Liam", weighting: 5, balance: 0.00},
  { id: 5, name: "Brian", weighting: 2, balance: 0.00},
  { id: 6, name: "Adam", weighting: 2, balance: 0.00},
  { id: 7, name: "Jake", weighting: 3, balance: 0.00},
  { id: 8, name: "Mark", weighting: 5, balance: 0.00},
  { id: 9, name: "Rich V", weighting: 3, balance: 0.00},
  { id: 10, name: "Si", weighting: 4, balance: 0.00},
  { id: 11, name: "Dean", weighting: 2, balance: 0.00},
  { id: 12, name: "Aders", weighting: 3, balance: 0.00},
  { id: 13, name: "Jon", weighting: 3, balance: 0.00},
  { id: 14, name: "Joe", weighting: 5, balance: 0.00},
  { id: 15, name: "James", weighting: 3, balance: 0.00},
  { id: 16, name: "Russ", weighting: 2, balance: 0.00},
  { id: 17, name: "Mike", weighting: 3, balance: 0.00},
  { id: 18, name: "Rich M", weighting: 3, balance: 0.00}
];

var gameIndex = parseInt(localStorage.getItem("gameIndex")) || -1;
var gameCount = parseInt(localStorage.getItem("gameCount")) || 0;

var games = [];
if (gameCount > 0) {
  for (i = 0; i < gameCount; i++) { 
    games.push(JSON.parse(localStorage.getItem("game|" + i)));
  }
}

const settings = {
  team1name : "Red",
  team2name : "White",
  teamSize : 5,
  gameFrequency: 7,
  gameFee : 6.00

}

function Player(name, weighting, balance) {
  this.id = players.length;
  this.name = name;
  this.weighting = weighting;
  this.balance = balance;
}

function Game(gameDate, team1, team2) {
  this.gameDate = gameDate;
  this.team1 = team1;
  this.team2 = team2;
};

// refactored to be a self executing function
const Helpers = (function () {

  return {
    formatDate: function(dt) {
      const newDate = new Date(dt);
      const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
      return newDate.toLocaleString('en-us', options);
    },

    formatMoney: function(value) {
      if (!value || value === "NaN") {
        return "£0.00";
      }
      return "£" + parseFloat(value).toFixed(2);
    },

    maskMoney: function(e) {
      var val = e.target.value.replace(".", "");
      if (val == "") {
        return;
      }

      val = val / 100;
      e.target.value = val === 0 ? "" : val.toFixed(2);

      payButton.dataset.amount = val;
      payButton.classList.add("is-disabled");
      payToggleIcon.classList.remove("fa-check-square-o");
      payToggleIcon.classList.add("fa-square-o");

      savePlayerButton.classList.add("is-disabled");
      savePlayerToggleIcon.classList.remove("fa-check-square-o");
      savePlayerToggleIcon.classList.add("fa-square-o");

    },

    getGame: function() {
      var game = games[gameIndex];
      if (!game) {
        gameIndex = games.length - 1;
        game = games[gameIndex];
      }
      return game;
    },

    displayTeam: function (team = [], playerList, unselectedIcon = "fa-user", selectedIcon = "fa-gbp", idxoffset = 0) {

      playerList.innerHTML = team.map((p, i) => {
          return Render.playerBox (p, unselectedIcon, selectedIcon, i + idxoffset, playerList.id);
      }).join("");
    }
  }

})();

const Render = {

  playerBox: function (player, unselectedIcon = "fa-user", selectedIcon ="fa-gbp", i, listId) {

    const paidClass = (player.paid && player.paid > 0) ? "paid" : "unpaid";
    let bal = parseFloat(player.balance);
    player.listidx = i;
    selectedIcon = (player.id === 0) ? unselectedIcon : selectedIcon;
    hidePaid = (listId.substring(0,4) === "team") ? "" : "is-invisible";

    // show balance reduction if playing this week, and thats the week being displayed
    if (player.id != 0 && listId.substring(0,4) === "team" && gameIndex === gameCount - 1) {
      bal = bal - parseFloat(settings.gameFee);
    }
    
    return `
      <li class="box is-paddingless player-box ${paidClass}" data-playerid="${player.id}" data-listidx="${i}">
        <div class="player-box-left">
            <span class="unselected icon is-large">
            <i class="fa ${unselectedIcon}"></i>
          </span>
          <a data-action="${(player.id === 0) ? "" : "pay"}">
            <span class="selected icon is-large">
                <i class="fa ${selectedIcon}"></i>
            </span>
          </a>
        </div>
        <div class="player-box-centre">
            <p class="player-name">${player.name}</p>
            <p class="player-monies ${hidePaid}">Paid: <strong>${Helpers.formatMoney(player.paid)}</strong></p>
            <p class="player-monies">Balance: <strong>${Helpers.formatMoney(bal)}</strong></p>
        </div>
        <div class="player-box-right">
          <a data-action="action">
            <span class="unselected icon is-large">
              <i class="fa fa-chevron-right"></i>
            </span>
          </a>
        </div>
      </li>
    `;
  },

  historyRow: function(dt, name, paid) {
    return `
      <tr>
        <td>${dt}</td>
        <td>${name}</td>
        <td>${Helpers.formatMoney(paid)}</td>
      </tr>
    `;
  }
}

const GamePage = {

  init: function() {
    const game = Helpers.getGame();
    const gd = document.querySelector("#game-date");
    const gl = document.querySelector("#game-lock i");
    const subs = GamePage.subs(game);
    
    gd.innerHTML = Helpers.formatDate(game.gameDate);

    if (gameIndex === 0) {
      prevGame.classList.add("is-invisible");
    }
    else {
      prevGame.classList.remove("is-invisible");
    }

    if (gameIndex === games.length - 1) {
      gl.classList.add("fa-unlock");
      gl.classList.remove("fa-lock");
    }
    else {
      gl.classList.remove("fa-unlock");
      gl.classList.add("fa-lock");
    }

    Helpers.displayTeam(game.team1, team1List);
    Helpers.displayTeam(game.team2, team2List, "fa-user-o", "fa-gbp", settings.teamSize);
    Helpers.displayTeam(subs, subsList, "fa-user-circle-o", "", settings.teamSize * 2);

    localStorage.setItem("gameIndex", gameIndex);
    localStorage.setItem("game|" + gameIndex, JSON.stringify(game));
    localStorage.setItem("players", JSON.stringify(players));
  },

  showNextGame: function() {
    if (!games[gameIndex + 1]) {
      GamePage.addGameInit();
    }
    else {
      gameIndex += 1;
      GamePage.init();
    }
  },

  showPrevGame: function() {
    if (games[gameIndex - 1]) {
      gameIndex -= 1;
      GamePage.init();
    }
  },

  subs: function (game) {
    const teams = game.team1.concat(game.team2);
    var subs = players.filter(p => (teams.findIndex(teamplayer => (teamplayer.id === p.id)) === -1));
    
    if (subs.indexOf(players[0]) === -1) {
      subs.unshift(players[0]);
    }

    return subs;

  },

  selectPlayer: function (e) {

    if (gameIndex != games.length - 1) return;

    const li = event.target.closest("li");
    const a = event.target.closest("a");
    if(!li && !a) {return};

    if(a && a.dataset.action == "pay") {
      const game = Helpers.getGame();
      const playerSelected = document.querySelector(".team li.selected");
      const player = game.team1.find(player => (player.listidx == playerSelected.dataset.listidx)) || game.team2.find(player => (player.listidx == playerSelected.dataset.listidx));
      const modal = document.querySelector("#pay-modal");
      const modalTitle = document.querySelector("#pay-name");
      modalTitle.innerHTML = player.name;
      payMoneyField.value;
      modal.classList.add("is-active");
      return;
    }

    // if the player was clicked a second time show the list of subs
    if(a && a.dataset.action == "action") {
      const modal = document.querySelector("#subs-modal");
      modal.classList.add("is-active");
      return;
    }

    if(li) {li.classList.toggle("selected")};

    // if 2 players are selected then swap them
    if (document.querySelectorAll(".team li.selected").length == 2) {
      const playersToSwap = document.querySelectorAll(".team li.selected");
      const swap1 = {playerid: playersToSwap[0].dataset.playerid, listidx: playersToSwap[0].dataset.listidx};
      const swap2 = {playerid: playersToSwap[1].dataset.playerid, listidx: playersToSwap[1].dataset.listidx};
      
      GamePage.swapPlayers(Helpers.getGame(), swap1, swap2);;

      GamePage.closeSubsModal();
      GamePage.init();

      //remove selected class from all players
      const playerBoxes = document.querySelectorAll(".team li");
      [].forEach.call(playerBoxes, function(playerBox) {
        playerBox.classList.remove("selected");
      });
    }
  },

  swapPlayers: function (game, swap1, swap2){

    const subs = GamePage.subs(game);
    var teams = game.team1.concat(game.team2).concat(subs);

    const player1 = teams.find(p => (p.listidx == swap1.listidx));
    const player2 = teams.find(p => (p.listidx == swap2.listidx));

    const tempPlayer = Object.assign({}, player1);
    teams[swap1.listidx] = teams[swap2.listidx];
    teams[swap2.listidx] = tempPlayer;

    game.team1 = teams.slice(0,settings.teamSize);
    game.team2 = teams.slice(settings.teamSize,settings.teamSize * 2);
    
  },

  addPayment: function(e) {
    const a = event.target.closest("a");
    if(!a) {return};

    const game = Helpers.getGame();
    const amount = a.dataset.amount;
    const playerSelected = document.querySelector(".team li.selected");
    const player = game.team1.find(player => (player.listidx == playerSelected.dataset.listidx)) || game.team2.find(player => (player.listidx == playerSelected.dataset.listidx));

    if(player) {
      // remove any existing payment
      if (player.paid) {
        player.balance = parseFloat(player.balance) - parseFloat(player.paid);
      }
      player.paid = parseFloat(amount).toFixed(2);
      player.balance = parseFloat(player.balance) + parseFloat(player.paid);
    }

    payMoneyField.value = "";
    payButton.dataset.amount = 0.00;
    payButton.classList.add("is-disabled");
    payToggleIcon.classList.remove("fa-check-square-o");
    payToggleIcon.classList.add("fa-square-o");

    GamePage.closePayModal();
    GamePage.init();
  },

  payToggleButton: function(e) {
    payToggleIcon.classList.toggle("fa-check-square-o");
    payToggleIcon.classList.toggle("fa-square-o");
    payButton.classList.toggle("is-disabled");
  },

  addGameToggleButton: function(e) {
    addGameToggleIcon.classList.toggle("fa-check-square-o");
    addGameToggleIcon.classList.toggle("fa-square-o");
    addGameButton.classList.toggle("is-disabled");
  },

  closeSubsModal: function() {
    const modal = event.target.closest(".modal");
    if (modal) {modal.classList.remove("is-active")};
  },

  closePayModal: function() {
    const modal = event.target.closest(".modal");
    if (modal) {modal.classList.remove("is-active")};
  },

  addGameInit: function() {
    const addGameDate = document.querySelector("#add-game-date");
    let dt = new Date().toISOString().split('T')[0];

    if (games.length > 0) {
      dt = new Date(games[games.length - 1].gameDate);
      dt = dt.setDate(dt.getDate() + settings.gameFrequency);
      dt = new Date(dt).toISOString().split('T')[0];
    }

    addGameDate.value = dt;

    const modal = document.querySelector("#add-game-modal");
    modal.classList.add("is-active");

    addGameToggleIcon.classList.remove("fa-check-square-o");
    addGameToggleIcon.classList.add("fa-square-o");
    addGameButton.classList.add("is-disabled");

  },

  gameDate: function() {
    const addGameDate = document.querySelector("#add-game-date");
    return addGameDate.value;
  },

  copyGame: function(game, dt) {

    //charge players for previous weeks game
    const teams = game.team1.concat(game.team2);
    teams.forEach(function(p) {
      if (p.id != 0) {
        var player = players.find(player => (player.id == p.id));
        p.balance = parseFloat(p.balance) - parseFloat(settings.gameFee);
        player.balance = p.balance;
      };
    });

    const newGame = JSON.parse(JSON.stringify(game));
    newGame.gameDate = dt;
    
    // remove payments on copy
    newGame.team1.forEach(function(player) {
      delete player.paid;
    });
    newGame.team2.forEach(function(player) {
      delete player.paid;
    });

    return newGame;
  },

  submitAddGame: function(e) {

    e.preventDefault();

    let newGame = {};

    if (games.length === 0) {
      var team1 = [];
      for (i = 0; i < settings.teamSize; i++) { 
          team1.push(Object.assign({}, players[0]));
      }

      var team2 = [];
      for (i = 0; i < settings.teamSize; i++) { 
          team2.push(Object.assign({}, players[0]));
      }

      newGame = new Game(GamePage.gameDate(), team1, team2);
    }
    else {
      newGame = GamePage.copyGame(Helpers.getGame(), GamePage.gameDate());
    }

    games.push(newGame);
    gameCount = games.length;
    localStorage.setItem("gameCount", gameCount);

    const modal = document.querySelector("#add-game-modal");
    modal.classList.remove("is-active");

    gameIndex += 1;
    Navigate.renderPage();

  },

  closeAddGameModal: function(e) {
    if (games.length === 0) return;
    const modal = e.target.closest(".modal");
    if (modal) {modal.classList.remove("is-active")};
  },

  sortTeamByPlayerName: function (team, offset = 0) {
    team.sort(function(a, b) {
      if (a.name.toUpperCase() < b.name.toUpperCase()) {
        return -1;
      }
      if (a.name.toUpperCase() > b.name.toUpperCase()) {
        return 1;
      }
      return 0;
    });
    
    let newIdx = 0;
    let totalWeighting = 0;
    team.forEach(function(player) {
      player.listidx = newIdx;
      newIdx += 1;
      totalWeighting += player.weighting;
    });

    return totalWeighting;
  },

  pickTeams: function () {

    if (gameIndex != games.length - 1) return;

    const teamPick = [1,2,2,1,2,1,2,1,2,1];
    const game = Helpers.getGame();
    const teams = game.team1.concat(game.team2)

    teams.sort(function(a,b) {
      return parseFloat(a.weighting + Math.random()) - parseFloat(b.weighting + Math.random());
    });

    let i = 0;
    teams.forEach(function(p) {
      p.team = teamPick[i];
      i += 1;
    });

    teams.sort(function(a,b) {
      return a.team - b.team;
    });

    // remove payments on copy
    teams.forEach(function(p) {
      delete p.team;
    });

    game.team1 = teams.slice(0,settings.teamSize);
    game.team2 = teams.slice(settings.teamSize,settings.teamSize * 2);

    const team1Weighting = GamePage.sortTeamByPlayerName(game.team1);
    const team2Weighting = GamePage.sortTeamByPlayerName(game.team2, settings.teamSize);

    console.log(team1Weighting, team2Weighting);

  }

}

const PlayersPage = {
  init: function () {
    Helpers.displayTeam(players.slice(1), playersList);
    localStorage.setItem("players", JSON.stringify(players));
  },

  selectPlayer: function (e) {

    const li = event.target.closest("li");
    if(!li) {return};
  
    const player = players.find(p => (p.id == li.dataset.playerid));

    const modal = document.querySelector("#player-modal");
    (document.querySelector("#player-name")).value = player.name;
    (document.querySelector("#player-weighting-select")).value = player.weighting;
    (document.querySelector("#player-balance")).value = parseFloat(player.balance).toFixed(2);
    savePlayerToggleIcon.classList.remove("fa-check-square-o");
    savePlayerToggleIcon.classList.add("fa-square-o");
    savePlayerButton.classList.add("is-disabled");
    (document.querySelector("#player-form")).dataset.playerid = player.id;
    modal.classList.add("is-active");
    return;
  },

  addPlayerButton: function (e) {
    const modal = document.querySelector("#player-modal");
    (document.querySelector("#player-name")).value = "";
    (document.querySelector("#player-weighting-select")).value = 3;
    (document.querySelector("#player-balance")).value = 0.00;
    savePlayerToggleIcon.classList.remove("fa-check-square-o");
    savePlayerToggleIcon.classList.add("fa-square-o");
    savePlayerButton.classList.add("is-disabled");
    (document.querySelector("#player-form")).dataset.playerid = players.length;
    modal.classList.add("is-active");
    return;
  },

  savePlayerToggleButton: function(e) {
    savePlayerToggleIcon.classList.toggle("fa-check-square-o");
    savePlayerToggleIcon.classList.toggle("fa-square-o");
    savePlayerButton.classList.toggle("is-disabled");
  },

  closePlayerModal: function() {
    const modal = event.target.closest(".modal");
    if (modal) {modal.classList.remove("is-active")};
  },

  submitPlayer: function(e) {
    e.preventDefault();
    // for a new player create the player object and add to subs
    if (document.querySelector("#player-form").dataset.playerid == players.length ) {
      var player = new Player(((document.querySelector("#player-name")).value), ((document.querySelector("#player-weighting-select")).value), ((document.querySelector("#player-balance")).value));
      players.push(player);
    }
    else {
      var player = players.find(p => (p.id == (document.querySelector("#player-form")).dataset.playerid));
    }

    const game = games[games.length - 1];
    const subs = GamePage.subs(game);
    var teams = game.team1.concat(game.team2).concat(subs);
    
    const teamPlayer = teams.find(p => (p.id == player.id));

    // update both the player balance and the team player one
    if (player) { 
      player.name = (document.querySelector("#player-name")).value;
      player.weighting = parseInt((document.querySelector("#player-weighting-select")).value);
      player.balance = parseFloat((document.querySelector("#player-balance")).value);
      if (teamPlayer) {
        teamPlayer.balance = player.balance;
      }
    }

    PlayersPage.closePlayerModal();
    PlayersPage.init();
  }

}

const HistoryPage = {

  init: function () {
    const historyRows = document.querySelector("#history-rows");
    this.displayHistory(historyRows);

    let rows = '<option value="">All Players</option>';

    rows = rows + players.slice(1).map((p) => {
      return `<option value="${p.name}">${p.name}</option>`;
    }).join("");
    
    playerSelect.innerHTML = rows;
    
  },

  displayHistory: function(historyRows, filter = "") {

    let rows = "";

    console.log(filter, filter == "");

    for (i = games.length - 1; i >= 0; i--) {
      rows = rows + games[i].team1.map((p) => {
        if (filter === "" || filter === p.name) {
          return Render.historyRow(games[i].gameDate, p.name, p.paid);
        };
      }).join("");

      rows = rows + games[i].team2.map((p) => {
        if (filter == "" || filter === p.name) {
          return Render.historyRow(games[i].gameDate, p.name, p.paid);
        };
      }).join("");

      if(filter === "") {
        rows = rows + "<br>";
      }
    }
  
    historyRows.innerHTML = rows;

  },

  changeSelectedPlayer: function(e) {
    const historyRows = document.querySelector("#history-rows");
    HistoryPage.displayHistory(historyRows, event.target.value);
  }
}

const Navigate = {

  renderPage: function(e) {

    let showPage = "game";

    if (e) {
      const a = event.target.closest("a");
      if (!a) return;
      showPage = a.dataset.page;
    }

    if (games.length === 0) {
      GamePage.addGameInit();
      return;
    }

    if (showPage === "pick") {
      GamePage.pickTeams();
      showPage = "game";
    }

    //hide all pages
    const pages = document.querySelectorAll(".page");
    [].forEach.call(pages, function(page) {
      page.classList.add("is-hidden");
    });

    //show selected page
    const page = document.querySelector(".page." + showPage);
    if (page) {page.classList.remove("is-hidden")};

    //close the nav menu if opened on mobile
    navToggle.classList.remove("is-active");
    navMenu.classList.remove("is-active");

    switch(showPage) {
      case "game":
        GamePage.init();
        break;
      case "players":
        PlayersPage.init();
        break;
      case "history":
        HistoryPage.init();
        break;
    };
    
  },

  toggleNavMenu: function() {
    navToggle.classList.toggle("is-active");
    navMenu.classList.toggle("is-active");
  }

};

// main navigation
const mainNav = document.querySelector("#main-nav");
const navMenu = document.querySelector(".nav-menu");
const navToggle = document.querySelector(".nav-toggle");
mainNav.addEventListener("click", Navigate.renderPage);
navToggle.addEventListener("click", Navigate.toggleNavMenu);

// game navigation
const addGameModalBack = document.querySelector("#add-game-modal-bg");
const payModalBack = document.querySelector("#pay-modal-bg");
const subsModalBack = document.querySelector("#subs-modal-bg");
const playerModalBack = document.querySelector("#player-modal-bg");
const prevGame = document.querySelector("#previous-game");
const nextGame = document.querySelector("#next-game");
const addGameButton = document.querySelector("#add-game-button");
const addGameToggle = document.querySelector("#add-game-toggle");
const addGameToggleIcon = addGameToggle.querySelector("i");
const savePlayerButton = document.querySelector("#save-player-button");
const savePlayerToggle = document.querySelector("#save-player-toggle");
const savePlayerToggleIcon = savePlayerToggle.querySelector("i");
const addPlayerButton = document.querySelector("#add-player-button");
prevGame.addEventListener("click", GamePage.showPrevGame);
nextGame.addEventListener("click", GamePage.showNextGame);
addGameModalBack.addEventListener("click", GamePage.closeAddGameModal);
addGameToggle.addEventListener("click", GamePage.addGameToggleButton);
payModalBack.addEventListener("click", GamePage.closePayModal);
subsModalBack.addEventListener("click", GamePage.closeSubsModal);
savePlayerToggle.addEventListener("click", PlayersPage.savePlayerToggleButton);
playerModalBack.addEventListener("click", PlayersPage.closePlayerModal);
addPlayerButton.addEventListener("click", PlayersPage.addPlayerButton);

// forms
const addGameForm = document.querySelector("#add-game-form");
addGameForm.addEventListener("submit", GamePage.submitAddGame);

const playerForm = document.querySelector("#player-form");
playerForm.addEventListener("submit", PlayersPage.submitPlayer);


// lists
const team1List = document.querySelector("#team1-list");
const team2List = document.querySelector("#team2-list");
const subsList = document.querySelector("#subs-list");
const playersList = document.querySelector("#players-list");
const playerSelect = document.querySelector("#player-select");
team1List.addEventListener("click", GamePage.selectPlayer);
team2List.addEventListener("click", GamePage.selectPlayer);
subsList.addEventListener("click", GamePage.selectPlayer);
playersList.addEventListener("click", PlayersPage.selectPlayer);
playerSelect.addEventListener("change", HistoryPage.changeSelectedPlayer);

// payment modal
const payToggle = document.querySelector("#pay-toggle");
const payToggleIcon = payToggle.querySelector("i");
const payButton = document.querySelector("#pay-button");
const payMoneyField = document.querySelector("input.money");
payToggle.addEventListener("click", GamePage.payToggleButton);
payButton.addEventListener("click", GamePage.addPayment);
payMoneyField.addEventListener("keyup", Helpers.maskMoney);
payMoneyField.addEventListener("change", Helpers.maskMoney);


const playerMoneyField = document.querySelector("#player-balance");
playerMoneyField.addEventListener("keyup", Helpers.maskMoney);
playerMoneyField.addEventListener("change", Helpers.maskMoney);

Navigate.renderPage();