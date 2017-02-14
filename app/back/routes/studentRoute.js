const express = require('express');
const student = require('../module/student');

var studentRouter = express.Router();

studentRouter.route('/activeStudents')
    .get(function(req, res) {
        student.activeStudents(res);
    });
studentRouter.route('/getSearchedStudentList')
    .get(function(req, res) {
        var data = {};
        data.name = req.query.name;
        data.paid = req.query.paid;
        data.unpaid = req.query.unpaid;
        data.course = req.query.course;
        data.package = req.query.package;
        student.searchedStudents(res, data);
    });

studentRouter.route('/admin/insertStudent')
    .post(function(req, res) {
        var data = req.body;
        student.studentInsert(res, data);
    });
studentRouter.route('/studentPayments/:studentId')
    .get(function(req, res) {
        var studentId = req.params.studentId;
        student.studentPayments(res, studentId);
    });
studentRouter.route('/admin/updateStudentPayment/:studentId')
    .post(function(req, res) {
        var studentId = req.params.studentId;
        var data = req.body;
        student.studentPaymentUpdate(res, studentId, data);
    });
studentRouter.route('/studentsPayment')
    .post(function(req, res) {
        var data = req.body;
        student.studentPaymentInsert(res, data);
    });

studentRouter.route('/getConfigs')
    .get(function(req, res) {
        student.getConfigs(res);
    });

studentRouter.route('/admin/setBeginningDate')
    .post(function(req, res) {
        var data = req.body;
        student.setBeginningDate(res, data);
    });

module.exports = studentRouter;
