import requests
import json
import sys
import os

usage = "USAGE: python deepl_translate_html.py <lang> <credsPath> <inPath> <outPath>"
if len(sys.argv) != 5:
    raise Exception(usage)
lang = sys.argv[1]
credsPath = sys.argv[2]
if not(os.path.exists(credsPath)):
    raise Exception("Path to credentials {0} does not exist\n{1}".format(credsPath, usage))
inPath = sys.argv[3]
if not(os.path.exists(inPath)):
    raise Exception("Input path {0} does not exist\n{1}".format(inPath, usage))
outPath = sys.argv[4]

with open(os.path.abspath(credsPath), 'r') as f:
    credsString = ''.join(f.readlines())
    auth_key = json.loads(credsString)['deepLAuthKey']

url = 'https://api.deepl.com/v2/translate'

outputLines = []
with open(os.path.abspath(inPath), 'r') as f:
    srcHtml = '\n'.join(f.readlines())
    args = {
        'auth_key': auth_key,
        'text': srcHtml,
        'target_lang': lang,
        'formality': 'less',
        'tag_handling': "xml",
        'split_sentences': "nonewlines"
    }
    response = requests.post(url, data=args)
    responseHtml = json.loads(response.text)["translations"][0]["text"]
    with open(os.path.abspath(outPath), 'w') as f2:
        f2.write(responseHtml)
