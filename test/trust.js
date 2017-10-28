var Trust = artifacts.require("./Trust.sol");
const proxiedWeb3Handler = require('./support/proxiedWeb3Handler.js');
const getEventLogs = require('./support/getEventLogs.js');
const expectThrow = require('./support/expectThrow.js');

const web3 = Trust.web3;
const proxiedWeb3 = new Proxy(web3, proxiedWeb3Handler);

contract('Trust', function(accounts) {
  describe("play", function () {
    it("...first players should increment player count.", async function() {
      const instance = await Trust.deployed();

      await instance.play(true, {value: web3.toWei(0.001, 'ether'), from: accounts[1]});
      const playerCount = await instance.playerCount();
      assert.equal(playerCount, 1, "player count does not increment")

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.001, 'ether'), "contract balance does not equal to player sent")
      const eventLogs = await getEventLogs(instance, {
        event: "PlayerDecided",
        args: {
          _player: accounts[1]
        }
      });

      assert.equal(eventLogs.length, 1);
      const event = eventLogs[0];
      assert(event.args._playerCount, 1);
    });

    it("...first player cannot withdraw when there is less than 3 players", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[1]}));

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.001, 'ether'), "contract balance does not equal to player sent")
    });

    it("...second players should increment player count.", async function() {
      const instance = await Trust.deployed();

      await instance.play(false, {value: web3.toWei(0.001, 'ether'), from: accounts[2]});
      const playerCount = await instance.playerCount();
      assert.equal(playerCount, 2, "player count does not increment")

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.001 * 2, 'ether'), "contract balance does not equal to player sent")

      const eventLogs = await getEventLogs(instance, {
        event: "PlayerDecided",
        args: {
          _player: accounts[2]
        }
      });

      assert.equal(eventLogs.length, 1);
      const event = eventLogs[0];
      assert(event.args._playerCount, 1);
    });

    it("...third players should increment player count.", async function() {
      const instance = await Trust.deployed();

      await instance.play(true, {value: web3.toWei(0.001, 'ether'), from: accounts[3]});
      const playerCount = await instance.playerCount();
      assert.equal(playerCount, 3, "player count does not increment")

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.001 * 3, 'ether'), "contract balance does not equal to player sent")

      const eventLogs = await getEventLogs(instance, {
        event: "PlayerDecided",
        args: {
          _player: accounts[3]
        }
      });

      assert.equal(eventLogs.length, 1);
      const event = eventLogs[0];
      assert(event.args._playerCount, 1);
    });

    it("...4th players cannot play.", async function() {
      const instance = await Trust.deployed();

      await expectThrow(instance.play(true, {value: web3.toWei(0.001, 'ether'), from: accounts[4]}));
      const playerCount = await instance.playerCount();
      assert.equal(playerCount, 3, "player count does not increment")

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.001 * 3, 'ether'), "contract balance does not equal to player sent")

      const eventLogs = await getEventLogs(instance, {
        event: "PlayerDecided",
        args: {
          _player: accounts[4]
        }
      });

      assert.equal(eventLogs.length, 0);
    });
  });
});

contract('Trust', function(accounts) {
  describe("all 3 players trust", function () {
    it("...all three players that trust should play successfully", async function() {
      const instance = await Trust.deployed();
      await instance.play(true, {value: web3.toWei(0.001, 'ether'), from: accounts[1]});
      await instance.play(true, {value: web3.toWei(0.001, 'ether'), from: accounts[2]});
      await instance.play(true, {value: web3.toWei(0.001, 'ether'), from: accounts[3]});
      const playerCount = await instance.playerCount();
      assert.equal(playerCount, 3, "player count does not increment")
      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...owner cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[0]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...others cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[4]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...first player should withdraw what he pay", async function() {
      const instance = await Trust.deployed();
      instance.withdraw.sendTransaction({from: accounts[1]});
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn",
        args: {
          _player: accounts[1]
        }
      });
      assert.equal(eventLogs.length, 1);
      assert(eventLogs[0].args._amount, 0.001);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.002, 'ether'), "contract balance does not equal to player sent")
    });

    it("...second player should withdraw what he pay", async function() {
      const instance = await Trust.deployed();
      instance.withdraw.sendTransaction({from: accounts[2]});
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn",
        args: {
          _player: accounts[2]
        }
      });
      assert.equal(eventLogs.length, 1);
      assert(eventLogs[0].args._amount, 0.001);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.001, 'ether'), "contract balance does not equal to player sent")
    });

    it("...thrid player should withdraw what he pay", async function() {
      const instance = await Trust.deployed();
      instance.withdraw.sendTransaction({from: accounts[2]});
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn",
        args: {
          _player: accounts[2]
        }
      });
      assert.equal(eventLogs.length, 1);
      assert(eventLogs[0].args._amount, 0.001);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0, 'ether'), "contract balance does not equal to player sent")
    });
  });
});

contract('Trust', function(accounts) {
  describe("only 2 players trust", function () {
    it("...all three players that trust should play successfully", async function() {
      const instance = await Trust.deployed();
      await instance.play(true, {value: web3.toWei(0.001, 'ether'), from: accounts[1]});
      await instance.play(false, {value: web3.toWei(0.001, 'ether'), from: accounts[2]});
      await instance.play(true, {value: web3.toWei(0.001, 'ether'), from: accounts[3]});
      const playerCount = await instance.playerCount();
      assert.equal(playerCount, 3, "player count does not increment")
      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...owner cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[0]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...others cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[4]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...first player cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[1]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...thrid player cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[3]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...second player should withdraw all because he/she is traitor", async function() {
      const instance = await Trust.deployed();
      instance.withdraw.sendTransaction({from: accounts[2]});
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn",
        args: {
          _player: accounts[2]
        }
      });
      assert.equal(eventLogs.length, 1);
      assert(eventLogs[0].args._amount, 0.003);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0, 'ether'), "contract balance does not equal to player sent")
    });
  });
});

contract('Trust', function(accounts) {
  describe("only 1 players trust", function () {
    it("...all three players that trust should play successfully", async function() {
      const instance = await Trust.deployed();
      await instance.play(false, {value: web3.toWei(0.001, 'ether'), from: accounts[1]});
      await instance.play(true, {value: web3.toWei(0.001, 'ether'), from: accounts[2]});
      await instance.play(false, {value: web3.toWei(0.001, 'ether'), from: accounts[3]});
      const playerCount = await instance.playerCount();
      assert.equal(playerCount, 3, "player count does not increment")
      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...others cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[4]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...first player cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[1]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...second player should withdraw all because he/she is traitor", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[2]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...thrid player cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[3]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...owner can withdraw all", async function() {
      const instance = await Trust.deployed();
      instance.withdraw.sendTransaction({from: accounts[0]});
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn",
        args: {
          _player: accounts[0]
        }
      });
      assert.equal(eventLogs.length, 1);
      assert(eventLogs[0].args._amount, 0.003);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0, 'ether'), "contract balance does not equal to player sent")
    });
  });
});

contract('Trust', function(accounts) {
  describe("no players trust", function () {
    it("...all three players that trust should play successfully", async function() {
      const instance = await Trust.deployed();
      await instance.play(false, {value: web3.toWei(0.001, 'ether'), from: accounts[1]});
      await instance.play(false, {value: web3.toWei(0.001, 'ether'), from: accounts[2]});
      await instance.play(false, {value: web3.toWei(0.001, 'ether'), from: accounts[3]});
      const playerCount = await instance.playerCount();
      assert.equal(playerCount, 3, "player count does not increment")
      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...others cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[4]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...first player cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[1]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...second player should withdraw all because he/she is traitor", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[2]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...thrid player cannot withdraw", async function() {
      const instance = await Trust.deployed();
      await expectThrow(instance.withdraw.sendTransaction({from: accounts[3]}));
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn"
      });
      assert.equal(eventLogs.length, 0);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0.003, 'ether'), "contract balance does not equal to player sent")
    });

    it("...owner can withdraw all", async function() {
      const instance = await Trust.deployed();
      instance.withdraw.sendTransaction({from: accounts[0]});
      var eventLogs = await getEventLogs(instance, {
        event: "PlayerWithdrawn",
        args: {
          _player: accounts[0]
        }
      });
      assert.equal(eventLogs.length, 1);
      assert(eventLogs[0].args._amount, 0.003);

      const balance = await proxiedWeb3.eth.getBalance(instance.address);
      assert.equal(balance, web3.toWei(0, 'ether'), "contract balance does not equal to player sent")
    });
  });
});
