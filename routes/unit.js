var express = require('express');
var mongoose = require('mongoose'); //导入mongoose模块
var router = express.Router();
var UnitModel = require('../modules/unit'); //导入模型数据模块

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a unit resource');
});

router.get('/type/all', UnitModel.findAll);//找出所有规范

router.get('/id/:id', UnitModel.findUnitById);//找出规范

router.post('/save', UnitModel.createUnit);//增加一个规范

router.post('/modify', UnitModel.modifyData);//修改一个规范

router.get('/search', UnitModel.search);//搜索规范

router.post('/del', UnitModel.delData);//删除规范

module.exports = router;