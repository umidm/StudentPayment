angular.module('Payment', ['ngDialog'])
    .controller('PaymentController', ['$scope', 'ngDialog', 'paymentPaymentFactory', 'Helper', function($scope, ngDialog, paymentPaymentFactory, Helper) {
        $scope.paymentList = []; // files in current folder
        // $scope.studentPaymentInfo = {};
        // $scope.studentInfo = {};


        $scope.reload = function() {
            $scope.selection = [];
            getStudentPaymentList();
        };
        var getStudentPaymentList = function() {
            paymentPaymentFactory.getStudent().then(function(data) {
                $scope.paymentList = data.student.payments;
                $scope.studentPaymentInfo = data.student.paymentInfo;
                $scope.studentInfo = data.student.info;
            }, function(error) {
                console.log(error);
            });
        };

        $scope.openAddStudentPaymentDialog = function(payment) {
            var nData = Helper.clone(payment);
            $scope.studentPayment = nData;

            ngDialog.open({
                template: 'addStudentPayment',
                width: '40%',
                controller: 'addStudentPaymentDialogCtrl',
                className: 'ngdialog-theme-default ngdialog-theme-custom',
                scope: $scope
            });
        };

        $scope.reload();

    }])

.controller('addStudentPaymentDialogCtrl', function($scope, ngDialog, paymentPaymentFactory) {
        var monthlyPayment = $scope.studentPayment.shouldPaid + $scope.studentPayment.paid;
        $scope.payment = $scope.studentPayment;
        $scope.paidDateCheckbox = true;
        $scope.payment.paidDate = new Date($scope.payment.paidDate);
        // $scope.$watch('paidDateCheckbox', function(newValue, oldValue) {
        //     if (newValue === true) {
        //         $scope.payment.paidDate = new Date();
        //     }
        // }, true);
        $scope.$watch('payment.fullPaid', function(newValue, oldValue) {
            if (newValue === true) {
                if ($scope.payment.shouldPaid !== 0)
                    $scope.payment.shouldPaid = 0
            } else {
                $scope.payment.shouldPaid = monthlyPayment - $scope.payment.paid;
            }
        }, true);
        $scope.$watch('payment.paid', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                if (!$scope.payment.fullPaid)
                    $scope.payment.shouldPaid = monthlyPayment - $scope.payment.paid;
            }
        }, true);
        $scope.$watch('payment.shouldPaid', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                if (newValue === 0) {
                    $scope.payment.fullPaid = true;
                }
            }
        }, true);
        $scope.submit = function() {
            paymentPaymentFactory.updateStudentPayment($scope.payment).then(function(data) {
                ngDialog.close();
                $scope.reload();
            }, function(error) {
                console.log(error);
            });
        };
    })
    .directive("addStudentPaymentDialogue", function() {
        return {
            restrict: 'E',
            templateUrl: "directives/payment/add-payment-dialogue.html"
        }
    })
    .factory('paymentPaymentFactory', function($http, $q, $routeParams, BASE_URL) {
        var studentBaseURL = BASE_URL + '/student';
        return {
            getStudent: function() {
                return $http.get(studentBaseURL + '/studentPayments/' + $routeParams.id)
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
            insertStudentPayment: function(studentId, payment) {
                return $http.post(studentBaseURL + '/studentPayments/' + studentId, payment)
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
            updateStudentPayment: function(payment) {
                return $http.post(studentBaseURL + '/admin/updateStudentPayment/' + $routeParams.id, payment)
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
    .service('Helper', function() {
        this.clone = function(data) {
            return JSON.parse(JSON.stringify(data));
        }
        this.isEmpty = function(data) {
            return angular.equals({}, data);
        }
    })
