angular.module('Config', [])
    .controller('ConfigController', ['$scope', 'configFactory', function($scope, configFactory) {

        $scope.reload = function() {
            $scope.today = new Date();
            setConfigs();
        };
        var setConfigs = function() {
            configFactory.getConfigs().then(function(data) {
                $scope.date = data.dateConfig.dateConfig;
                $scope.date.activeConfigDate = new Date($scope.date.currentStartedDate);
            }, function(error) {
                console.log(error);
            });
        };
        $scope.submit = function() {
            var date = $scope.date
            configFactory.setDateConfig(date).then(function(data) {
                $scope.reload();
            }, function(error) {
                console.log(error);
            });
        };
        $scope.reload();

    }])

.factory('configFactory', function($http, $q, BASE_URL) {
    var studentBaseURL = BASE_URL + '/student';
    return {
        getConfigs: function() {
            return $http.get(studentBaseURL + '/getConfigs')
                .then(function(response) {
                    if (typeof response.data === 'object') {
                        return response.data;
                    } else {
                        return $q.reject(response.data);
                    }

                }, function(response) {
                    return $q.reject(response.data);
                });
        },
        setDateConfig: function(data) {
            return $http.post(studentBaseURL + '/admin/setBeginningDate', data)
                .then(function(response) {
                    if (typeof response.data === 'object') {
                        return response.data;
                    } else {
                        return $q.reject(response.data);
                    }

                }, function(response) {
                    return $q.reject(response.data);
                });
        }
    };
})
