pragma solidity ^0.4.18;

import "./Ownable.sol";

// This contract inherits from Ownable contract, in this case only List contract is deployed to the blockchain, but inherits code functionality from its parent
contract List is Ownable {
  // Custom types
  struct Article {
    uint id; // uint is uint256
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

  // State variables
  mapping (uint => Article) public articles;
  uint articleCounter;

  // Events
  // Indexed means that we can filder events specifically for seller or buyer
  event LogSellArticle(uint indexed _id, address indexed _seller, string _name, uint256 _price);
  event LogBuyArticle(uint indexed _id, address indexed _seller, address indexed _buyer, string _name, uint256 _price);

  // Contract deactivation
  function kill() public onlyOwner {
    // Only contract owner will be able to call this function thanks to modifier onlyOwner() in Ownable contract
    selfdestruct(owner); // Refunds all reamining funds on this contract to the owner
  }

  function getNumberOfArticles() public view returns (uint) {
    return articleCounter;
  }

  function getArticlesForSale() public view returns(uint[]) {
    // Prepare outpupt array
    uint[] memory articleIDs = new uint[](articleCounter); // By default complex types like arrays, structs, etc. are stored in storage which is much more expensive than in memory

    uint numberOfArticlesForSale = 0;

    for (uint i = 1; i <= articleCounter; i++) {
      // Keep the ID if article is stil for sale
      if (articles[i].buyer == 0x0) {
        articleIDs[numberOfArticlesForSale] = articles[i].id; // Also may be ... = i;
        numberOfArticlesForSale++;
      }
    }

    // Copy articleIDs array to new smaller array which only contains articles for sale
    uint[] memory forSale = new uint[](numberOfArticlesForSale);
    for (i = 0; i < numberOfArticlesForSale; i++) {
      forSale[i] = articleIDs[i];
    }

    return forSale;
  }

  /* OLD
  function getArticle() public view returns (address _seller, address _buyer, string _name, string _description, uint256 _price) {
    return (seller, buyer, name, description, price);
  }*/

  function sellArticle(string _name, string _description, uint256 _price) public {
    /* OLD
    seller = msg.sender;
    name = _name;
    description = _description;
    price = _price;*/

    // Storing article
    articleCounter++;
    articles[articleCounter] = Article(articleCounter, msg.sender, 0x0, _name, _description, _price);

    LogSellArticle(articleCounter, msg.sender, _name, _price);
  }

  function buyArticle(uint _id) payable public {
    // Checking wheter there is article for sale
    require(articleCounter > 0);

    // Checking if article really exists
    require(_id > 0 && _id <= articleCounter);

    // Retrieving article from the mapping
    Article storage article = articles[_id]; // storage means that all modifications to this field remains stored in contract

    // Checking that the article has not been sold yet
    require(article.buyer == 0x0);

    // We don't allow seller to buy his own article
    require(msg.sender != article.seller);

    // Check that value sent is the same as article price
    require(msg.value == article.price);

    // Keep info of the buyer, it is better to save buyer before sending payment
    article.buyer = msg.sender;

    // Buyer can pay the seller
    article.seller.transfer(msg.value);

    // Triggering the event
    LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
  }
}
