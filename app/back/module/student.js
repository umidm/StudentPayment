var configData = require('../config/config.js');
var Datastore = require('nedb');
const uuidV4 = require('uuid/v4');
var students = new Datastore({
    filename: __dirname + './../config/db.json',
    autoload: true,
    corruptAlertThreshold: 1
});
var config = new Datastore({
    filename: __dirname + './../config/config.json',
    autoload: true,
    corruptAlertThreshold: 1
});
var Student = {};
Student.activeStudents = function(res) {
    students.find({}, {
        "info": 1,
        "paymentInfo": 1
    }, function(err, docs) {
        var response = {};
        response.students = docs;
        res.json(response);
    });
};
Student.searchedStudents = function(res, data) {
    var a = parseInt(data.unpaid);
    students.find({
        "paymentInfo.sumOfUnPaids": {
            $gt: a
        }
    }, {
        "info": 1,
        "paymentInfo": 1
    }, function(err, docs) {
        var response = {};
        response.students = docs;
        res.json(response);
    });
};
Student.studentInsert = function(res, data) {
    students.insert(data, function(err, doc) {
        console.log('Saved student:', doc.info.name);
        res.json(doc);
    });
};
Student.studentPayments = function(res, studentId) {
    students.findOne({
        "_id": studentId
    }, {
        "info": 1,
        "paymentInfo": 1,
        "payments": 1
    }, function(err, docs) {
        var response = {};
        response.student = docs;
        res.json(response);
    });
};
var searchQuery = function(data) {
    var query = {};
    var info = {};
    var paymentInfo = {};

    if (data) {
        if (data.name && data.name != 'undefined') {
            info.name = '/' + data.name + '/';
        };
        if (data.course && data.course != 'undefined') {
            info.course = data.course;
        };
        if (data.package && data.package != 'undefined') {
            info.package = data.package;
        };
        if (data.paid && data.paid != 'undefined') {
            paymentInfo.sumOfPaids = {};
            var $gte = data.paid;
            paymentInfo.sumOfPaids.$gte = $gte;
        };
        if (data.unpaid && data.unpaid != 'undefined') {
            paymentInfo.sumOfUnPaids = {};
            var $gte = data.unpaid;
            paymentInfo.sumOfUnPaids.$gte = $gte;
        }
    }
    query.info = info;
    query.paymentInfo = paymentInfo;
    return query;
};
Student.studentPaymentInsert = function(res, data) {
    var date = data.currentStartedDate;
    var response = [];
    students.find({}, {
        "info": 1,
        "paymentInfo": 1
    }, function(err, docs) {
        var size = docs.length;
        var i = 0;
        docs.forEach(function(doc) {
            i = i + 1;
            var studentId = doc._id;
            var payment = {};
            payment._id = uuidV4();
            payment.paid = 0;
            payment.paidDate = date;
            payment.paidPackage = 0;
            payment.fullPaid = false;
            payment.shouldPaid = doc.paymentInfo.monthlyPayment;
            students.update({
                "_id": studentId
            }, {
                $push: {
                    payments: payment
                }
            }, {}, function(err, doc1) {
                var paymentInfo = getPaymentInfo(studentId);
                students.update({
                    "_id": studentId
                }, {
                    $set: {
                        paymentInfo: paymentInfo
                    }
                }, {}, function(err, doc2) {
                    if (size === i) {

                    }
                });
            });
        });
        Student.setDateConfig(res, data);
    });
};
Student.testaa = function(res, studentId, payment) {
    students.update({
        _id: studentId
    }, {
        $pull: {
            payments: {
                _id: payment._id
            }
        },
        $push: {
            payments: payment
        }
    }, {}, function(err, doc) {

        var paymentInfo = getPaymentInfo(studentId);
        students.update({
            "_id": studentId
        }, {
            $set: {
                paymentInfo: paymentInfo
            }
        }, {}, function(err, doc) {
            var response = {};
            response.payment = doc;
            res.json(response);
        });
    });
};
Student.studentPaymentUpdate = function(res, studentId, payment) {
    students.update({
        _id: studentId
    }, {
        $pull: {
            payments: {
                _id: payment._id
            }
        },
        $push: {
            payments: payment
        }
    }, {}, function(err, doc) {

        var paymentInfo = getPaymentInfo(studentId);
        students.update({
            "_id": studentId
        }, {
            $set: {
                paymentInfo: paymentInfo
            }
        }, {}, function(err, doc) {
            var response = {};
            response.payment = doc;
            res.json(response);
        });
    });
};
var getPaymentInfo = function(studentId) {
    var result = {};
    result.sumOfPaids = 0;
    result.sumOfUnPaids = 0;
    students.findOne({
        "_id": studentId
    }, {
        "payments": 1,
        "paymentInfo": 1
    }, function(err, docs) {
        var payments = {};
        payments = docs.payments;

        var max = payments[0].lastPaymentDate;
        payments.forEach(function(payment) {
            if (payment.lastPaymentDate > max) {
                max = payment.lastPaymentDate;
            }
            result.sumOfPaids = result.sumOfPaids + payment.paid;
            if (!payment.fullPaid) {
                result.sumOfUnPaids = result.sumOfUnPaids + payment.shouldPaid;
            }
        });
        result.monthlyPayment = docs.paymentInfo.monthlyPayment;
        result.lastPaymentDate = max;
    });
    return result;
};

Student.getConfigs = function(res) {
    config.findOne({}, {}, function(err, doc) {
        var response = {};
        response.config = configData;
        response.dateConfig = doc;
        res.json(response);
    });
};
Student.setDateConfig = function(res, data) {
    var currentStartedDate = data.currentStartedDate;
    var updatedDate = new Date(currentStartedDate);
    updatedDate.setMonth(updatedDate.getMonth() + 1);
    var newCurrentStartedDate = updatedDate.toISOString();
    config.update({
        "_id": 'GgjF05icaIs6PCr3'
    }, {
        $set: {
            "dateConfig.currentStartedDate": newCurrentStartedDate,
            "dateConfig.lastStartedDate": currentStartedDate
        }
    }, {}, function(err, doc) {
        var response = {};
        response.doc = doc;
        res.json(response);
    });

};
Student.setBeginningDate = function(res, data) {
    var currentStartedDate = data.activeConfigDate;
    config.update({
        "_id": 'GgjF05icaIs6PCr3'
    }, {
        $set: {
            "dateConfig.currentStartedDate": currentStartedDate,
            "dateConfig.lastStartedDate": null
        }
    }, {}, function(err, doc) {
        var response = {};
        response.doc = doc;
        res.json(response);
    });

};
module.exports = Student;
