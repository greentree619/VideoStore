const AWS = require('aws-sdk');
const sharp = require('sharp');
const path = require('path');

const s3 = new AWS.S3();
var THUMBNAIL_MAX_WIDTH  = 200;
var THUMBNAIL_MAX_HEIGHT = 200;

exports.handler = async (event, context) => {
  try {
    console.log("source bueckt info:", event.Records[0].s3);
    console.log("source bueckt info:", event.Records[0].s3.bucket.name, event.Records[0].s3.object.key);
    const sourceBucket = event.Records[0].s3.bucket.name;
    const sourceKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const destinationBucket = "perfectself-avatar-thumb-bucket";
    const destinationKey = `${sourceKey}`;

    console.log("file name: ", destinationKey);

    // Fetch the image from the source S3 bucket
    const params = {
      Bucket: sourceBucket,
      Key: sourceKey
    };
    const imageObject = await s3.getObject(params).promise();

    // Generate the thumbnail using sharp library
    const metadata = await await sharp(imageObject.Body).metadata();
    var scalingFactor = Math.min(
        THUMBNAIL_MAX_WIDTH/metadata.width,
        THUMBNAIL_MAX_HEIGHT/metadata.height
    );
    var width  = parseInt(scalingFactor*metadata.width, 10);
    var height = parseInt(scalingFactor*metadata.height, 10);
    
    const thumbnailBuffer = await sharp(imageObject.Body)
      .resize(width, height)
      .toBuffer();

    // Save the thumbnail to the destination S3 bucket
    const uploadParams = {
      Bucket: destinationBucket,
      Key: destinationKey,
      Body: thumbnailBuffer
    };
    await s3.upload(uploadParams).promise();

    console.log('Thumbnail generated and saved successfully');
  } catch (error) {
    console.error('Error generating thumbnail:', error);
  }
};

// exports.handler = async (event) => {
//     // TODO implement
//     const response = {
//         statusCode: 200,
//         body: JSON.stringify('Hello from Lambda!'),
//     };
//     return response;
// };

const getThumbnailObjKey = orgKey => {
    var ext = path.parse(orgKey).ext
    //console.log("getThumbnailObjKey", orgKey, ext);
    var file = path.basename(orgKey,ext);
    var prefixPath = path.parse(orgKey).dir;
    return prefixPath + "/" + file + "_thumb" + ext;
 };
