module.exports = (app) =>({
    config:{
        reSendEmail: {
            //protecting for spam request
            rateLimit:{
                limit: 1,
                duration: 60
            },
            errorMessage: (error)=>{
                if(error == "UnAuthorized"){
                    return "Authentikasi gagal."
                }
                return error
            }
        }
    },
    before: {
        find: async (context) => {
            //do something before find request
        },
        get: async (context) => {
            //do something before get request            
        },        
        create: async (context) => {
            //do something before create request
        },
        patch: async (context) => {
            //do something before patch request
        }, 
        delete: async (context) => {
            //do something before delete request
        },        
    },
})