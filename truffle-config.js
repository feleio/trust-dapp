module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    staging: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "0x90b32627509520Cd44734148024dA2Ad05dBAf29", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 4700000 // Gas limit used for deploys
    }
  }
};
