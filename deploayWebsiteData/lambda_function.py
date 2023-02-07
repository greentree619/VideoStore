import json
import zipfile
import urllib.parse
from io import BytesIO
from mimetypes import guess_type
import boto3

s3 = boto3.client('s3')

def lambda_handler(event, context):
    
    bucket = event['Records'][0]['s3']['bucket']['name']
    zip_key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
    dst_bucket = zip_key.split("/")[0]
    print("dst_bucket", dst_bucket)
    try:
        # Get the zipfile from S3
        obj = s3.get_object(Bucket=bucket, Key=zip_key)
        z = zipfile.ZipFile(BytesIO(obj['Body'].read()))

        # Extract and upload each file in the zipfile
        for filename in z.namelist():
            #print('content', filename)
            hasExtension = len(filename.split('/').pop().split('.')) > 1;
            content_type = guess_type(filename, strict=False)[0]
            #print('hasExtension', hasExtension, content_type)
            #args = {'ContentType': content_type}
            if content_type is None:
                if hasExtension:
                    s3.upload_fileobj(
                        Fileobj=z.open(filename),
                        Bucket=dst_bucket,
                        Key=filename
                    )
                    continue
                else:
                    continue
                
            #print('content_type', content_type, filename, hasExtension);
            s3.upload_fileobj(
                Fileobj=z.open(filename),
                Bucket=dst_bucket,
                Key=filename,
                ExtraArgs={'ContentType': content_type}
            )
    except Exception as e:
        print('Error getting object {zip_key} from bucket {bucket}.')
        raise e
        
# def lambda_handler(event, context):
#     # TODO implement
#     return {
#         'statusCode': 200,
#         'body': json.dumps('Hello from Lambda!')
#     }