const fs = require("fs");
const AWS = require("aws-sdk");
const generateTmpFilePath = require("./generate-tmp-file-path");

module.exports = async(triggerBucketName, videoFileName, ext) => {
    const downloadResult = await getVideoFromS3(triggerBucketName, videoFileName);
	const videoAsBuffer = downloadResult.Body;
	const tmpVideoFilePath = await saveFileToTmpDirectory(videoAsBuffer, ext);
	return tmpVideoFilePath;
}

const getVideoFromS3 = async (triggerBucketName, fileName) => {
    const s3 = new AWS.S3({region: "us-east-2"});
	const res = await s3.getObject({
		Bucket: triggerBucketName,
		Key: fileName
	}).promise();

	return res;
}

const saveFileToTmpDirectory = async (fileAsBuffer, ext) => {
    const tmpVideoPathTemplate = "/tmp/vid-{HASH}." + ext;
    const tmpVideoFilePath = generateTmpFilePath(tmpVideoPathTemplate);
	await fs.promises.writeFile(tmpVideoFilePath, fileAsBuffer, "base64");
	return tmpVideoFilePath;
};