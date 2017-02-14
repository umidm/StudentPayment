angular.module('Student', ['ngDialog'])
    .controller('StudentController', ['$scope', '$rootScope', 'studentFactory', 'ngDialog', '$location', function($scope, $rootScope, studentFactory, ngDialog, $location) {
        $scope.studentList = []; // files in current folder


        $scope.reload = function() {
            $scope.isItPayDate = false;
            $scope.selection = [];
            $scope.today = new Date();
            setConfigs();
            getCurrentStudentList(1);
            $scope.search = null;
        };
        $scope.getSearchedStudentList = function() {
            getCurrentStudentList(2);
        };
        $scope.studentPayments = function(id) {
            $location.path('/payments/' + id);
        }
        var getCurrentStudentList = function(value) {
            if (value === 1) {
                studentFactory.getStudentList().then(function(data) {
                    $scope.studentList = data.students;
                }, function(error) {
                    console.log(error);
                });
            } else {
                studentFactory.getSearchedStudentList($scope.search).then(function(data) {
                    $scope.studentList = data.students;
                }, function(error) {
                    console.log(error);
                });
            }
        };
        var setConfigs = function() {
            studentFactory.getConfigs().then(function(data) {
                $scope.courses = data.config.courseConfig.courses;
                $scope.packages = data.config.packageConfig.packages;
                $scope.date = data.dateConfig.dateConfig;
                var da = new Date($scope.date.currentStartedDate);
                var d = new Date($scope.today);
                da.setMonth(da.getMonth() + 1);
                $scope.isItPayDate = d > da;
            }, function(error) {
                console.log(error);
            });
        };

        $scope.openAddStudentDialog = function(studentId) {
            ngDialog.open({
                template: 'addStudent',
                controller: 'addStudentDialogCtrl',
                className: 'ngdialog-theme-default ngdialog-theme-custom',
                scope: $scope
            });
        };
        $scope.setAllStudentMonthPayCheck = function() {

            studentFactory.insertStudentsPeyment($scope.date).then(function(data) {
                $scope.reload();
            }, function(error) {
                console.log(error);
            });
        };
        $scope.reload();

    }])
    .controller('addStudentDialogCtrl', function($scope, ngDialog, studentFactory) {
        $scope.submit = function() {
            var student = {};
            student.info = $scope.info;
            student.paymentInfo = {};
            student.payments = [];
            student.paymentInfo.monthlyPayment = $scope.package.price;
            student.info.package = $scope.package.id;
            studentFactory.insertStudent(student).then(function(data) {
                ngDialog.close();
                $scope.reload();
            }, function(error) {
                console.log(error);
            });
        };
    })
    .directive("addStudentDialogue", function() {
        return {
            restrict: 'E',
            templateUrl: "directives/student/add-student-dialogue.html"
        }
    })

.factory('studentFactory', function($http, $q, BASE_URL) {
    var studentBaseURL = BASE_URL + '/student';
    return {
        getStudentList: function() {
            return $http.get(studentBaseURL + '/activeStudents')
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
        getSearchedStudentList: function(data) {
            return $http.get(studentBaseURL + '/getSearchedStudentList?name=' + data.name + '&package=' + data.package + '&course=' + data.course + '&paid=' + data.paid + '&unpaid=' + data.unpaid + '&')
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
        insertStudent: function(student) {
            return $http.post(studentBaseURL + '/admin/insertStudent', student)
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
        insertStudentsPeyment: function(date) {
            return $http.post(studentBaseURL + '/studentsPayment', date)
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
        }
    };
})
