document.location.href = '#/';
angular.module('App', ['ngRoute', 'Student', 'Payment', 'Login', 'Config'])
    .constant("BASE_URL", "http://localhost:3000/api")
    .controller('NavController', ['$scope', 'UserAuthFactory', function($scope, UserAuthFactory) {

        $scope.tab = 1;

        $scope.isSet = function(checkTab) {
            return $scope.tab === checkTab;
        };

        $scope.setTab = function(setTab) {
            $scope.tab = setTab;
        };

        $scope.logout = function() {
            UserAuthFactory.logout();
        }

    }])
    .config(function($routeProvider, $httpProvider) {
        $httpProvider.interceptors.push('TokenInterceptor');
        $routeProvider.
            // route for the student page
        when('/student', {
            templateUrl: 'pages/student/student.html',
            controller: 'StudentController',
            access: {
                requiredLogin: true
            }
        }).
        when('/config', {
            templateUrl: 'pages/config/config.html',
            controller: 'ConfigController',
            access: {
                requiredLogin: true
            }
        }).
        when('/payments/:id', {
            templateUrl: 'pages/student_payment/payment.html',
            controller: 'PaymentController',
            access: {
                requiredLogin: true
            }
        })

        .when('/login', {
            templateUrl: 'pages/login/login.html',
            controller: 'loginController',
            access: {
                requiredLogin: false
            }
        })

        .otherwise({
            redirectTo: '/login',
        });
    })
    .factory('TokenInterceptor', function($q, $window) {
        return {
            request: function(config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    config.headers['X-Access-Token'] = $window.sessionStorage.token;
                    config.headers['X-Key'] = $window.sessionStorage.user;
                    config.headers['Content-Type'] = "application/json";
                    config.headers['Log-Key'] = $window.sessionStorage.logkey;
                }
                return config || $q.when(config);
            },

            response: function(response) {
                return response || $q.when(response);
            }
        };
    })
    .run(function($rootScope, $window, $location, AuthenticationFactory) {
        // when the page refreshes, check if the user is already logged in
        AuthenticationFactory.check();

        $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
            if ((nextRoute.access && nextRoute.access.requiredLogin) && !AuthenticationFactory.isLogged) {
                $location.path("/login");
            } else {
                // check if user object exists else fetch it. This is incase of a page refresh
                if (!AuthenticationFactory.user) AuthenticationFactory.user = $window.sessionStorage.user;
                if (!AuthenticationFactory.userRole) AuthenticationFactory.userRole = $window.sessionStorage.userRole;
            }
        });

        $rootScope.$on('$routeChangeSuccess', function(event, nextRoute, currentRoute) {
            $rootScope.showMenu = AuthenticationFactory.isLogged;
            $rootScope.role = AuthenticationFactory.userRole;
            // if the user is already logged in, take him to the home page
            if (AuthenticationFactory.isLogged == true && $location.path() == '/login') {
                $location.path('/student');
            }
        });
    });
