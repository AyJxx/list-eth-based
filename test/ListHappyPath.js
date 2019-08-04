var List = artifacts.require("./List.sol");

// Test suite
contract('List', function(accounts) {
  var listInstance;
  var seller = accounts[1];
  var buyer = accounts[2];

  var articleName1 = "Article 1";
  var articleDescription1 = "Description for article 1.";
  var articlePrice1 = 10;

  var articleName2 = "Article 2";
  var articleDescription2 = "Description for article 2.";
  var articlePrice2 = 20;

  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  // Testing initialization
  /* OLD
  it("Should be initialized with empty values", function() {
    return List.deployed().then(function(instance) {
      return instance.getArticle();
    }).then(function(data) {
      //console.log("data[3]=", data[3]);
      assert.equal(data[0], 0x0, "Seller must be empty");
      assert.equal(data[1], 0x0, "Buyer must be empty");
      assert.equal(data[2], "", "Article name must be empty");
      assert.equal(data[3], "", "Article description must be empty");
      assert.equal(data[4].toNumber(), 0, "Article price must be 0");
    });
  });
  */
  it("Should be initialized with empty values", function() {
    return List.deployed().then(function(instance) {
      listInstance = instance;

      return instance.getNumberOfArticles();
    }).then(function(data) {
      //console.log("data[3]=", data[3]);
      assert.equal(data.toNumber(), 0, "Number of articles must be 0");
      return listInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 0, "There should not be any article for sale");
    });
  });

  // Testing function sellArticle()
  /* OLD
  it("Should sell an article", function(){
    return List.deployed().then(function(instance) {
      listInstance = instance;

      return listInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), { from: seller });
    }).then(function() {
      // Here our transaction was mined, so we can check our article
      return listInstance.getArticle();
    }).then(function(data) {
      assert.equal(data[0], seller, "Seller must be " + seller);
      assert.equal(data[1], 0x0, "Buyer must be empty");
      assert.equal(data[2], articleName, "Article name must be " + articleName);
      assert.equal(data[3], articleDescription, "Article description must be " + articleDescription);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "Article price must be " + articlePrice);
    });
  });
  */
  // Selling first article
  it("Should let us sell first article", function() {
    return List.deployed().then(function(instance) {
      listInstance = instance;

      return listInstance.sellArticle(articleName1, articleDescription1, web3.toWei(articlePrice1, "ether"), {from: seller});
    }).then(function(receipt) {
      // Checking LogSellArticle event
      assert.equal(receipt.logs.length, 1, "One event should have been triggered"); // We should have 1 event
      assert.equal(receipt.logs[0].event, "LogSellArticle", "Event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "ID must be " + 1);
      assert.equal(receipt.logs[0].args._seller, seller, "Event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "Event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "Event article price must be " + articlePrice1);

      return listInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 1, "Number of articles should be 1");

      return listInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "There should be 1 article for sale");
      assert.equal(data[0].toNumber(), 1, "Article ID should be 1");

      return listInstance.articles(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Article ID should be 1");
      assert.equal(data[1], seller, "Seller must be " + seller);
      assert.equal(data[2], 0x0, "Buyer must be empty");
      assert.equal(data[3], articleName1, "Article name must be " + articleName1);
      assert.equal(data[4], articleDescription1, "Article description must be " + articleDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether"), "Article price must be " + articlePrice1);
    });
  });
  // Selling second article
  it("Should let us sell second article", function() {
    return List.deployed().then(function(instance) {
      listInstance = instance;

      return listInstance.sellArticle(articleName2, articleDescription2, web3.toWei(articlePrice2, "ether"), {from: seller});
    }).then(function(receipt) {
      // Checking LogSellArticle event
      assert.equal(receipt.logs.length, 1, "One event should have been triggered"); // We should have 1 event
      assert.equal(receipt.logs[0].event, "LogSellArticle", "Event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "ID must be " + 2);
      assert.equal(receipt.logs[0].args._seller, seller, "Event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName2, "Event article name must be " + articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "Event article price must be " + articlePrice2);

      return listInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 2, "Number of articles should be 2");

      return listInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 2, "There should be 2 article for sale");
      assert.equal(data[1].toNumber(), 2, "Article ID should be 2");

      return listInstance.articles(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "Article ID should be 2");
      assert.equal(data[1], seller, "Seller must be " + seller);
      assert.equal(data[2], 0x0, "Buyer must be empty");
      assert.equal(data[3], articleName2, "Article name must be " + articleName2);
      assert.equal(data[4], articleDescription2, "Article description must be " + articleDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, "ether"), "Article price must be " + articlePrice2);
    });
  });

  // Testing buying first article -> IMPORTANT!!! need to be run after sellArticle() test
  it("Should buy an article", function() {
    return List.deployed().then(function(instance) {
      listInstance = instance;

      // Saving balances of seller and buyer before buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      return listInstance.buyArticle(1, { from: buyer, value: web3.toWei(articlePrice1, "ether") });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "One event should have been triggered"); // We should have 1 event -> LogBuyArticle
      assert.equal(receipt.logs[0].event, "LogBuyArticle", "Event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "Article ID must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "Event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "Event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "Event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "Event article price must be " + articlePrice1);

      // Saving balances after buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // Checking effect of buy on the balances of buyer and seller accounting for gas
      assert(sellerBalanceAfterBuy == (sellerBalanceBeforeBuy + articlePrice1), "Seller should have earned " + articlePrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= (buyerBalanceBeforeBuy - articlePrice1), "Buyer should have spent " + articlePrice1 + " ETH"); // We need to account for gas

      return listInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "There should be 1 article for sale");
      assert.equal(data[0].toNumber(), 2, "Article ID for sale should be 2");

      return listInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 2, "There should still be a total of 2 articles");
    });
  });

  // Testing event LogSellArticle
  /* OLD
  it("Should trigger an event when a new article is sold", function() {
    return List.deployed().then(function(instance) {
      listInstance = instance;

      return listInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), { from: seller });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "One event should have been triggered"); // We should have 1 event
      assert.equal(receipt.logs[0].event, "LogSellArticle", "Event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._seller, seller, "Event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName, "Event article name must be " + articleName);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "Event article price must be " + articlePrice);
    });
  });*/

});
