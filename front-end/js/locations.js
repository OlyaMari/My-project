gemSis.controller("locations", function ($scope, $http) {
    $scope.locations = [];

    $("nav.header a").removeClass("active");
    $("#headerNavLocations").addClass("active");
    $scope.loadLocations = function () {
        $http.get("/location").then(function (response) {
            $scope.locations = response.data;
        });
    };

    $scope.newLocation = function () {
        $scope.locationObj = {};
        $scope.locationFormDOM = $("#locationForm");
        $scope.locationFormDOM.show();
    };

    $scope.saveLocation = function () {
        if ($scope.locationObj.hasOwnProperty('_id')) {
            $http.put('/location', $scope.locationObj).then(() => {
                $scope.loadLocations();
            });
        } else {
            $http.post('/location', $scope.locationObj).then(
                () => {
                    $scope.loadLocations();
                },
                (err) => console.log(err)
            );
        }
        $scope.closeLocationForm();
    };
    
    $scope.deleteLocation = function () {
        if (confirm("Справді витерти?")) {
            $http.delete(`/location/${$scope.locationObj._id}`)
                .then(
                    () => {
                        $scope.loadLocations();
                        $scope.closeLocationForm();
                    },
                    (err) => alert("Нільзя")
                );
        }
    };

    $scope.closeLocationForm = function () {
        $scope.locationFormDOM.hide();
        $scope.locationForm.$setUntouched();
        $scope.locationForm.$setPristine();
    };

    window.onclick = function (event) {
        if ($scope.hasOwnProperty('locationFormDOM') && event.target == $scope.locationFormDOM[0]) {
            $scope.closeLocationForm();
        }
    };

    $scope.setForm = function (form) {
        $scope.locationForm = form;
    };

    $scope.editLocation = function (location) {
        $scope.locationObj = {
            _id: location._id,
            locationName: location.locationName

        };
        $scope.locationFormDOM = $("#locationForm");
        $scope.locationFormDOM.show();
    };
    $scope.loadLocations();

});
