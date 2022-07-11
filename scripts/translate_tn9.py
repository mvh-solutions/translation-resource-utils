import requests
import re
import json
import sys
import os

usage = "USAGE: python translate_tn9.py <lang> <credsPath> <inPath> <outPath>"
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
if os.path.exists(outPath):
    raise Exception("Output path {0} already exists\n{1}".format(outPath, usage))

with open(os.path.abspath(credsPath), 'r') as f:
    credsString = ''.join(f.readlines())
    auth_key = json.loads(credsString)['deepLAuthKey']

url = 'https://api.deepl.com/v2/translate'

outputLines = []
with open(os.path.abspath(inPath), 'r') as f:
    lineNo = 0
    linkRegex = r'\[\[.*?\]\]'
    for line in f.readlines():
        cells = line.split('\t')
        if lineNo > 0:
            srcText = cells[8]
            matches = re.findall(linkRegex, srcText)
            matchIndex = 0
            for match in matches:
                matchRegex = re.escape(match)
                srcText = re.sub(matchRegex, "[[{0}]]".format(matchIndex), srcText, 1)
                matchIndex += 1
            args = {
                'auth_key': auth_key,
                'text': srcText,
                'target_lang': lang
            }
            response = requests.post(url, data=args)
            if response.status_code != 200:
                sys.stderr.write("Response code {0} from deepL at input line {1} - skipping\n".format(response.status_code, lineNo))
            else:
                srcText = json.loads(response.text)['translations'][0]['text']
                matchIndex = 0
                for match in matches:
                    matchRegex = re.escape('[[') + str(matchIndex) + re.escape(']]')
                    srcText = re.sub(matchRegex, match, srcText, 1)
                    matchIndex += 1
                cells[8] = srcText
        outputLines.append('\t'.join(cells))
        lineNo += 1

with open(os.path.abspath(outPath), "w") as f:
    f.write('\n'.join(outputLines))
