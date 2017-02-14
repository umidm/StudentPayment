angular.module('Login', [])
    .controller('loginController', ['$scope', '$window', '$location', 'UserAuthFactory', 'AuthenticationFactory',
        function($scope, $window, $location, UserAuthFactory, AuthenticationFactory) {

            $scope.user = {};
            var ad_username = 'admin';
            $scope.user.username = $window.sessionStorage.lastLoginUser ? $window.sessionStorage.lastLoginUser : ad_username;
            $scope.login = function(key) {

                var username = $scope.user.username,
                    password = $scope.user.password;

                if (username !== undefined && password !== undefined) {
                    UserAuthFactory.login(username, password, key).success(function(data) {
                        AuthenticationFactory.isLogged = true;
                        AuthenticationFactory.user = data.user.username;
                        AuthenticationFactory.userRole = data.user.role;

                        $window.sessionStorage.token = data.token;
                        $window.sessionStorage.logkey = key;
                        $window.sessionStorage.user = data.user.username; // to fetch the user details on refresh
                        $window.sessionStorage.lastLoginUser = data.user.username; // to fetch the user details on refresh
                        $window.sessionStorage.userRole = data.user.role; // to fetch the user details on refresh

                        $location.path('/student');

                    }).error(function(status) {
                        alert('Oops something went wrong!');
                        $location.path('/login');
                    });
                } else {
                    alert('Invalid credentials');
                    $location.path('/login');
                }
            };
        }
    ])
    .factory('AuthenticationFactory', function($window) {
        var auth = {
            isLogged: false,
            check: function() {
                if ($window.sessionStorage.token && $window.sessionStorage.user) {
                    this.isLogged = true;
                } else {
                    this.isLogged = false;
                    delete this.user;
                }
            }
        }
        return auth;
    })
    .factory('UserAuthFactory', function($window, $location, $http, AuthenticationFactory) {
        // var userBaseUrl = 'http://localhost:3000/login';
        var userBaseUrl = 'http://localhost:3000/login';
        return {
            login: function(username, password, key) {
                return $http.post(userBaseUrl, {
                    username: username,
                    password: password,
                    logkey: key
                });
            },
            logout: function() {

                if (AuthenticationFactory.isLogged) {

                    AuthenticationFactory.isLogged = false;
                    delete AuthenticationFactory.user;
                    delete AuthenticationFactory.userRole;

                    delete $window.sessionStorage.logkey;
                    delete $window.sessionStorage.token;
                    delete $window.sessionStorage.user;
                    delete $window.sessionStorage.userRole;

                    $location.path("/login");
                }

            }
        }
    })
