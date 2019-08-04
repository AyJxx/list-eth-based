// Contract to be tested
var List = artifacts.require("./List.sol");

// Test suite
contract("List", function(accounts) {
  var listInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "Article 1";
  var articleDescription = "Description for article 1.";
  var articlePrice = 10;

  // Testing buying article when there is no article for sale yet
  it("Should throw an exception if you try to buy article when there is no article for sale yet", function() {
    return List.deployed().then(function(instance) {
      listInstance = instance;

      return listInstance.buyArticle(1, { from: buyer, value: web3.toWei(articlePrice, "ether") });
    }).then(assert.fail).catch(function(error) {
      assert(true);
    }).then(function() {
      return listInstance.getNumberOfArticles(); // We want to also check that state of the contract was not altered
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "Number of articles should be 0");
    });
  });

  // Buy an article that does not exist
  it("Should throw an exception if you try to buy an article which does not exist", function() {
    return List.deployed().then(function(instance) {
      listInstance = instance;

      return listInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller});
    }).then(function(receipt) {
      return listInstance.buyArticle(2, {from: buyer, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail).catch(function(error) {
      assert(true);
    }).then(function() {
      return listInstance.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Article ID should be 1");
      assert.equal(data[1], seller, "Seller must be " + seller);
      assert.equal(data[2], 0x0, "Buyer must be empty");
      assert.equal(data[3], articleName, "Article name must be " + articleName);
      assert.equal(data[4], articleDescription, "Article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "Article price must be " + articlePrice);
    });
  });

  // Testing buying article you are alredy selling
  it("Should throw an exception if you try to buy your own article", function() {
    return List.deployed().then(function(instance) {
      listInstance = instance;

      return listInstance.buyArticle(1, { from: seller, value: web3.toWei(articlePrice, "ether") });
    }).then(assert.fail).catch(function(error) {
      assert(true);
    }).then(function() {
      return listInstance.articles(1); // We want to also check that state of the contract was not altered
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Article ID must be 1");
      assert.equal(data[1], seller, "Seller must be " + seller);
      assert.equal(data[2], 0x0, "Buyer must be empty");
      assert.equal(data[3], articleName, "Article name must be " + articleName);
      assert.equal(data[4], articleDescription, "Article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "Article price must be " + articlePrice);
    });
  });

  // Testing if you try buy an article for a value different from its price
  it("Should throw an exception if you try to buy an article for a value different from its price", function() {
    return List.deployed().then(function(instance) {
      listInstance = instance;

      return listInstance.buyArticle(1, { from: buyer, value: web3.toWei(articlePrice + 1, "ether") });
    }).then(assert.fail).catch(function(error) {
      assert(true);
    }).then(function() {
      return listInstance.articles(1); // We want to also check that state of the contract was not altered
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Article ID must be 1");
      assert.equal(data[1], seller, "Seller must be " + seller);
      assert.equal(data[2], 0x0, "Buyer must be empty");
      assert.equal(data[3], articleName, "Article name must be " + articleName);
      assert.equal(data[4], articleDescription, "Article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "Article price must be " + articlePrice);
    });
  });

  // Testing if you try to buy an article which is already sold
  it("Should throw an exception if you try to buy an article which is already sold", function() {
    return List.deployed().then(function(instance) {
      listInstance = instance;

      return listInstance.buyArticle(1, { from: buyer, value: web3.toWei(articlePrice, "ether") });
    }).then(function() {
      return listInstance.buyArticle(1, { from: web3.eth.accounts[0], value: web3.toWei(articlePrice, "ether") });
    }).then(assert.fail).catch(function(error) {
      assert(true);
    }).then(function() {
      return listInstance.articles(1); // We want to also check that state of the contract was not altered
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Article ID must be 1");
      assert.equal(data[1], seller, "Seller must be " + seller);
      assert.equal(data[2], buyer, "Buyer must be " + buyer);
      assert.equal(data[3], articleName, "Article name must be " + articleName);
      assert.equal(data[4], articleDescription, "Article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "Article price must be " + articlePrice);
    });
  });

});
