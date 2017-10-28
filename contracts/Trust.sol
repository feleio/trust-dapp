pragma solidity ^0.4.2;

contract Trust {
  struct Decision {
    address player;
    bool isTrust;
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

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function play(bool _isTrust) payable public {
    require(playerCount < 3);
    require(msg.value >= price);
    players[playerCount++] = Decision(msg.sender, _isTrust);
    PlayerDecided(msg.sender, playerCount);
  }

  function withdraw() public {
    require(playerCount == 3);

    uint trustCount = 0;
    address traitor;
    for(uint i=0; i< 3;i++){
      trustCount += players[i].isTrust ? 1 : 0;
      if (!players[i].isTrust){
        traitor = players[i].player;
      }
    }

    if (trustCount == 3){
      require(msg.sender == players[0].player || msg.sender == players[1].player || msg.sender == players[2].player);
      msg.sender.transfer(price);
      PlayerWithdrawn(msg.sender, price);
    } else if (trustCount == 2){
      require(msg.sender == traitor);
      msg.sender.transfer(price * 3);
      PlayerWithdrawn(msg.sender, price * 3);
    } else {
      require(msg.sender == owner);
      msg.sender.transfer(price * 3);
      PlayerWithdrawn(msg.sender, price * 3);
    }
  }
}
