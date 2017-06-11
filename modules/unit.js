let mongoose = require('mongoose');
let RoadSchema = require('../schemas/road'); //拿到导出的数据集模块
let Road = mongoose.model('Road', RoadSchema); // 编译生成Movie模型
let AreaSchema = require('../schemas/area'); //拿到导出的数据集模块
let Area = mongoose.model('Area', AreaSchema); // 编译生成Movie 模型
let UnitSchema = require('../schemas/unit'); //拿到导出的数据集模块
let Unit = mongoose.model('Unit', UnitSchema); // 编译生成Movie 模型

module.exports = {
		findAll: function(req, res, next) {
			Unit.find()
				.populate('roadId', '_id name')
				.populate('areaId', '_id name')
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
		findUnitById: function(req, res, next) {
			Unit.findOne({
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
		createUnit: function(req, res, next) {
			let roadId = req.body.roadid ? req.body.roadid : '';
			let qdata = {
				title: req.body.title,
				number: req.body.number,
				content: req.body.content,
				roadId: roadId ? mongoose.Types.ObjectId(roadId) : '',
				declaration: req.body.declaration, //申报主体
				planArea: req.body.planArea, //拟拆除重建用地面积
				publicArea: req.body.publicArea, //公共利益面积
				remark: req.body.remark, //备注
				proportion: req.body.proportion, //比例
				date: req.body.date //时间
			};
			if(!qdata.title) {
				return res.status(200).json({
					result: '',
					msg: "标题不能为空",
					code: 1
				});
			}
			if(!qdata.roadId) {
				return res.status(200).json({
					result: '',
					msg: "街道不能为空",
					code: 1
				});
			}

			Road.findOne({//找到街道的辖区id
						_id: qdata.roadId
					}, function(err, roadData) {
						if(err) {
							return next(err);
						}
						qdata.areaId = roadData.pid;
					});

					Unit.findOne({
						title: qdata.title
					}, function(err, result) {
						if(err) {
							return next(err);
						}
						if(!result) {
							var node = new Unit(qdata);

							node.save(function(err) {
								if(err) {
									return next(err);
								}

								Road.update({
									list: node._id
								},{'$pull':{'list':node._id}},{ multi: true }, function(err, result) {
									if(err) {
										return next(err);
									}
									Road.update({
										_id: qdata.roadId
									}, {
										'$addToSet': {
											'list': node._id
										}
									}, function(err, re) {
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
					let roadId = req.body.roadid ? req.body.roadid : '';
					let qdata = {
						id: req.body.id,
						title: req.body.title,
						img: req.body.img,
						content: req.body.content,
						roadId: roadId ? mongoose.Types.ObjectId(roadId) : '',
						declaration: req.body.declaration, //申报主体
						planArea: req.body.planArea, //拟拆除重建用地面积
						publicArea: req.body.publicArea, //公共利益面积
						remark: req.body.remark, //备注
						proportion: req.body.proportion, //比例
						date: req.body.date //时间
					};

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
					if(!qdata.roadId) {
						return res.status(200).json({
							result: '',
							msg: "街道不能为空",
							code: 1
						});
					}
					
					Road.findOne({//找到街道的辖区id
						_id: qdata.roadId
					}, function(err, roadData) {
						if(err) {
							return next(err);
						}
						qdata.areaId = roadData.pid;
					});
					
					Unit.findOne({
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
						Unit.update(oldValue, newData, function(err, res1) {
							if(err) {
								return next(err);
							}

							Road.update({
								list:qdata.id
							},{'$pull':{'list':qdata.id}},{ multi: true }, function(err, result) {
								if(err) {
									return next(err);
								}
								Road.update({
									_id: qdata.roadId
								}, {
									'$addToSet': {
										'list': qdata.id
									}
								}, function(err, re) {
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
					var pageSize = 10; //一页多少条
					var currentPage = 1; //当前第几页
					var sort = {
						'_id': -1
					}; //排序（按登录时间倒序）
					var condition = {}; //条件
					var skipnum = (currentPage - 1) * pageSize; //跳过数
					var where = 'this.title.indexOf("' + val + '")>-1';

					if(req.query.pid) {
						condition = {
							roadId: req.query.pid
						};
					}

					Unit.find(condition)
					.populate('roadId', '_id name')
					.populate('areaId', '_id name')
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
					Unit.remove(del, function(err, result) {
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
			mongoexport -d test -c areas -o file.json --type json -f field
			* */

		};