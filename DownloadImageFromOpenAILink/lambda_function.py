import json
import boto3
import requests
from datetime import datetime
import random
import mimetypes

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # url = "https://i.stack.imgur.com/38FoP.jpg?s=64&g=1"  # Replace with the URL of the file you want to download
    request = json.loads(event["body"])
    url = request["url"]
    bucket_name = "article-image-bucket-live"  # Replace with your S3 bucket name
    
    # Download the file from the URL
    response = requests.get(url)
    if response.status_code == 200:
        file_content = response.content
        content_type = response.headers.get('Content-Type')
        file_extension = mimetypes.guess_extension(content_type)
        print("file_extension:", file_extension)
        
        key = get_date() +"/" + get_subkey() + f"/{generate_random_number()}{file_extension}"  # Replace with the desired key or filename in the S3 bucket
        print(key)
        
        # Save the file to S3 bucket
        s3.put_object(Body=file_content, Bucket=bucket_name, Key=key)
        
        return {
            'statusCode': 200,
            'body': {"key":key}
        }
    else:
        return {
            'statusCode': response.status_code,
            'body': {"key": ""}
        }
    # return {
    #     'statusCode': response.status_code,
    #     'body': url
    # }

def get_date():
    current_datetime = datetime.now()
    datetime_string = current_datetime.strftime("%Y-%m-%d")
    return datetime_string

def get_subkey():
    current_datetime = datetime.now()
    milliseconds = current_datetime.strftime("%f")[:-3]  # Extract milliseconds and remove trailing zeros
    datetime_string = current_datetime.strftime("%H%M%S") + f"{milliseconds}"
    return datetime_string
    
def generate_random_number():
    min_range = 1000000  # Minimum 7-digit number (inclusive)
    max_range = 9999999  # Maximum 7-digit number (inclusive)
    return random.randint(min_range, max_range)
    
# def lambda_handler(event, context):
#     # TODO implement
#     return {
#         'statusCode': 200,
#         'body': json.dumps('Hello from Lambda!')
#     }
