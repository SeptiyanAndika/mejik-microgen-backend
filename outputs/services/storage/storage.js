require('./utils')
const AWS = require('aws-sdk')
const { S3_ACCESS_KEY, S3_SECRET_KEY } = require('./config')

let s3 = new AWS.S3({
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
    region: 'ap-southeast-1'
})


const createBucket = ({Bucket, ACL}) =>{
    return new Promise((resolve, reject)=>{
        const bucketName = Bucket+"-"+Bucket.hexEncode()
        console.log("create bucket", bucketName)
        s3.createBucket({
            Bucket: bucketName,
        }, (err, data)=>{
            if(err){
                reject(err)
            }
        })
        resolve(bucketName)
    })
}

const uploadFile = ({buffer, key, mimeType, bucket}) => {
    return new Promise((resolve, reject)=>{
        s3.upload({
            Body: Buffer.from(buffer),
            Key: key,
            Bucket: bucket,
            ContentType: mimeType,
            ACL: 'public-read',
        }, (err, data)=>{
            if(err){
                reject(err)
            }
            resolve(data)
        })
    })
}

const deleteFile = ({ bucket, key }) => {
    return new Promise((resolve, reject)=>{
        s3.deleteObject({
            Key: key,
            Bucket: bucket,
        }, (err, data)=>{
            if(err){
                reject(err)
            }
            resolve(data)
        })
    })
}


module.exports = {
    createBucket,
    uploadFile,
    deleteFile
}