var express = require('express');
var mongoose = require('mongoose'); //导入mongoose模块
var router = express.Router();
var RoadModel = require('../modules/road'); //导入模型数据模块

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a road resource');
});

router.get('/type/all', RoadModel.findAll);//找出所有类别

router.get('/id/:id', RoadModel.findDataById);//找出类别id的所有行业

router.post('/save', RoadModel.createRoad);//增加一个行业

router.get('/units', RoadModel.getRoadUnits);

router.get('/pid/:id', RoadModel.findPidById);

router.post('/del', RoadModel.delData);//删除行业

router.post('/delArea', RoadModel.delArea);//删除父级类别

router.post('/modify', RoadModel.modifyData);//修改类别名称

router.post('/upload', RoadModel.uploadFile);//上传图片

module.exports = router;

/*var gnr = new Band({
      name: "Guns N' Roses",
      members: ['Axl', 'Slash']
    });

    var promise = gnr.save();
    assert.ok(promise instanceof require('mpromise'));

    promise.then(function (doc) {
      assert.equal(doc.name, "Guns N' Roses");
    });
*/