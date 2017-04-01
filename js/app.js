const defaultPlayerData = [
  { id: 1, name: "Lee", weighting: 3, paid: 0.00, balance: 10.20, team: 1, idx: 0},
  { id: 2, name: "Auldrius", weighting: 3, paid: 0.00, balance: 5.00, team: 1, idx: 1},
  { id: 3, name: "Paul", weighting: 3, paid: 0.00, balance: -40.00, team: 1, idx: 2},
  { id: 4, name: "Liam", weighting: 5, paid: 0.00, balance: 0.00, team: 1, idx: 4},
  { id: 5, name: "Brian", weighting: 2, paid: 0.00, balance: 0.00, team: 1, idx: 3},
  { id: 6, name: "Adam", weighting: 2, paid: 0.00, balance: 0.00, team: 2, idx: 0},
  { id: 7, name: "Jake", weighting: 3, paid: 0.00, balance: 0.00, team: 2, idx: 1},
  { id: 8, name: "Mark", weighting: 5, paid: 0.00, balance: 0.00, team: 2, idx: 2},
  { id: 9, name: "Rich", weighting: 3, paid: 0.00, balance: 0.00, team: 2, idx: 3},
  { id: 10, name: "Si", weighting: 4, paid: 0.00, balance: 0.00, team: 2, idx: 4},
  { id: 11, name: "Dean", weighting: 2, paid: 0.00, balance: 0.00, team: 0, idx: 0},
  { id: 12, name: "Aders", weighting: 3, paid: 0.00, balance: 0.00, team: 0, idx: 1},
  { id: 13, name: "Jon", weighting: 3, paid: 0.00, balance: 0.00, team: 0, idx: 2},
  { id: 14, name: "Player 14", weighting: 3, paid: 0.00, balance: 0.00, team: 0, idx: 3},
  { id: 15, name: "Player 15", weighting: 3, paid: 0.00, balance: 0.00, team: 0, idx: 4},
  { id: 16, name: "Player 16", weighting: 3, paid: 0.00, balance: 0.00, team: 0, idx: 5},
  { id: 17, name: "Player 17", weighting: 3, paid: 0.00, balance: 0.00, team: 0, idx: 6},
  { id: 18, name: "Player 18", weighting: 3, paid: 0.00, balance: 0.00, team: 0, idx: 7},
  { id: 19, name: "Player 19", weighting: 3, paid: 0.00, balance: 0.00, team: 0, idx: 8},
  { id: 20, name: "Player 20", weighting: 3, paid: 0.00, balance: 0.00, team: 0, idx: 9}
];

var playerData = JSON.parse(localStorage.getItem("playerData")) || defaultPlayerData;

const teamNames = [
  { id: 1, name: "Red"},
  { id: 2, name: "White"}
];

var gameData = [];

function teamName(value) {
  const team = teamNames.find(team => (team.id == value));
  return team.name;
}

function formatMoney(value) {
   return "£" + parseFloat(value).toFixed(2);
}

function populateList(players = [], playerList, unselectedIcon = "fa-user", selectedIcon ="fa-gbp") {
  playerList.innerHTML = players.map((player, i) => {

      const paidClass = (player.paid > 0) ? "paid" : "unpaid";

      return `
        <li class="box is-paddingless ${paidClass}" data-playerid="${player.id}">
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
                <p class="subtitle is-6"><small>Balance:<strong>${formatMoney(player.balance)}</strong></small></p>
              </div>
            </div>
            <div class="media-right">
              <a data-action="swapout">
                <span class="icon is-large">
                    <i class="fa fa-chevron-right"></i>
                </span>
              </a>
            </div>
          </article>
        </li>
      `;
  }).join("");
}

function populateTable(players = [], playerList) {
  playerList.innerHTML = players.map((player, i) => {
      return `
        <tr>
          <td>${teamName(player.team)}</td>
          <td>${player.name}</td>
          <td>${formatMoney(player.paid)}</td>
          <td><input type="checkbox" class="checkplayer unchecked" data-playerId="${player.id}" onchange="handleCheckPlayer(this)"></td>
        </tr>
      `;
  }).join("");
}

function refreshAllPlayersList() {
  playerData.sort(function(a,b) {
    return a.id - b.id;
  });

  populateList(playerData, playersList, "fa-user-circle-o");
  localStorage.setItem("playerData", JSON.stringify(playerData));
}

function refreshPlayingTable() {
  const playing = playerData.filter(player => (player.team >= 1));

  playing.sort(function(a,b) {
    return a.team - b.team || a.idx - b.idx;
  });

  populateTable(playing, playingList);
}

function refreshSubsList() {
  const subs = playerData.filter(player => (player.team == 0));

  subs.sort(function(a,b) {
    return a.idx - b.idx;
  });

  populateList(subs, subsList, "fa-user-circle-o");
}

function refreshTeamsList() {

  const team1 = playerData.filter(player => (player.team == 1));
  const team2 = playerData.filter(player => (player.team == 2));
  
  team1.sort(function(a,b) {
    return a.idx - b.idx;
  });

  populateList(team1, team1List);

  team2.sort(function(a,b) {
    return a.idx - b.idx;
  });

  populateList(team2, team2List, "fa-user-o");

  //select 
  const playerBoxes = document.querySelectorAll(".team li");
  [].forEach.call(playerBoxes, function(playerBox) {
    playerBox.addEventListener("click", selectPlayer);
  });
}

function refreshLists() {
  refreshAllPlayersList();
  refreshPlayingTable();
  refreshSubsList();
  refreshTeamsList();
}

function selectPlayer(e) {
  const li = event.target.closest("li");
  const a = event.target.closest("a");
  if(!li && !a) {return};

  // if the payment button was pressed show payments modal
  if(a && a.dataset.action == "pay") {
    const playerSelected = document.querySelector(".team li.selected");
    const player = playerData.find(player => (player.id == playerSelected.dataset.playerid));
    const modal = document.querySelector(".modal.pay");
    const modalTitle = document.querySelector(".modal.pay #playername");
    modalTitle.innerHTML = player.name;
    moneyField.value = (player.paid > 0) ? player.paid : "";
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
    const player1idx = playerData.findIndex(player => (player.id == playersToSwap[0].dataset.playerid));
    const player2idx = playerData.findIndex(player => (player.id == playersToSwap[1].dataset.playerid));
    // take a copy of the player1 object as objects are ref types we need to create a new object
    const tempPlayer = Object.assign({}, playerData[player1idx]);

    playerData[player1idx].team = playerData[player2idx].team;
    playerData[player1idx].idx = playerData[player2idx].idx;
    playerData[player2idx].team = tempPlayer.team;
    playerData[player2idx].idx = tempPlayer.idx;

    closeSubsModal();
    refreshLists();

    //remove selected class from all players
    const playerBoxes = document.querySelectorAll(".team li");
    [].forEach.call(playerBoxes, function(playerBox) {
      playerBox.classList.remove("selected");
    });
  }

}

function maskMoney(e) {
  var val = e.target.value.replace(".","");

  val = val/100;
  e.target.value = val <= 0 ? "" : val.toFixed(2);
  payButton.dataset.amount = val;

  payButton.classList.add("is-disabled");
  payToggleIcon.classList.remove("fa-check-square-o");
}

function addPayment(e) {
  const a = event.target.closest("a");
  if(!a) {return};

  const amount = a.dataset.amount;
  const playerSelected = document.querySelector(".team li.selected");
  const player = playerData.find(player => (player.id == playerSelected.dataset.playerid));

  player.paid = parseFloat(amount).toFixed(2);

  //reset for next time around
  moneyField.value = "";
  payButton.dataset.amount = 0.00;
  payButton.classList.add("is-disabled");
  payToggleIcon.classList.remove("fa-check-square-o");

  closePayModal();
  refreshLists();

}

function payToggleButton(e) {
  payToggleIcon.classList.toggle("fa-check-square-o");
  payToggleIcon.classList.toggle("fa-square-o");
  payButton.classList.toggle("is-disabled");
}

function toggleMenu() {
  navToggle.classList.toggle("is-active");
  navMenu.classList.toggle("is-active");
}

function closeSubsModal() {
  const modal = event.target.closest(".modal");
  if (modal) {modal.classList.remove("is-active")};

  //remove selected class from all players
  const playerBoxes = document.querySelectorAll(".team li");
  [].forEach.call(playerBoxes, function(playerBox) {
    playerBox.classList.remove("selected");
  });

}

function closePayModal() {
  const modal = event.target.closest(".modal");
  if (modal) {modal.classList.remove("is-active")};

  //remove selected class from all players
  const playerBoxes = document.querySelectorAll(".team li");
  [].forEach.call(playerBoxes, function(playerBox) {
    playerBox.classList.remove("selected");
  });

}

function submitWeek() {

  playerData.forEach(function(player) {
    player.balance = parseFloat(player.balance) + parseFloat(player.paid);
    player.paid = 0;
  });

  submitWeekButton.classList.add("is-disabled");
  checkAllPlayers.checked = false;

  refreshLists();
  renderPage();

}

function handleCheckPlayer(e) {
  e.classList.toggle("unchecked");

    console.log(document.querySelectorAll(".checkplayer.unchecked"));

  if (document.querySelectorAll(".checkplayer.unchecked").length == 0) {
    submitWeekButton.classList.remove("is-disabled");
  }
  else {submitWeekButton.classList.add("is-disabled");}
}

function handleCheckAllPlayers(e) {
  const allPlayersToCheck = document.querySelectorAll(".checkplayer");
  [].forEach.call(allPlayersToCheck, function(playerCheckbox) {
    playerCheckbox.checked = e.target.checked;
    e.target.checked == true ? (playerCheckbox.classList.remove("unchecked")) : playerCheckbox.classList.add("unchecked");
  });

  e.target.checked == true ? (submitWeekButton.classList.remove("is-disabled")) : submitWeekButton.classList.add("is-disabled");

}

function handleResetAllData() {
  localStorage.setItem("playerData", JSON.stringify(defaultPlayerData));
  playerData = JSON.parse(localStorage.getItem("playerData"));
  refreshLists();
  renderPage();
}

function pickTeams() {
  const teamPick = [1,2,2,1,2,1,2,1,2,1];
  const playing = playerData.filter(player => (player.team >= 1));

  playing.sort(function(a,b) {
    return parseFloat(a.weighting + Math.random()) - parseFloat(b.weighting + Math.random());
  });

  let i = 0;
  playing.forEach(function(player) {
    player.team = teamPick[i];
    i += 1;
  });

  const team1 = playerData.filter(player => (player.team == 1));
  const team2 = playerData.filter(player => (player.team == 2));

  team1.sort(function(a, b) {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
  });
  
  let newIdx = 0;
  team1.forEach(function(player) {
    player.idx = newIdx;
    newIdx += 1;
  });

  team2.sort(function(a, b) {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
  });
  
  newIdx = 0;
  team2.forEach(function(player) {
    player.idx = newIdx;
    newIdx += 1;
  });

  refreshLists();
}

function renderPage(e) {
  const a = event.target.closest("a");
  if (!a) return;

  let showPage = a.dataset.page;

  //hide all pages
  const pages = document.querySelectorAll(".page");
  [].forEach.call(pages, function(page) {
    page.classList.add("is-hidden");
  });

  if (showPage == "pick") {
    pickTeams();
    showPage = "game";
  }

  //show selected page
  const page = document.querySelector(".page." + showPage);
  if (page) {page.classList.remove("is-hidden")};

  //close the nav menu if opened on mobile
  navToggle.classList.remove("is-active");
  navMenu.classList.remove("is-active");
}

const submitWeekButton = document.querySelector("#submitweek");
const navMenu = document.querySelector(".nav-menu");
const navToggle = document.querySelector(".nav-toggle");
const subsModalBack = document.querySelector(".modal-background.subs");
const payModalBack = document.querySelector(".modal-background.pay");
const payToggle = document.querySelector("#paytoggle");
const payToggleIcon = payToggle.querySelector("i");
const payButton = document.querySelector("#paybutton");
const resetButton = document.querySelector("#resetdata");
const mainNav = document.querySelector("#mainnav");
const moneyField = document.querySelector("input.money");

refreshLists();

//Add event listeners
checkAllPlayers.addEventListener("change", handleCheckAllPlayers);
submitWeekButton.addEventListener("click", submitWeek);
navToggle.addEventListener("click", toggleMenu);
subsModalBack.addEventListener("click", closeSubsModal);
payModalBack.addEventListener("click", closePayModal);
payToggle.addEventListener("click", payToggleButton);
payButton.addEventListener("click", addPayment);
resetButton.addEventListener("click", handleResetAllData);
moneyField.addEventListener("keyup", maskMoney);
moneyField.addEventListener("change", maskMoney);
mainNav.addEventListener("click", renderPage);
