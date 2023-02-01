const AWS = require("aws-sdk");

AWS.config.update({ 
        accessKeyId: 'AKIAUG22JIQEI4J44HP7',
        secretAccessKey: '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',
        region: 'us-east-2',
        signatureVersion: 'v4'
    });

exports.handler = async (event, context) => {
    // TODO implement
    let body = JSON.parse( event.body );
    //console.log(body.keyPath);
    
    const keyPath = body.keyPath;
    const params = {
        Bucket: 'video-client-upload-123456798',
        Key: `${keyPath}`,
    };
    
    const s3 = new AWS.S3({region: "us-east-2"});
    const signedUrlExpireSeconds = 60 * 2;
    //console.log("test", params);
    const url = s3.getSignedUrl('getObject', {
        Bucket: params.Bucket,
        Key: params.Key,
        Expires: signedUrlExpireSeconds
    });
    
    return url;
};
