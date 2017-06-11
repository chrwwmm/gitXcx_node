let mongoose = require('mongoose');
let IndustrySchema = require('../schemas/industry'); //拿到导出的数据集模块
let Industry = mongoose.model('Industry', IndustrySchema); // 编译生成Movie模型
let ThemeSchema = require('../schemas/theme'); //拿到导出的数据集模块
let Theme = mongoose.model('Theme', ThemeSchema); // 编译生成Movie 模型
let NormSchema = require('../schemas/norm'); //拿到导出的数据集模块
let Norm = mongoose.model('Norm', NormSchema); // 编译生成Movie 模型

module.exports = {
	findAll: function(req, res, next) {
		Norm.find()
			.populate('industryIds', '_id name')
			.populate('themeIds', '_id name')
			.sort({
				_id: -1
			}) //排序
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
	findNormById: function(req, res, next) {
		Norm.findOne({
				_id: req.params.id
			})
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
	createNorm: function(req, res, next) {
		let themeList = req.body.themeList ? req.body.themeList : [],
			industryList = req.body.industryList ? req.body.industryList : [];
		let qdata = {
			title: req.body.title,
			number: req.body.number,
			content: req.body.content,
			img: req.body.img,
			industryIds: [],
			themeIds: []
		};
		if(!qdata.title) {
			return res.status(200).json({
				result: '',
				msg: "标题不能为空",
				code: 1
			});
		}
		if(!qdata.content) {
			return res.status(200).json({
				result: '',
				msg: "内容不能为空",
				code: 1
			});
		}

		if(themeList.length > 0) {
			for(var i = 0, len = themeList.length; i < len; i++) {
				if(themeList[i] && themeList[i] != '0')
					qdata.themeIds.push(mongoose.Types.ObjectId(themeList[i]));
			}
		}
		if(industryList.length > 0) {
			for(var i = 0, len = industryList.length; i < len; i++) {
				if(industryList[i] && industryList[i] != '0')
					qdata.industryIds.push(mongoose.Types.ObjectId(industryList[i]));
			}
		}

		Norm.findOne({
			title: qdata.title
		}, function(err, result) {
			if(err) {
				return next(err);
			}
			if(!result) {
				var node = new Norm(qdata);

				node.save(function(err) {
					if(err) {
						return next(err);
					}

					Industry.update({
						list: node._id
					}, {
						'$pull': {
							'list': node._id
						}
					}, {
						multi: true
					}, function(err, result) {
						if(err) {
							return next(err);
						}
						Industry.update({
								_id: {
									'$in': qdata.industryIds
								}
							}, {
								'$addToSet': {
									'list': node._id
								}
							}, {
								multi: true
							},
							function(err, re) {
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

				})
			} else {
				return res.status(200).json({
					result: null,
					msg: '保存失败，已存在，不能重复',
					code: 1
				});
			}
		})
	},
	modifyData: function(req, res, next) { //修改name: id:id,img:img
		let themeList = req.body.themeList ? req.body.themeList : [],
			industryList = req.body.industryList ? req.body.industryList : [];
		let qdata = {
			title: req.body.title,
			id: req.body.id,
			img: req.body.img,
			number: req.body.number,
			content: req.body.content,
			industryIds: [],
			themeIds: []
		}; //post 是req.body

		if(!qdata.title) {
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

		if(themeList.length > 0) {
			for(var i = 0, len = themeList.length; i < len; i++) {
				if(themeList[i] && themeList[i] != '0')
					qdata.themeIds.push(mongoose.Types.ObjectId(themeList[i]));
			}
		}
		if(industryList.length > 0) {
			for(var i = 0, len = industryList.length; i < len; i++) {
				if(industryList[i] && industryList[i] != '0')
					qdata.industryIds.push(mongoose.Types.ObjectId(industryList[i]));
			}
		}

		Norm.findOne({
			_id: qdata.id
		}, function(err, result) {
			if(err) {
				return next(err);
			}
			let oldValue = {
				_id: qdata.id
			};
			let newData = {
				'$set': qdata
			};
			Norm.update(oldValue, newData, function(err, res1) {
				if(err) {
					return next(err);
				}

				Industry.update({
					list: qdata.id
				}, {
					'$pull': {
						'list': qdata.id
					}
				}, {
					multi: true
				}, function(err, result) {
					if(err) {
						return next(err);
					}
					Industry.update({
							_id: {
								'$in': qdata.industryIds
							}
						}, {
							'$addToSet': {
								'list': qdata.id
							}
						}, {
							multi: true
						},
						function(err, re) {
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

			})
		})
	},
	search: function(req, res, next) {
		let val = req.query.value;
		console.log(val);
		var pageSize = 10; //一页多少条
		var currentPage = 1; //当前第几页
		var sort = {
			'_id': -1
		}; //排序（按登录时间倒序）
		var condition = {}; //条件
		var skipnum = (currentPage - 1) * pageSize; //跳过数
		var where = 'this.title.indexOf("' + val + '")>-1 || this.content.indexOf("' + val + '")>-1';

		if(req.query.pid) {
			condition = {
				industryIds: req.query.pid
			};
		}

		Norm.find(condition)
			.populate('industryIds', '_id name')
			.populate('themeIds', '_id name')
			.$where(where).skip(skipnum).limit(pageSize).sort(sort).exec(function(err, data) {
				if(err) {
					return next(err);
				}
				return res.status(200).json({
					result: data,
					msg: "成功",
					code: 0
				});
			})
	},
	delData: function(req, res, next) { //删除行业
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
		Norm.remove(del, function(err, result) {
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
	}
	/*var User = require("./user.js");
	function getByPager(){
	    
	    var pageSize = 5;                   //一页多少条
	    var currentPage = 1;                //当前第几页
	    var sort = {'logindate':-1};        //排序（按登录时间倒序）
	    var condition = {};                 //条件
	    var skipnum = (currentPage - 1) * pageSize;   //跳过数
	    
	    User.find(condition).skip(skipnum).limit(pageSize).sort(sort).exec(function (err, res) {
	        if (err) {
	            console.log("Error:" + err);
	        }
	        else {
	            console.log("Res:" + res);
	        }
	    })
	}
	getByPager();
	mongoexport -d test -c themes -o file.json --type json -f field
	* */

};