var mongoose = require('mongoose')
var RoadSchema = require('../schemas/road') //拿到导出的数据集模块
var Road = mongoose.model('Road', RoadSchema) // 编译生成Movie 模型
var AreaSchema = require('../schemas/area') //拿到导出的数据集模块
var Area = mongoose.model('Area', AreaSchema) // 编译生成Movie 模型
var fs = require('fs');
var uploadfile = require('./uploadFile') //上传文件模块
var config = require('config-lite');
let UnitSchema = require('../schemas/unit'); //拿到导出的数据集模块
let Unit = mongoose.model('Unit', UnitSchema); // 编译生成Movie 模型
module.exports = {
	findAll: function(req, res, next) {
		Road.find()
			.populate('list', '_id name')
			.populate('pid', '_id name')
			.sort({
				_id: -1
			}) //排序
			//.sort({'meta.updateAt': 'desc'})
			.exec(function(err, data) {
				if(err) {
					return next(err);
				}
				return res.status(200).json({
					result: data,
					msg: "成功",
					code: 0
				});
			});
	},
	findPidById: function(req, res, next) { //通过id找到所有父级类别
		let id = req.body.id,sid = mongoose.Types.ObjectId(id);
		Road.findOne({
				_id: sid
			})
			.populate('pid', '_id name')
			.exec(function(err, data) {
				if(err) {
					return next(err);
				}
				return res.status(200).json({
					result: data,
					msg: "成功",
					code: 0
				});
			});
	},
	findDataById: function(req, res, next) {
		let id = req.params.id;
		let sid = mongoose.Types.ObjectId(id);

		Unit.find({ roadId: sid}).exec(function(err, data) {
			if(err) {
				return next(err);
			}
			Road.findOne({
				_id: sid
			}).exec(function(err, info) {
				if(err) {
					return next(err);
				}
				return res.status(200).json({
					result: {
						data:data,
						info:info
					},
					msg: "成功",
					code: 0
				});
			});
		});
	},
	createRoad: function(req, res, next) {//新增行业类别
		let qdata = {
			name: req.body.name,
			pid: (req.body.pid && req.body.pid!=0)?mongoose.Types.ObjectId(req.body.pid):'',
			img: req.body.img
		};
		if(!qdata.name) {
			return res.status(200).json({
				result: null,
				msg: '名称不能为空',
				code: 1
			});
		}
		if(!qdata.pid) {
			return res.status(200).json({
				result: null,
				msg: '辖区不能为空',
				code: 1
			});
		}
		let a = {
			name: qdata.name
		};
		Road.findOne(a, function(err, result) {
			if(err) {
				return next(err);
			}
			if(!result) {
				var node = new Road(qdata);

				node.save(function(err) {
					if(err) {
						return next(err);
					}

					Area.update({
						list:node._id
					},{'$pull':{'list':node._id}},{ multi: true }, function(err, result) {
						if(err) {
							return next(err);
						}
						Area.update({
							_id: qdata.pid
						}, {'$addToSet':{'list':node._id}},{ multi: true }, function(err, result) {
							if(err) {
								return next(err);
							}
							return res.status(200).json({
								result: null,
								msg: '保存成功',
								code: 0
							});						
						});			
					})


				});
			} else {
				return res.status(200).json({
					result: null,
					msg: '保存失败，已存在，不能重复',
					code: 1
				});
			}
		});
	},
	getRoadUnits: function(req, res, next) {
		if(!req.body.id) {
			return res.status(200).json({
				result: null,
				msg: 'id不能为空',
				code: 1
			});
		}
		let id = mongoose.Types.ObjectId(req.body.id);
		Road.findOne({
				_id: id
			})
			.populate('list', '_id name title content number img')
			.exec(function(err, road) {
				if(err) {
					return next(err);
				}
				if(!road) {
					return next();
				}

				return res.status(200).json({
					result: road,
					msg: "成功",
					code: 0
				});
			})
	},
	modifyData: function(req, res, next) { //修改行业信息
		let qdata = {
			name: req.body.name,
			id: req.body.id,
			pid: (req.body.pid && req.body.pid!=0)?mongoose.Types.ObjectId(req.body.pid):'',
			img: req.body.img
		}; //post 是req.body
		if(!qdata.name) {
			return res.status(200).json({
				result: null,
				msg: '名称不能为空',
				code: 1
			});
		}
		if(!qdata.pid) {
			return res.status(200).json({
				result: null,
				msg: '辖区不能为空',
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
		let id = mongoose.Types.ObjectId(qdata.id);

		Road.findOne({
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
					_id: id
				};
				let newData = {
					'$set': {
						name: qdata.name,
						img: qdata.img,
						pid:qdata.pid
					}
				};
				// 多条件更新 var newData = {$set:{name:"内容",age:2}};
				Road.update(oldValue, newData, function(err, res1) {
					if(err) {
						return res.status(200).json({
							result: err,
							msg: '保存失败，已经有该标题',
							code: 0
						});
					}

					Area.update({
						list:id
					},{'$pull':{'list':id}},{ multi: true }, function(err, result) {
						if(err) {
							return next(err);
						}
						Area.update({
							_id: qdata.pid
						}, {'$addToSet':{'list':id}}, { multi: true },function(err, result) {
							if(err) {
								return next(err);
							}
							return res.status(200).json({
								result: null,
								msg: '保存成功',
								code: 0
							});						
						});				
					})
				});
			}
		});
	},
	delData: function(req, res, next) {//删除行业
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
		Road.remove(del, function(err, result) {
			if(err) {
				return res.status(200).json({
					result: result,
					msg: '删除失败，不存在该类别',
					code: 1
				});
			} else {
				return res.status(200).json({
					result: result,
					msg: "删除成功",
					code: 0
				});
			}
		});
	},
	delArea: function(req, res, next) { //删除行业类别
		let qdata = {
			id: req.body.id,
			pid: req.body.pid
		}; //post 是req.body

		if(!qdata.id || !qdata.pid) {
			return res.status(200).json({
				result: null,
				msg: '删除失败，没有该类别',
				code: 1
			});
		}
		let id = mongoose.Types.ObjectId(qdata.id);
		let pid = mongoose.Types.ObjectId(qdata.pid);
		// 要删除的条件
		var del = {
			_id: id
		};
		Road.update(del, {
			'$pull': {
				'pid': pid
			}
		}, function(err, result) {
			if(err) {
				return res.status(200).json({
					result: result,
					msg: '删除失败，不存在该类别',
					code: 1
				});
			} else {
				return res.status(200).json({
					result: result,
					msg: "删除成功",
					code: 0
				});
			}
		});
	},
	uploadFile: function(req, res, next) {
		function callback(uploadFolderName, fileName) {
			return res.status(200).json({
				result: config.server + uploadFolderName + '/' + fileName,
				msg: "上传成功",
				code: 0
			});
		}
		uploadfile.upload(req, res, next, callback);
	}
};