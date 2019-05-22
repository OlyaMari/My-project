gemSis.controller("customers", function ($scope, $http, $filter, $location) {
    $scope.currentPage = 0;
    $scope.pageSize = 8;
    $scope.customers = [];
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
    $("#headerNavCustomers").addClass("active");

    $http.get("/location").then(function (response) {
        $scope.locations = response.data;
        $scope.locations.unshift({
            _id: "",
            locationName: "Всі"
        });
        $scope.selectedLocation = $scope.locations[0];

        $scope.locationMap = {};

        for (var i = 0; i < $scope.locations.length; i++) {
            $scope.locationMap[$scope.locations[i]._id] = $scope.locations[i].locationName;
        }
    });

    $scope.onLocationChange = function () {
        $scope.currentPage = 0;
        // нова кількість записів після фільтрування 
        $scope.filteredRecords = $scope.getFilteredRecords();
        // перебудувати сторінки
        $scope.buildPages();
    }

    $scope.getFilteredRecords = function () {
        return $filter('filter')($scope.customers, {
            locationId: $scope.selectedLocation._id
        }).length;
    }

    $scope.searchQuery = "";
    $scope.searchDisabled = false;
    $scope.searchLabel = "Search";

    $scope.searchCustomers = function () {
        if ($scope.searchDisabled) {
            $scope.searchDisabled = false;
            $scope.searchLabel = "Search";
            $scope.searchQuery = "";
            $scope.loadCustomers();

        } else {
            $scope.searchDisabled = true;
            $scope.searchLabel = "Reset";
            $scope.loadCustomers();
        }
    };

    $scope.loadCustomers = function () {
        $http.get("/customer?q=" + $scope.searchQuery).then(function (response) {
            $scope.customers = response.data;
            // нова кількість записів після фільтрування 
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



    $scope.newCustomer = function () {
        $scope.customerObj = {};
        $scope.customerObj.locationId = $scope.locations[1]._id;
        $scope.customerFormDOM = $("#customerForm");
        $scope.customerFormDOM.show();
    };

    $scope.saveCustomer = function () {
        if ($scope.customerObj.hasOwnProperty('_id')) {
            $http.put('/customer', $scope.customerObj).then(() => {
                $scope.loadCustomers();
            });
        } else {
            $http.post('/customer', $scope.customerObj).then(
                () => {
                    $scope.selectedLocation = $scope.locations[0];
                    $scope.currentPage = 0;
                    $scope.searchQuery = "";
                    $scope.sortType = 'insertDate';
                    $scope.sortReverse = true;
                    $scope.loadCustomers();
                },
                (err) => console.log(err)
            );
        }
        $scope.closeCustomerForm();
    };

    $scope.deleteCustomer = function () {
        if (confirm("Справді витерти?")) {
            $http.delete(`/customer/${$scope.customerObj._id}`)
                .then(
                    () => {
                        $scope.loadCustomers();
                        $scope.closeCustomerForm();
                    },
                    (err) => alert("Нільзя")
                );
        }
    };

    $scope.closeCustomerForm = function () {
        $scope.customerFormDOM.hide();
        $scope.customerForm.$setUntouched();
        $scope.customerForm.$setPristine();
    };

    window.onclick = function (event) {
        if ($scope.hasOwnProperty('customerFormDOM') && event.target == $scope.customerFormDOM[0]) {
            $scope.closeCustomerForm();
        }
    }

    $scope.setForm = function (form) {
        $scope.customerForm = form;
    };

    $scope.editCustomer = function (customer) {
        $scope.customerObj = {
            _id: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            tel: customer.tel,
            instagram: customer.instagram,
            email: customer.email,
            locationId: customer.locationId
        };
        $scope.customerFormDOM = $("#customerForm");
        $scope.customerFormDOM.show();
    };
    
    $scope.showOrders = function(customer) {
      $location.path('/orders').search({cId: customer._id, cName: customer.firstName + ' ' + customer.lastName});  
    };
    
    var queryString = $location.search();
    
    if (queryString.hasOwnProperty("q")) {
        $scope.searchQuery = queryString.q;
        $scope.searchCustomers();
    } else {
        $scope.loadCustomers();
    }
    

});
