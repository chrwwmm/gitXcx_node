﻿var mongoose = require('mongoose')
var AreaSchema = require('../schemas/area') //拿到导出的数据集模块
var Area = mongoose.model('Area', AreaSchema) // 编译生成Movie 模型
var RoadSchema = require('../schemas/road') //拿到导出的数据集模块
var Road = mongoose.model('Road', RoadSchema) // 编译生成Movie 模型
module.exports = {
	findAll: function(req, res, next) {
		Area.find({
				status: {
					$ne: "1"
				}
			})
			.sort('meta.updateAt') //排序
			.populate('list', '_id name img')
			.exec(function(err, data) {
				if(err) {
					next(err);
				}
				
				return res.status(200).json({
					result: data,
					msg: "成功",
					code: 0
				});
			});
	},
	findDataById: function(req, res, next) {
		var id = req.params.postId;
		var sid = mongoose.Types.ObjectId(id);
		Area.findOne({
				_id: sid
			})
			.exec(function(err, data) {
				if(err) {
					next(err);
				}
				return res.status(200).json({
					result: data,
					msg: "成功",
					code: 0
				});
			});
	},
	saveData: function(req, res, next) { //新增类别
		var qdata = {
			name: req.body.name
		}; //post 是req.body
		console.log(req);
		if(!qdata.name) {
			return res.status(200).json({
				result: null,
				msg: '名称不能为空',
				code: 1
			});
		}
		Area.findOne(qdata, function(err, result) {
			if(err) {
				next(err);
			}
			if(!result) {
				var node = new Area(qdata);
				node.save(function(err) {
					if(err) {
						return res.status(500).json({
							result: null,
							msg: '保存失败',
							code: 1
						});
					}
					return res.status(200).json({
						result: null,
						msg: '保存成功',
						code: 0
					});
				});
			} else {
				return res.status(500).json({
					result: null,
					msg: '保存失败，已存在，不能重复',
					code: 1
				});
			}
		});
	},
	modifyData: function(req, res, next) { //修改类别
		let qdata = {
			name: req.body.name,
			id: req.body.id
		}; //post 是req.body
		let id = mongoose.Types.ObjectId(qdata.id);

		if(!qdata.name) {
			return res.status(200).json({
				result: null,
				msg: '名称不能为空',
				code: 1
			});
		}
		if(!qdata.id) {
			return res.status(200).json({
				result: null,
				msg: '保存失败，没有该类别',
				code: 1
			});
		}
		Area.findOne({
			_id: id
		}, function(err, result) {
			if(err) {
				return next(err);
			}
			if(!result) {
				return res.status(200).json({
					result: null,
					msg: '保存失败，不存在该类别',
					code: 1
				});
			} else {
				let oldValue = {
					name: result.name
				};
				// 单条件更新
				let newData = {
					$set: {
						name: qdata.name
					}
				};
				// 多条件更新 var newData = {$set:{name:"内容",age:2}};
				Area.update(oldValue, newData, function(err, result) {
					if(err) {
						return next(err);
					} else {
						return res.status(200).json({
							result: result,
							msg: "成功",
							code: 0
						});
					}
				})
			}
		});
	},
	delData: function(req, res, next) { //删除类别
		let qdata = {
			id: req.body.id
		}; //post 是req.body
		let id = mongoose.Types.ObjectId(qdata.id);

		if(!qdata.id) {
			return res.status(200).json({
				result: null,
				msg: '删除失败，没有该类别',
				code: 1
			});
		}
		// 要删除的条件
		var del = {
			_id: id
		};
		Area.findOne(del, function(err, result) {
			if(err) {
				return next(err);
			}
			if(!result) {
				return res.status(200).json({
					result: null,
					msg: '删除失败，不存在该类别',
					code: 1
				});
			} else {
				Area.remove(del, function(err, result) {
					if(err) {
						return next(err);
					} else {
						return res.status(200).json({
							result: result,
							msg: "删除成功",
							code: 0
						});
					}
				})
			}
		});
	},
	getAreaRoads: function(req, res, next) {
		Area.findOne({
			name: req.query.name
		}, function(err, area) {
			if(err) {
				return next(err);
			}
			if(!area) {
				return next();
			}

			return res.status(200).json({
				result: area,
				msg: "成功",
				code: 0
			});
		})
	}
};