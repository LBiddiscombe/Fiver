var players = [
  { id: 0, name: "tbc", weighting: 0, balance: 0.00},
  { id: 1, name: "Lee", weighting: 3, balance: 10.20},
  { id: 2, name: "Auldrius", weighting: 3, balance: 5.00},
  { id: 3, name: "Paul", weighting: 3, balance: -40.00},
  { id: 4, name: "Liam", weighting: 5, balance: 0.00},
  { id: 5, name: "Brian", weighting: 2, balance: 0.00},
  { id: 6, name: "Adam", weighting: 2, balance: 0.00},
  { id: 7, name: "Jake", weighting: 3, balance: 0.00},
  { id: 8, name: "Mark", weighting: 5, balance: 0.00},
  { id: 9, name: "Rich", weighting: 3, balance: 0.00},
  { id: 10, name: "Si", weighting: 4, balance: 0.00},
  { id: 11, name: "Dean", weighting: 2, balance: 0.00},
  { id: 12, name: "Aders", weighting: 3, balance: 0.00},
  { id: 13, name: "Jon", weighting: 3, balance: 0.00},
  { id: 14, name: "Player 14", weighting: 3, balance: 0.00},
  { id: 15, name: "Player 15", weighting: 3, balance: 0.00},
  { id: 16, name: "Player 16", weighting: 3, balance: 0.00},
  { id: 17, name: "Player 17", weighting: 3, balance: 0.00},
  { id: 18, name: "Player 18", weighting: 3, balance: 0.00},
  { id: 19, name: "Player 19", weighting: 3, balance: 0.00},
  { id: 20, name: "Player 20", weighting: 3, balance: 0.00}
];

var games = [];
var gameIndex = -1;

const settings = {
  team1name : "Red",
  team2name : "White",
  teamSize : 5,
  gameFrequency: 7
}

function Player(name, weighting) {
  this.name = name;
  this.weighting = weighting;
  this.balance = 0;
}

function Game(gameDate, team1, team2) {
  this.gameDate = gameDate;
  this.team1 = team1;
  this.team2 = team2;
};

const Helpers = {
  formatDate: function(dt) {
    const newDate = new Date(dt);
    const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    return newDate.toLocaleString('en-us', options);
  },

  formatMoney: function(value) {
   return "£" + parseFloat(value).toFixed(2);
  },

  maskMoney: function(e) {
    var val = e.target.value.replace(".", "");

    val = val / 100;
    e.target.value = val <= 0 ? "" : val.toFixed(2);
    payButton.dataset.amount = val;

    payButton.classList.add("is-disabled");
    payToggleIcon.classList.remove("fa-check-square-o");
  },

  getGame: function() {
    var game = games[gameIndex];
    if (!game) {
      gameIndex = games.length - 1;
      game = games[gameIndex];
    }
    return game;
  }

}

const Render = {

  playerBox: function (player, unselectedIcon = "fa-user", selectedIcon ="fa-gbp", i) {

    const paidClass = (player.paid) ? "paid" : "unpaid";
    player.listidx = i;

    return `
      <li class="box is-paddingless ${paidClass}" data-playerid="${player.id}" data-listidx="${i}">
        <article class="media">
          <div class="media-left">
            <span class="unselected icon is-large">
                <i class="fa ${unselectedIcon}"></i>
            </span>
            <a data-action="pay">
              <span class="selected icon is-large">
                  <i class="fa ${selectedIcon}"></i>
              </span>
            </a>
          </div>
          <div class="media-content">
            <div>
              <p class="title is-4">${player.name}</p>
              <p class="subtitle is-6"><small>Balance:<strong>${Helpers.formatMoney(player.balance)}</strong></small></p>
            </div>
          </div>
          <div class="media-right is-marginless">
            <a data-action="swapout">
              <span class="icon is-large">
                  <i class="fa fa-chevron-right"></i>
              </span>
            </a>
          </div>
        </article>
      </li>
    `;
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
      AddGame.init();
      return;
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
    };
    
  },

  closeAddGameModal: function(e) {
    if (games.length === 0) return;
    const modal = e.target.closest(".modal");
    if (modal) {modal.classList.remove("is-active")};
  },

  toggleNavMenu: function() {
    navToggle.classList.toggle("is-active");
    navMenu.classList.toggle("is-active");
  }

};

const AddGame = {

  init: function() {
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

  },

  gameDate: function() {
    const addGameDate = document.querySelector("#add-game-date");
    return addGameDate.value;
  },

  copyGame: function(game, dt) {
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

  submit: function(e) {

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

      newGame = new Game(AddGame.gameDate(), team1, team2);
    }
    else {
      newGame = AddGame.copyGame(Helpers.getGame(), AddGame.gameDate());
    }

    games.push(newGame);

    const modal = document.querySelector("#add-game-modal");
    modal.classList.remove("is-active");

    gameIndex += 1;
    Navigate.renderPage();

  }

}

const GamePage = {

  init: function() {
    const game = Helpers.getGame();
    const gd = document.querySelector("#game-date");
    gd.innerHTML = Helpers.formatDate(game.gameDate);
    const nextLabel = document.querySelector("#next-game");

    nextLabel.innerHTML = (gameIndex === (games.length - 1)) ? "New Game" : "Next"

    const subs = GamePage.subs(game);

    this.displayTeam(game.team1, team1List);
    this.displayTeam(game.team2, team2List, "fa-user-o", "fa-gbp", settings.teamSize);
    this.displayTeam(subs, subsList, "fa-user-circle-o", "", settings.teamSize * 2);

    const playerBoxes = document.querySelectorAll(".team li");
    [].forEach.call(playerBoxes, function(playerBox) {
      playerBox.addEventListener("click", GamePage.selectPlayer);
    });

    localStorage.setItem("game|" + gameIndex, JSON.stringify(game));

  },

  displayTeam: function (team = [], playerList, unselectedIcon = "fa-user", selectedIcon = "fa-gbp", idxoffset = 0) {
    playerList.innerHTML = team.map((p, i) => {
        return Render.playerBox (p, unselectedIcon, "fa-gbp", i + idxoffset);
    }).join("");
  },

  subs: function (game) {
    const teams = game.team1.concat(game.team2);
    let subs = [players[0]];
    players.forEach(function(player) {
      if (teams.findIndex(teamplayer => (teamplayer.id === player.id)) === -1) {
        subs.push(player);
      }
    });

    subs.sort(function(a,b) {
      return a.id - b.id;
    });

    return subs;
  },

  showNextGame: function() {
    if (!games[gameIndex + 1]) {
      AddGame.init();  
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

  selectPlayer: function (e) {
    const li = event.target.closest("li");
    const a = event.target.closest("a");
    if(!li && !a) {return};

    if(a && a.dataset.action == "pay") {
      const game = Helpers.getGame();
      const playerSelected = document.querySelector(".team li.selected");
      const player = game.team1.find(player => (player.listidx == playerSelected.dataset.listidx)) || game.team2.find(player => (player.listidx == playerSelected.dataset.listidx));
      const modal = document.querySelector(".modal.pay");
      const modalTitle = document.querySelector(".modal.pay #player-name");
      modalTitle.innerHTML = player.name;
      moneyField.value = (player.paid) ? player.paid : "";
      payButton.dataset.amount = moneyField.value;
      modal.classList.add("is-active");
      return;
    }

    // if the player was clicked a second time show the list of subs
    if(a && a.dataset.action == "swapout") {
      const modal = document.querySelector(".modal.subs");
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
      player.paid = parseFloat(amount).toFixed(2);
    }

    moneyField.value = "";
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

  closeSubsModal: function() {
    const modal = event.target.closest(".modal");
    if (modal) {modal.classList.remove("is-active")};
  },

  closePayModal: function() {
    const modal = event.target.closest(".modal");
    if (modal) {modal.classList.remove("is-active")};
  }

}

// navigation
const mainNav = document.querySelector("#main-nav");
const navMenu = document.querySelector(".nav-menu");
const navToggle = document.querySelector(".nav-toggle");
const addGameModalBack = document.querySelector("#add-game-modal-bg");
const prevGame = document.querySelector("#previous-game");
const nextGame = document.querySelector("#next-game");


mainNav.addEventListener("click", Navigate.renderPage);
prevGame.addEventListener("click", GamePage.showPrevGame);
nextGame.addEventListener("click", GamePage.showNextGame);
navToggle.addEventListener("click", Navigate.toggleNavMenu);
addGameModalBack.addEventListener("click", Navigate.closeAddGameModal);

// forms
const addGameForm = document.querySelector("#add-game-form");
addGameForm.addEventListener("submit", AddGame.submit);

const team1List = document.querySelector("#team1-list");
const team2List = document.querySelector("#team2-list");
const subsList = document.querySelector("#subs-list");
const playersList = document.querySelector("#players-list");

// payment modal
const payToggle = document.querySelector("#pay-toggle");
const payToggleIcon = payToggle.querySelector("i");
const payButton = document.querySelector("#pay-button");
const moneyField = document.querySelector("input.money");
payToggle.addEventListener("click", GamePage.payToggleButton);
payButton.addEventListener("click", GamePage.addPayment);
moneyField.addEventListener("keyup", Helpers.maskMoney);
moneyField.addEventListener("change", Helpers.maskMoney);

Navigate.renderPage();