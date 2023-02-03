const fs = require("fs");
const path = require("path");
const doesFileExist = require("./does-file-exist");
const downloadVideoToTmpDirectory = require("./download-video-to-tmp-directory");
const mergeMP4andWAV = require("./merge-mp4-and-wav");

exports.handler = async (event) => {
    await wipeTmpDirectory();
	const { videoFileName, triggerBucketName } = extractParams(event);
	const wavFileName = videoFileName.replace(".mp4", ".wav");
	//console.log("Debug=>", videoFileName, wavFileName);

	const tmpVideoPath = await downloadVideoToTmpDirectory(triggerBucketName, videoFileName, "mp4");
	const tmpWAVPath = await downloadVideoToTmpDirectory(triggerBucketName, wavFileName, "wav");	

	if (doesFileExist(tmpVideoPath) && doesFileExist(tmpWAVPath)) {
		await mergeMP4andWAV(tmpVideoPath, tmpWAVPath, videoFileName);
	}

	const response = {
        statusCode: 200,
        body: JSON.stringify({key:videoFileName}),
    };
    return response;
};

const extractParams = event => {
	const videoFileName = decodeURIComponent(event.Records[0].s3.object.key).replace(/\+/g, " ");
	const triggerBucketName = event.Records[0].s3.bucket.name;

	return { videoFileName, triggerBucketName };
};

const wipeTmpDirectory = async () => {
    const files = await fs.promises.readdir("/tmp/");
    const filePaths = files.map(file => path.join("/tmp/", file));
    await Promise.all(filePaths.map(file => fs.promises.unlink(file)));
}