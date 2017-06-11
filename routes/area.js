var express = require('express');
var mongoose = require('mongoose'); //导入mongoose模块
var router = express.Router();
var AreaModel = require('../modules/area'); //导入模型数据模块

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a area resource');
});

router.get('/type/all', AreaModel.findAll);//找出所有类别

router.get('/id/:postId', AreaModel.findDataById);//找出类别id的所有行业

router.post('/save', AreaModel.saveData);//新增类别

router.post('/modify', AreaModel.modifyData);//修改类别名称

router.post('/del', AreaModel.delData);//删除类别名称

router.get('/roads', AreaModel.getAreaRoads);

module.exports = router;