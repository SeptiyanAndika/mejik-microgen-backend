module.exports = (app) => ({
    before: {
        find: async (context) => {
            console.log("external hook")
        },
        create: async (context) => {
            
        }
    },
    after:{
        create: async (context) => {
            let category = context.result
            let subCategory = await app.get('subCategoryRequester').send({
                type: 'store', 
                body: {
                    categoryId : category.id,
                    name : "new sub category"
                },
                headers: context.params.headers
            })
        }
    }
})