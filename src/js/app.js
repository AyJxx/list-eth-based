App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,
     loading: false,

     init: function() {
          // Load articles

          /*var articlesRow = $('#articlesRow');
          var articleTemplate = $('#articleTemplate');

          articleTemplate.find('.panel-title').text('Article 1');
          articleTemplate.find('.article-description').text('Description for article 1');
          articleTemplate.find('.article-price').text('10.0');
          articleTemplate.find('.article-seller').text('0x123456789123456789');

          articlesRow.append(articleTemplate.html());*/

          return App.initWeb3();
     },

     initWeb3: function() {
          // Initialize web3
          if (typeof web3 !== 'undefined') {
            // Reusing provider of web3 object injected by MetaMask
            App.web3Provider = web3.currentProvider;
          }
          else {
            // Creating new provider and plugging it in directly into our local node
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          }
          web3 = new Web3(App.web3Provider);

          App.displayAccountInfo();

          return App.initContract();
     },

     displayAccountInfo: function() {
       web3.eth.getCoinbase(function(err, account) {
         if (err == null) {
           App.account = account;
           $('#account').text(account);
           web3.eth.getBalance(account, function(err, balance) {
             if (err == null) {
               $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
             }
           });
         }
       });
     },

     initContract: function() {
          $.getJSON('List.json', function(listArtifact) {
            // Get the contract artifact file to instantiate truffle contract abstraction
            App.contracts.List = TruffleContract(listArtifact); // We are wrapping our contract
            // Set the provider for our contracts
            App.contracts.List.setProvider(App.web3Provider);
            // Event listener
            App.listenToEvents();
            // Retrieve the article
            return App.reloadArticles();
          });
     },

     reloadArticles: function() {
       if (App.loading) {
         return;
       }
       App.loading = true;

       // Refresh account information
       App.displayAccountInfo();

       var listInstance;

       App.contracts.List.deployed().then(function(instance) {
         listInstance = instance;

         return listInstance.getArticlesForSale();
       }).then(function(articleIDs) {
         // Retrieve the article placeholder and clear it
         $('#articlesRow').empty();

         for (var i = 0; i < articleIDs.length; i++) {
           var articleID = articleIDs[i];

           listInstance.articles(articleID.toNumber()).then(function(article) {
             App.displayArticle(article[0], article[1], article[3], article[4], article[5]); // article[2] is buyer so we are skipping him, because we are not showing bought articles
           });
         }

         App.loading = false;
       }).catch(function(err) {
         console.error(err.message);

         App.loading = false;
       });
     },

     displayArticle: function(id, seller, name, description, price) {
       var articlesRow = $('#articlesRow');
       var etherPrice = web3.fromWei(price, "ether");

       // Retrieve the article template
       var articleTemplate = $('#articleTemplate');
       articleTemplate.find('.panel-title').text(name);
       articleTemplate.find('.article-description').text(description);
       articleTemplate.find('.article-price').text(etherPrice);
       articleTemplate.find('.btn-buy').attr('data-id', id); // Storing article ID
       articleTemplate.find('.btn-buy').attr('data-value', etherPrice); // We are setting here price as data to button Buy which includes buyArticle() function

       // Showing seller name and button for buying according to statement if seller is I or not
       if (seller == App.account) {
         articleTemplate.find('.article-seller').text("You");
         articleTemplate.find('.btn-buy').hide();
       }
       else {
         articleTemplate.find('.article-seller').text(seller);
         articleTemplate.find('.btn-buy').show();
       }

       // Add this article to collection
       articlesRow.append(articleTemplate.html());
     },

     sellArticle: function() {
       // Retrieve values from input form
       var _article_name = $('#article_name').val();
       var _article_description = $('#article_description').val();
       var _article_price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");

       if (_article_name.trim() == '' || _article_price == 0) {
         // Nothing to sell
         return false;
       }

       App.contracts.List.deployed().then(function(instance) {
         return instance.sellArticle(_article_name, _article_description, _article_price, { from: App.account, gas: 500000 });
       }).catch(function(err) {
         console.error(err);
       });
     },

     buyArticle: function() {
       event.preventDefault(); // Trick to avoid issue

       // Retrieve article ID
       var _id = $(event.target).data('id'); // event.target is currently clicked button
       // Retrieve article price
       var _price = parseFloat($(event.target).data('value')); // event.target is currently clicked button

       App.contracts.List.deployed().then(function(instance) {
         instance.buyArticle(_id, { from: App.account, value: web3.toWei(_price, "ether"), gas: 500000 });
       }).catch(function(err) {
         console.error(err);
       });
     },

     // Function listens to events triggered by contract
     listenToEvents: function() {
       App.contracts.List.deployed().then(function(instance) {

         // Listening for LogSellArticle event
         instance.LogSellArticle({}, {}).watch(function(error, event) {
           if (error == null) {
             $('#events').append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
           }
           else {
             console.error(error);
           }

           App.reloadArticles();
         });

         // Listening for LogBuyArticle event
         instance.LogBuyArticle({}, {}).watch(function(error, event) {
           if (error == null) {
             $('#events').append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name +'</li>');
           }
           else {
             console.error(error);
           }

           App.reloadArticles();
         });
       });
     },

};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
