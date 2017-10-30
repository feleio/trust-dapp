pragma solidity ^0.4.2;

contract Trust {
  struct Decision {
    address player;
    bool isTrust;
    bool isWithDrawn;
  }

  address owner;
  uint public price;
  uint public playerCount;

  mapping (uint => Decision) public players;

  event PlayerDecided(address indexed _player, uint _playerCount);
  event PlayerWithdrawn(address indexed _player, uint _amount);

  function Trust(uint _price) {
    owner = msg.sender;
    price = _price;
    playerCount = 0;
  }

  function play(bool _isTrust) payable public {
    require(playerCount < 3 && msg.value >= price);
    players[playerCount].player = msg.sender;
    players[playerCount].isTrust = _isTrust;
    playerCount += 1;
    PlayerDecided(msg.sender, playerCount);
  }

  function withdraw() public {
    require(playerCount == 3);

    uint trustCount = 0;
    uint notWithdrawPlayerIdx = 3;
    Decision memory traitor;

    for(uint i=0; i< 3;i++){
      trustCount += players[i].isTrust ? 1 : 0;
      if (!players[i].isTrust){
        traitor = players[i];
      }
      if (msg.sender == players[i].player && !players[i].isWithDrawn){
        notWithdrawPlayerIdx = i;
      }
    }

    if (trustCount == 3){
      require(notWithdrawPlayerIdx < 3);
      msg.sender.transfer(price);
      players[notWithdrawPlayerIdx].isWithDrawn = true;
      PlayerWithdrawn(msg.sender, price);
    } else if (trustCount == 2){
      require(msg.sender == traitor.player && !traitor.isWithDrawn);
      msg.sender.transfer(price * 3);
      traitor.isWithDrawn = true;
      PlayerWithdrawn(msg.sender, price * 3);
    } else {
      require(msg.sender == owner && this.balance >= price * 3);
      msg.sender.transfer(price * 3);
      PlayerWithdrawn(msg.sender, price * 3);
    }
  }
}
