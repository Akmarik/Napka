var app = angular.module("app", ['ui.router', 'ui.bootstrap', 'ngCookies', 'ngCart']);

app.controller ('myCtrl', ['$scope', '$http', 'ngCart', 'jsonService', function($scope, $http, ngCart, jsonService) {
    ngCart.setTaxRate(7.5);
    ngCart.setShipping(2.99);

    jsonService.jsonData().then(function(response){
        this.products = response.data.products;
    })
}]);

app.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state("main", {
            url: "/",
            template: "<main-dir></main-dir>"
        })
        .state("main.about", {
            url: "main/about",
            template: "<about-dir></about-dir>"
        })
        .state("main.contact", {
            url: "main/contact",
            template: "<contact-dir></contact-dir>"
        })
        .state("main.cart", {
           url: "main/cart",
            template: "<cart-dir></cart-dir>"
        })
        .state("main.product", {
            url: "main/product/:id",
            template: "<product-id-dir></product-id-dir>"
        })
    ;
});


app.directive("mainDir", function(){
    return {
       restrict: "E",
        templateUrl: "layouts/main.html",
        controller: function($scope, $location, $http, jsonService, pagination){

            var cart = {};

            this.addToCart = function(product){
                cart.product = product.id;
                console.log(cart);
            }

            $scope.isActive = function(destination){
                return destination === $location.path();
            }

            $http.get('data.json')
                .success(function(data){
                    $scope.menuObj = data;
                    pagination.setProducts( data.products );
                    $scope.products = pagination.getPageProducts( $scope.currentPage );
                    $scope.paginationList = pagination.getPaginationList();
                });

            $scope.showPage = function(page) {
                if ( page == 'prev' ) {
                    $scope.products = pagination.getPrevPageProducts();
                } else if ( page == 'next' ) {
                    $scope.products = pagination.getNextPageProducts();
                } else {
                    $scope.products = pagination.getPageProducts( page );
                }
            }

            $scope.currentPageNum = function() {
                return pagination.getCurrentPageNum();
            }

        },
        controllerAs: "mainCtrl"
    }
});

app.directive("aboutDir", function(){
    return {
        restrict: "E",
        templateUrl: "layouts/about.html",
        controller: function(){

        },
        controllerAs: "aboutCtrl"
    }
});

app.directive("contactDir", function(){
    return {
        restrict: "E",
        templateUrl: "layouts/contact.html",
        controller: function(){

        },
        controllerAs: "contactCtrl"
    }
});

app.directive("productIdDir", function(){
    return {
        restrict: "E",
        templateUrl: "layouts/descriptProduct.html",
        controller: function($stateParams, jsonService){
            var _this = this;
            var product = {};
            jsonService.jsonData().then(function(response){
                for(var i = 0; i < response.data['products'].length; i++){
                    if($stateParams.id == response.data['products'][i]['id']){
                        product = response.data['products'][i];
                    }
                }
                _this.product = product;
            });
        },
        controllerAs: "productIdCtrl"
    }
});


app.service("jsonService", function($http){
    this.jsonData = function(){
        return $http.get("data.json");
    }
});

app.filter('startFrom', function(){
    return function(data, start){
        return data.slice(start);
    }
});

app.factory('pagination', function( $sce ) {

    var currentPage = 0;
    var itemsPerPage = 4;
    var products = [];

    return {

        setProducts: function( newProducts ) {
            products = newProducts
        }, /* END of setProducts */

        getPageProducts: function(num) {
            var num = angular.isUndefined(num) ? 0 : num;
            var first = itemsPerPage * num;
            var last = first + itemsPerPage;
            currentPage = num;
            last = last > products.length ? (products.length - 1) : last;
            return products.slice(first, last);
        }, /* END of getPageProducts */

        getTotalPagesNum: function() {
            return Math.ceil( products.length / itemsPerPage );
        }, /* END of getTotalPagesNum */

        getPaginationList: function() {
            var pagesNum = this.getTotalPagesNum();
            var paginationList = [];
            paginationList.push({
                name: $sce.trustAsHtml('&laquo;'),
                link: 'prev'
            });
            for (var i = 0; i < pagesNum; i++) {
                var name = i + 1;
                paginationList.push({
                    name: $sce.trustAsHtml( String(name) ),
                    link: i
                });
            };
            paginationList.push({
                name: $sce.trustAsHtml('&raquo;'),
                link: 'next'
            });
            if (pagesNum > 2) {
                return paginationList;
            } else {
                return null;
            }
        }, /* END of getPaginationList */

        getPrevPageProducts: function() {
            var prevPageNum = currentPage - 1;
            if ( prevPageNum < 0 ) prevPageNum = 0;
            return this.getPageProducts( prevPageNum );
        }, /* END of getPrevPageProducts */

        getNextPageProducts: function() {
            var nextPageNum = currentPage + 1;
            var pagesNum = this.getTotalPagesNum();
            if ( nextPageNum >= pagesNum ) nextPageNum = pagesNum - 1;
            return this.getPageProducts( nextPageNum );
        }, /* END of getNextPageProducts */

        getCurrentPageNum: function() {
            return currentPage;
        }, /* END of getCurrentPageNum */

    }
});

app.directive("cartDir", function(){
   return {
       restrict: "E",
       templateUrl: "layouts/cart.html",
       controller: function(){},
       controllerAs: "cartCtrl"
   } 
});


app.directive("ngcartAddtocart", function(){
    return {
        restrict: "E"
    }
});

