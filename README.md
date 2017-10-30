# trust-dapp
Simple 3-player decision game.

# What are the rules?
1. There are only 3 player in this game.
2. Each player transfer ETHs to the contract and either decides to trust or not to trust.
3. The game ends when the third player makes his/her decision.
4. Result:
  1. If all 3 players decided to trust, then each player will get back the amount of fund they have transferred.
  2. If only 1 player decided not to trust, then the player will get full amount of fund. Other players and the owner get nothing
  3. Otherwise, owner will get full amount of fund and all players will get nothing.

# TODO: Players can cheat in this game
As decision made by players stored in the block-chain is not encrypted. Players is able to see decisions of previous players before making decision.
