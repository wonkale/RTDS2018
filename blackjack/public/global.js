Global = (function() {

  var socket;
  var playerName;
  var toggleChat = false;

  return {

    init: function() {
      socket = io();
      Global.socketEvents();
      Global.homeEvents();
      Global.lobbyEvents();
      Global.gameEvents();
      Global.chatEvents();
    },

    getPlayerName: function() {
      return playerName;
    },
    
    toggleChat: function(){
      toggleChat = !toggleChat;
      if (toggleChat === false){
        $('#chatInput').addClass("closed");
        $('#messages').addClass("closed");
        $('#chatToggleIcon').text("+");
      }else{
        $('#chatInput').removeClass("closed");
        $('#messages').removeClass("closed");
        $('#chatToggleIcon').text("-");
      }
    },

    setupLobby: function() {
      socket.emit('setupLobby');
    },

    setupGame: function() {
      socket.emit('setupGame');
    },

    socketEvents: function() {

      socket.on('registered', function(username) {
        playerName = username;
        $('#mainContainer').load('lobby/page.html', function() {
          Global.setupLobby();
        });
      });

      socket.on('allRooms', function(rooms) {
        for (var i = 0; i < rooms.length; i++) {
          $('ul').append('<li class="' + rooms[i] + '">' + rooms[i] + '</li>');
        }
      });

      socket.on('newRoom', function(room) {
        if ($('#roomList').length) {
          $('ul').append('<li class="' + room + '">' + room + '</li>');
        }
      });

      socket.on('deleteRoom', function(room) {
        if ($('#roomList').length) {
          $('.' + room).remove();
        }
      });

      socket.on('joined', function(room) {
        $('#mainContainer').load('blackjack/page.html', function() {
          Global.setupGame();
        });
      });

      socket.on('allPlayers', function(players) {
        for (var i = 0; i < Object.keys(players).length; i++) {
          var player = players[Object.keys(players)[i]];
          if (!$('#' + player.userName).length) {
            $('#players').append('<div id="' + player.userName + '" class="player"><h3>' + player.userName + '</h3><ul id=cards></ul><ul><li id=score style="font-size: 30px;"></li><li id=status></li></ul><ul id=action><li><button style="padding: 15px; width: 70px; background-color: rgb(74, 206, 78);" type="button" id="hit">HIT</button><button style="padding: 15px; width: 70px; background-color: rgba(255, 0, 0, 0.89);" type="button" id="stand">Stand</button></li></ul></div>');
          }
          $('#' + player.userName + ' #action').hide();
        }
      });

      socket.on('newPlayer', function(player) {
        if ($('#players').length) {
          if (!$('#' + player.userName).length) {
            $('#players').append('<div id="' + player.userName + '" class="player"><h3>' + player.userName + '</h3><ul id=cards></ul><ul><li id=score style="font-size: 30px;"></li><li id=status></li></ul><ul id=action><li><button style="padding: 15px; width: 70px; background-color: rgb(74, 206, 78);" type="button" id="hit">HIT</button><button style="padding: 15px; width: 70px; background-color: rgba(255, 0, 0, 0.89);" type="button" id="stand">Stand</button></li></ul></div>');
          }
          $('#' + player.userName + ' #action').hide();
        }
      });

      socket.on('removePlayer', function(player) {
        if ($('#players').length) {
          $('#' + player).remove();
        }
      });

      socket.on('dealt', function(gameData) {
        playerList = gameData.players;
        dealerObj = gameData.dealer;
        for (var i = 0; i < Object.keys(playerList).length; i++) {
          $('#' + Object.keys(playerList)[i] + ' #cards').empty();
          for (var j = 0; j < playerList[Object.keys(playerList)[i]].cardsHand.length; j++) {
            $('#' + Object.keys(playerList)[i] + ' #cards').append('<li><img src="img/' + playerList[Object.keys(playerList)[i]].cardsHand[j].shortName + '.png" alt="' + playerList[Object.keys(playerList)[i]].cardsHand[j].name + '" id="' + playerList[Object.keys(playerList)[i]].cardsHand[j].shortName + '"></li>');
          }
          $('#' + Object.keys(playerList)[i] + ' #score').text(playerList[Object.keys(playerList)[i]].score);
          if (playerList[Object.keys(playerList)[i]].status != 'NONE') {
            $('#' + Object.keys(playerList)[i] + ' #status').text(playerList[Object.keys(playerList)[i]].status);
          } else {
            $('#' + Object.keys(playerList)[i] + ' #status').text('');
          }
        }
        $('#dealer #cards').empty();
        $('#dealer #score').empty();
        $('#dealer #status').empty();

        $('#dealer #cards').append('<li><img src="img/' + dealerObj.cardsHand[0].shortName + '.png" alt="' + dealerObj.cardsHand[0].name + '" id="' + dealerObj.cardsHand[0].shortName + '"></li>');
        $('#dealer #cards').append('<li><img src="img/HIDDEN.png" alt="HIDDEN" id="hidden"/></li>');
      });

      socket.on('playerHit', function(player) {
        $('#' + player.userName + ' #cards').append('<li><img src="img/' + player.cardsHand[player.cardsHand.length - 1].shortName + '.png" alt="' + player.cardsHand[player.cardsHand.length - 1].name + '" id="' + player.cardsHand[player.cardsHand.length - 1].shortName + '"></li>');
        $('#' + player.userName + ' #score').text(player.score);
        if (player.status != 'NONE') {
          $('#' + player.userName + ' #status').text(player.status);
        }
      });

      socket.on('playerStand', function(player) {
        if (player.status != 'NONE') {
          $('#' + player.userName + ' #status').text(player.status);
        }
      });

      socket.on('dealerHit', function(dealer) {
        $('.player').each(function() {
          $(this).css("background-color", "transparent");
          $(this).find('#action').hide();
        });
        $('#dealer #cards').empty();
        for (var i = 0; i < dealer.cardsHand.length; i++) {
          $('#dealer #cards').append('<li><img src="img/' + dealer.cardsHand[i].shortName + '.png" alt="' + dealer.cardsHand[i].name + '" id="' + dealer.cardsHand[i].shortName + '"></li>');
        }
        $('#dealer #score').text(dealer.score);
        if (dealer.status == 'BUST') {
          $('#dealer #status').text(dealer.status);
        }
      });

      socket.on('turn', function(player) {
        $('.player').each(function() {
          $(this).css("background-color", "transparent");
          $(this).find('#action').hide();
        });
        $('#' + player).css("background-color", "gold");
        if (player == playerName) {
          $('#' + player + ' #action').show();
        }
      });

      socket.on('winners', function(winners) {
        $('.player').each(function() {
          $(this).find('#status').text('LOST');
        });
        for (var i = 0; i < winners.length; i++) {
          $('#' + winners[i].userName).find('#status').text('WON');
        }
      });

      socket.on('errormsg', function(msg) {
        alert(msg);
      });
    },

    homeEvents: function() {
      $('#mainContainer').on('click', '#register', function() {
        if ($('#username').val() != '') {
          socket.emit('register', $('#username').val());
        }
      });
    },

    lobbyEvents: function() {
      $('#mainContainer').on('click', '#create', function() {
        if ($('#roomName').val() != '') {
          socket.emit('createRoom', $('#roomName').val());
          socket.emit('joinRoom', $('#roomName').val());
        }
      });

      $('#mainContainer').on('click', '#roomList li', function() {
        socket.emit('joinRoom', $(this).text());
      });
    },

    gameEvents: function() {
      $('#mainContainer').on('click', '#deal', function() {
        socket.emit('deal');
      });

      $('#mainContainer').on('click', '#exit', function() {
        socket.emit('exitRoom');
        $('#mainContainer').load('lobby/page.html', function() {
          Global.setupLobby();
        });
      });

      $('#mainContainer').on('click', '#hit', function() {
        socket.emit('hit');
      });

      $('#mainContainer').on('click', '#stand', function() {
        socket.emit('stand');
      });
      },

      chatEvents: function () {
          $('#mainContainer').on('click', '#chatMessage', function () {
            
            if ($('#m').val() != null || $('#m').val() != '') {
              var msg = {
                  "name": Global.getPlayerName(),
                  "message": $('#m').val()
              }
              socket.emit('chat message', JSON.stringify(msg));
              $('#m').val('');
            }
            return false;
          });


          socket.on('chat message', function (response) {
            console.log("we have a message!");
            
            if (response != null) {
              var msg = JSON.parse(response);

              //create div for message
              var buble = document.createElement("div");
              buble.classList.add("row");
              buble.classList.add("message-bubble");

              // create name
              var header = document.createElement("p");
              header.classList.add("text-muted");
              header.innerText = msg.name + ': ';

              // create text
              var text = document.createElement("p");
              text.innerText = msg.message;

              // fuze header and text
              buble.appendChild(header);
              buble.appendChild(text);
              // add message to chat
              if(msg.message != null && msg.message != '' && msg.message != "" ){
                $('#messages').append(buble);
                $('#messages').animate({ scrollTop: $(document).height() }, "slow");
              }
              buble = null;
              msg = null;
              header = null;
              text = null;
          }
          return false;
        });
      },

    eof: 0
  };
})();

$(document).ready(function() {
  Global.init();
});
