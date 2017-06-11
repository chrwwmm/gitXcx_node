let mongoose = require('mongoose');
let db = require('../lib/db');
let Schema = mongoose.Schema;

//申明一个mongoons对象
var RoadSchema = new mongoose.Schema({
	name: {
		type: String,
		default: '',
		trim: true,
		unique: true
	},
	pid: {
		type: Schema.ObjectId,
		ref: 'Area'
	},//父类别id
	img : {
		type: String,
		default: ''
	},
	list: [{
		type: Schema.ObjectId,
		ref: 'Unit'
	}],
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
RoadSchema.pre('save', function(next) {
	console.log('一次save');
	if(this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next();
})

//暴露出去的方法
module.exports = RoadSchema;