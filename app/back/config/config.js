var config = {};
var courseConfig = {};
var packageConfig = {};
courseConfig.courses = [{
    id: 'master',
    name: "master course"
}, {
    id: 'bachelor',
    name: "bachelor course"
}];
packageConfig.packages = [{
    id: 1,
    name: "1 subject",
    price: 70
}, {
    id: 2,
    name: "2 subjects",
    price: 120
}, {
    id: 3,
    name: "3 subjects",
    price: 150
}];
config.courseConfig = courseConfig;
config.packageConfig = packageConfig;

module.exports = config;
