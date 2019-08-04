module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganache: {
               host: "localhost",
               port: 7545,
               network_id: "*" // Match any network id
          },
          ayj: {
            host: "localhost",
            port: 8545,
            network_id: "4224",
            //gas: 4700000,
            //from: '0x9c2b203e9a8b50b6b7982d522e0414908ad23c75' // From which account we want to deploy this contract
          }
     }
};
