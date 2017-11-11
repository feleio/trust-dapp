pragma solidity ^0.4.2;

contract Trust {
  struct Decision {
    address player;
    bool isTrust;
    bool isWithDrawn;
  }

  address public owner;
  uint public price;
  uint public playerCount;

  mapping (uint => Decision) public players;

  event PlayerDecided(address indexed _player, uint _playerCount);
  event PlayerWithdrawn(address indexed _player, uint _amount);
  event Reset();

  function Trust(uint _price) {
    owner = msg.sender;
    price = _price;
    playerCount = 0;
  }

  function play(bool _isTrust) payable public {
    require(playerCount < 3 && msg.value >= price);
    players[playerCount].player = msg.sender;
    players[playerCount].isTrust = _isTrust;
    players[playerCount].isWithDrawn = false;
    playerCount += 1;
    PlayerDecided(msg.sender, playerCount);
  }

  function withdraw() public {
    require(playerCount == 3);

    uint trustCount = 0;
    uint notWithdrawPlayerIdx = 3;
    uint traitorIdx;

    for(uint i=0; i< 3;i++){
      trustCount += players[i].isTrust ? 1 : 0;
      if (!players[i].isTrust){
        traitorIdx = i;
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
      require(msg.sender == players[traitorIdx].player && !players[traitorIdx].isWithDrawn);
      msg.sender.transfer(price * 3);
      players[traitorIdx].isWithDrawn = true;
      PlayerWithdrawn(msg.sender, price * 3);
    } else {
      require(msg.sender == owner && this.balance >= price * 3);
      msg.sender.transfer(price * 3);
      PlayerWithdrawn(msg.sender, price * 3);
    }
  }

  function ownerWithdraw() public {
    require(msg.sender == owner);
    msg.sender.transfer(this.balance);
    PlayerWithdrawn(msg.sender, this.balance);
  }

  function reset() {
    require(playerCount == 3 && this.balance == 0);
    playerCount = 0;
    Reset();
  }

  function find(uint userId) constant public returns (address player, bool isTrust, bool isWithDrawn) {
    require(userId < playerCount);
    return (players[userId].player, players[userId].isTrust, players[userId].isWithDrawn);
  }
}
