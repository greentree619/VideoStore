const AWS = require("aws-sdk");
const fs = require("fs");
const { spawnSync } = require("child_process");
const doesFileExist = require("./does-file-exist");
const generateTmpFilePath = require("./generate-tmp-file-path");

const ffprobePath = "/opt/bin/ffprobe";
const ffmpegPath = "/opt/bin/ffmpeg";

const MP4_TARGET_BUCKET = "video-client-upload-123456798";

module.exports = async (tmpMP4Path, tmpWAVPath, videoFileName) => {    
    const tmpMp4Path = await mergeMP4AndWav(tmpMP4Path, tmpWAVPath);
    if (doesFileExist(tmpMp4Path)) {
        const nameOfMP4ToCreate = videoFileName;
        await uploadFileToS3(tmpMp4Path, nameOfMP4ToCreate);
    }
}

const mergeMP4AndWav = (inMP4Path, inWavPath) => {
    const tmpMP4Path = generatePathWithExt("mp4");
    const ffmpegParams = createFfmpegParams(inMP4Path, inWavPath, tmpMP4Path);
    spawnSync(ffmpegPath, ffmpegParams);

    return tmpMP4Path;
};

const generatePathWithExt = (ext) => {
    const tmpMP4PathTemplate = "/tmp/tmp-{HASH}." + ext;
    const uniqueMP4Path = generateTmpFilePath(tmpMP4PathTemplate);
    return uniqueMP4Path;
};

const createFfmpegParams = (inMP4Path, inWAVPath, tmpMp4Path) => {
    return [
        "-y",
        "-i", inMP4Path,
        "-i", inWAVPath,
        "-c:v", "copy",
        "-c:a", "aac",
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