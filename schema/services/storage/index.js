const AWS = require('aws-sdk')
AWS.config.update({ region: 'ap-southeast-1	' })

let s3 = new AWS.S3({apiVersion: '2006-03-01'})

const createBucket = ({Bucket, ACL}) =>{
    return new Promise((resolve, reject)=>{
        s3.createBucket({
            Bucket,
            ACL
        }, (err, data)=>{
            if(err){
                reject(err)
            }else{
                resolve(data)
            }
        })
    })
}

const uploadFile = ({Bucket, Key = '', Body = '',}) => {
    return new Promise((resolve, reject)=>{
        s3.uploadFile({ Bucket, Key, Body }, (err, data)=>{
            if(err){
                reject(err)
            }else{
                resolve(data)
            }
        })
    })
}
