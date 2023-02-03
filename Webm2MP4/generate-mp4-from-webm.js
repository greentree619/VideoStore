const AWS = require("aws-sdk");
const fs = require("fs");
const { spawnSync } = require("child_process");
const doesFileExist = require("./does-file-exist");
const generateTmpFilePath = require("./generate-tmp-file-path");

const ffprobePath = "/opt/bin/ffprobe";
const ffmpegPath = "/opt/bin/ffmpeg";

const MP4_TARGET_BUCKET = "ar-meeting-result";

module.exports = async (tmpWebmPath, videoFileName) => {    
    const tmpMp4Path = await createMP4FromWebm(tmpWebmPath);
    if (doesFileExist(tmpMp4Path)) {
        const nameOfMP4ToCreate = generateNameOfMP4ToUpload(videoFileName);
        await uploadFileToS3(tmpMp4Path, nameOfMP4ToCreate);
    }
}

const generateNameOfMP4ToUpload = (videoFileName) => {
    const strippedExtension = videoFileName.replace(".webm", ".mp4");
    return strippedExtension;
};

const createMP4FromWebm = (tmpWebmPath) => {
    const tmpMP4Path = generateMP4Path();
    const ffmpegParams = createFfmpegParams(tmpWebmPath, tmpMP4Path);
    spawnSync(ffmpegPath, ffmpegParams);

    return tmpMP4Path;
};

const generateMP4Path = () => {
    const tmpMP4PathTemplate = "/tmp/mp4-{HASH}.mp4";
    const uniqueMP4Path = generateTmpFilePath(tmpMP4PathTemplate);
    return uniqueMP4Path;
};

const createFfmpegParams = (tmpWebmPath, tmpMp4Path) => {
    return [
        "-i", tmpWebmPath,
        //"-crf", 26,
        tmpMp4Path
    ];
};

const uploadFileToS3 = async (tmpMP4Path, nameOfMp4ToCreate) => {
    const contents = fs.createReadStream(tmpMP4Path);
    const uploadParams = {
        Bucket: MP4_TARGET_BUCKET,
        Key: nameOfMp4ToCreate,
        Body: contents,
        ContentType: "video/x-m4v"
    };

    const s3 = new AWS.S3();
    await s3.putObject(uploadParams).promise();
};