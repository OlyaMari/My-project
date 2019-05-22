gemSis.controller("orders", function ($scope, $http, $filter, $location) {
    $scope.currentPage = 0;
    $scope.pageSize = 8;
    $scope.orders = [];
    $scope.filteredRecords = 0;
    $scope.pages = [];

    $scope.numberOfPages = function () {
        return Math.ceil($scope.filteredRecords / $scope.pageSize);
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage = $scope.currentPage - 1;
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.filteredRecords / $scope.pageSize - 1) {
            $scope.currentPage = $scope.currentPage + 1;
        }
    };

    $scope.gotoPage = function (n) {
        $scope.currentPage = n;
    }
    $scope.sortType = 'insertDate';
    $scope.sortReverse = true;

    $("nav.header a").removeClass("active");
    $("#headerNavOrders").addClass("active");


    $scope.newOrder = function () {
        $scope.resetCustomer();
        $scope.orderObj = {};
        $scope.getCustomers();
        $scope.orderObj.productTypeId = $scope.productTypes[1]._id;
        $scope.orderFormDOM = $("#orderForm");
        $scope.orderFormDOM.show();
    };


    $scope.getCustomers = function (customer) {
        
        $http.get("/customer").then(function (response) {
            
            $scope.customers = response.data;
            $filter('filter')($scope.customers, {orderBy: 'lastName'});
            
            if (customer) {
                for (var i = 0; i < $scope.customers.length; i++) {
                    if ($scope.customers[i]._id == customer._id) {
                        $scope.orderObj.customer = $scope.customers[i];
                        break;
                    } 
                }
            } else {
                $scope.orderObj.customer = $scope.customers[0];
            }
                
        });
    }
    
    $scope.saveOrder = function () {
        $scope.orderObj.customerId = $scope.orderObj.customer._id;
        delete $scope.orderObj.customer;
        if ($scope.orderObj.hasOwnProperty('_id')) {
            $http.put('/order', $scope.orderObj).then(() => {
                $scope.loadOrders();
            });
        } else {
            $http.post('/order', $scope.orderObj).then(
                () => {
                    $scope.selectedProductType = $scope.productTypes[0]._id;
                    $scope.currentPage = 0;
                    $scope.sortType = 'insertDate';
                    $scope.sortReverse = true;
                    $scope.loadOrders();
                },
                (err) => console.log(err)
            );
        }
        $scope.closeOrderForm();
    };
    
    $scope.deleteOrder = function () {
        if (confirm("Справді витерти?")) {
            $http.delete(`/order/${$scope.orderObj._id}`)
                .then(
                    () => {
                        $scope.loadOrders();
                        $scope.closeOrderForm();
                    },
                    (err) => console.log(err)
                );
        }
    };

    $http.get("/producttype").then(function (response) {
        $scope.productTypes = response.data;
        $scope.productTypes.unshift({
            _id: "",
            typeName: "Всі продукти"
        });
        $scope.selectedProductType = $scope.productTypes[0]._id;
        
        $scope.productTypeMap = {};

        for (var i = 0; i < $scope.productTypes.length; i++) {
            $scope.productTypeMap[$scope.productTypes[i]._id] = $scope.productTypes[i].typeName;
        };
    });

    $scope.onProductTypeChange = function () {
        $scope.currentPage = 0;
        // нова кількість записів після фільтрування 
        $scope.filteredRecords = $scope.getFilteredRecords();
        // перебудувати сторінки
        $scope.buildPages();
    }

    $scope.getFilteredRecords = function () {
        return $filter('filter')($scope.orders, {
            productTypeId: $scope.selectedProductType, customerId: $scope.customerId
        }).length;
    }

    $scope.loadOrders = function () {
        $http.get("/order").then(function (response) {   
            $scope.orders = response.data;
            $scope.filteredRecords = $scope.getFilteredRecords();
            $scope.buildPages();
        });
    };

    $scope.buildPages = function () {
        $scope.pages = [];
        for (var i = 0; i < $scope.numberOfPages(); i++) {
            $scope.pages.push({
                "n": i
            });
        }
        if ($scope.currentPage > $scope.pages.length - 1) {
          $scope.currentPage = $scope.pages.length - 1;   
        }
    }

    $scope.closeOrderForm = function () {
        $scope.orderFormDOM.hide();
        $scope.orderForm.$setUntouched();
        $scope.orderForm.$setPristine();
    };


    window.onclick = function (event) {
        if ($scope.hasOwnProperty('orderFormDOM') && event.target == $scope.orderFormDOM[0]) {
            $scope.closeOrderForm();
        }
    };

    $scope.setForm = function (form) {
        $scope.orderForm = form;
    };
    
    $scope.editOrder = function (order) {
        $scope.orderObj = {
            _id: order._id,
            productTypeId: order.productTypeId,
            deliveryDate: new Date(order.deliveryDate),
            notes: order.notes
        };
        $scope.getCustomers(order.customer[0]);
        $scope.orderFormDOM = $("#orderForm");
        $scope.orderFormDOM.show();
    };
    
    $scope.searchCustomer = function(customer) {
       $location.path('/customers').search({q: customer.firstName + " " + customer.lastName});
    };
    
    $scope.resetCustomer = function() {
        $scope.customerId = "";
        $scope.customerName = "";
    }
    
    var queryString = $location.search();
    
    if (queryString.hasOwnProperty("cId")) {
        $scope.customerId = queryString.cId;
        $scope.customerName = queryString.cName;
    }
    
    $scope.loadOrders();
    
});
