(function () {
    'use strict';
    var module = angular.module('app')
        .component('appComponent', {
            templateUrl: 'app/app.html',
            controller: ['$http', controller],
            controllerAs: 'model'
        })

    function controller($http) {
        var model = this;
        model.numOfCurrencies = 10;
        model.cryptoArray = [];
        model.userName = 'tyler-fletcher';


        model.getSteemPerMvest = function (username, numOfCurrencies) {
            steem.api.getDynamicGlobalProperties(function (err, result) {

                // Get Total Vesting Fund Steem As A Number
                var total_vesting_fund_steem = result.total_vesting_fund_steem;
                total_vesting_fund_steem = Number(total_vesting_fund_steem.substring(0, total_vesting_fund_steem.length - 6));

                // Get Total Vesting Shares As A Number
                var total_vesting_shares = result.total_vesting_shares;
                total_vesting_shares = Number(total_vesting_shares.substring(0, total_vesting_shares.length - 6));

                // Calculate Current Steem/MVest
                var steem_per_mvest = (total_vesting_fund_steem / (total_vesting_shares / 1000000)).toFixed(3);

                // Get Account Data, Passing Current Steem/MVest
                getAccount(steem_per_mvest, username, numOfCurrencies);
            });
        }

        // Function to get Account Data, Using Current Steem/MVest 
        function getAccount(steemPerMVest, username, numOfCurrencies) {
            steem.api.getAccounts([username], function (err, result) {
                handleUserData(result, steemPerMVest, numOfCurrencies);
            });
        }

        // Data handler
        function handleUserData(account, steemPerMVest, numOfCurrencies) {

            // Only Searching One Account, Get The Vesting Shares
            // And Convert To Number
            var vest = account[0].vesting_shares;
            vest = Number(vest.substring(0, vest.length - 6));

            // Calculate Steem Power
            var SP = ((vest * steemPerMVest) / 1000000).toFixed(3);

            var url = 'https://api.coinmarketcap.com/v1/ticker/?limit=' + numOfCurrencies;

            // Pass Current Steem Power Into CMC Comparison Function
            getCoinMarketCap(url, SP);

        };

        // CMC Comparison Function
        function getCoinMarketCap(endpoint, SP) {
            // Request top 10 Cryptocurrencies
            // Simple GET request example:
            $http({
                method: 'GET',
                url: endpoint
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                handleCryptoObject(response.data, SP);
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(response);
            });
        }

        // Get CMC JSON and Parse Into JSON Object
        function handleCryptoObject(result, SP) {
            var jsonObject = result;
            model.total_steem = SP;
            var steem_index;


            // Get Index Of Steem
            for (var i = 0; i < jsonObject.length; i++) {
                if (jsonObject[i].name == "Steem") {
                    steem_index = i;
                }
            }

            model.total_worth = (model.total_steem * jsonObject[steem_index].price_usd);

            // Push Each Crypto to The CryptoArray
            for (var i = 0; i < jsonObject.length; i++) {
                var cryptoObject = {};
                cryptoObject.name = jsonObject[i].name;
                cryptoObject.rank = jsonObject[i].rank;
                cryptoObject.price_usd = jsonObject[i].price_usd;
                cryptoObject.price_btc = jsonObject[i].price_btc;
                cryptoObject.symbol = jsonObject[i].symbol;
                cryptoObject.compared_worth = (model.total_worth / cryptoObject.price_usd);
                model.cryptoArray.push(cryptoObject);
            }


            // Current Steem Price In USD
            model.steem_price = model.cryptoArray[steem_index].price_usd;

            // Your Current Worth In USD For Your Amount Of Steem
            model.worth = (model.total_steem * model.cryptoArray[steem_index].price_usd);

            model.total_amount = function (price_usd) {
                model.total_amount = (model.worth / price_usd);
            }

        }
    }
}());
