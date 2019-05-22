var gemSis = angular.module('gemSis', ["ngRoute"]);

gemSis.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        redirectTo : "/customers"
    })
    .when("/customers", {
        templateUrl : "fragments/customers.html",
        controller : "customers"
    })
    .when("/orders", {
        templateUrl : "fragments/orders.html",
        controller : "orders"
    })
    .when("/locations", {
        templateUrl : "fragments/locations.html",
        controller : "locations"
    });
});

// Example from http://jsfiddle.net/2ZzZB/56/
gemSis.filter('startFrom', function() {
    return function(input, start) {
        start = +start;
        return input.slice(start);
    }
});

gemSis.filter('remainDays', function() {
    return function(input) {
        
        var d = new Date(input);
        d = new Date(d.getTime() + (d.getTimezoneOffset() * 60 * 1000));
        
        return Math.ceil((d.getTime() - (new Date()).getTime()) / (1000 * 60 * 60 * 24));
    }
});