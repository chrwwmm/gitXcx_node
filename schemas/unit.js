let mongoose = require('mongoose');
let db = require('../lib/db');
let Schema = mongoose.Schema;

//申明一个mongoons对象
var UnitSchema = new mongoose.Schema({
	//单元名称
	title: {
		type: String,
		trim: true,
		unique: true
	},
	tag:[{
		type: String,
		trim: true,
		default: ''
	}],
	declaration: {
		type: String,
		default: ''
	},//申报主体
	roadId : {
		type: Schema.ObjectId,
		ref: 'Road'
	},//行业id
	areaId : {
		type: Schema.ObjectId,
		ref: 'Area'
	},//类别id
	planArea:{
		type: String,
		default: ''
	},//拟拆除重建用地面积
	publicArea:{
		type: String,
		default: ''
	},//公共利益面积
	remark:{
		type: String,
		default: ''
	},//备注
	proportion:{
		type: String,
		default: ''
	},//比例
	img : {
		type: String,
		default: ''
	},
	date:{//时间
		type: String, 
		default: ''
	},
	content: {
		type: String, 
		default: ''
	},
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
})

//每次执行都会调用,时间更新操作
UnitSchema.pre('save', function(next) {
	console.log('一次save');
	if(this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next();
})

//查询的静态方法
UnitSchema.statics = {
	fetch: function(cb) { //查询所有数据
		return this
			.find()
			.sort('meta.updateAt') //排序
			.exec(cb) //回调
	},
	findById: function(id, cb) { //根据id查询单条数据
		return this
			.findOne({ _id: id })
			.exec(cb)
	}
}

module.exports = UnitSchema;