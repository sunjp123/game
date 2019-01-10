const CategoryDb = require('../database/category');
const User = require('./user')
module.exports =  class Category {
     static async save({name,belong,publicFlag,shareFlag}){
		 let category = new CategoryDb({
			name,
			belong,
			publicFlag,
			shareFlag
		 })
		 return await category.save()
	 }
	 static async findCategory(condition={},opts={}){
		return await CategoryDb.find(condition,opts)
	 }
	 static async find(condition={},opts={}){
		const res = await CategoryDb.find(condition,opts).populate({
			path:'children',
			populate: {
				path: 'author',
				select: '-password -name -email -phone',
				model: 'User'
			}
		}).exec()
		return res;
	 }
	 static async findById(_id){
		return await CategoryDb.findById(_id)
	 }
	 static async delete(condition){
		 return await CategoryDb.deleteOne(condition)
	 }
	 static async deleteItem(_id,_item){
		 return await CategoryDb.update({_id},{$pull:{children:{$in:[_item]}}})
	 }
}
