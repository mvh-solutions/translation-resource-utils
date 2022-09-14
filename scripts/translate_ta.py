import requests
import re
import json
import sys
import os
import time

usage = "USAGE: python translate_ta.py <lang> <credsPath> <inDir> <outDir>"
if len(sys.argv) != 5:
    raise Exception(usage)
lang = sys.argv[1]
credsPath = sys.argv[2]
if not(os.path.exists(credsPath)):
    raise Exception("Path to credentials {0} does not exist\n{1}".format(credsPath, usage))
inDir = sys.argv[3]
if not(os.path.exists(inDir)):
    raise Exception("Input dir {0} does not exist\n{1}".format(inDir, usage))
outDir = sys.argv[4]
#if os.path.exists(outDir):
#    raise Exception("Output dir {0} already exists\n{1}".format(outDir, usage))

with open(os.path.abspath(credsPath), 'r') as f:
    credsString = ''.join(f.readlines())
    auth_key = json.loads(credsString)['deepLAuthKey']

if not(os.path.exists(os.path.join(outDir))):
    os.makedirs(outDir)

for subdir1 in os.listdir(inDir):
    if not(os.path.isdir(os.path.join(inDir, subdir1))):
           continue
    print(subdir1)
    if not(os.path.exists(os.path.join(outDir, subdir1))):
        os.makedirs(os.path.join(outDir, subdir1))
    for fileLeaf in os.listdir(os.path.join(inDir, subdir1)):
        if os.path.exists(os.path.join(outDir, subdir1, fileLeaf)):
            print("   Skipping")
            continue
        inPath = os.path.join(inDir, subdir1, fileLeaf)
        outPath = os.path.join(outDir, subdir1, fileLeaf)

        url = 'https://api.deepl.com/v2/translate'

        output = ""
        with open(os.path.abspath(inPath), 'r') as f:
            linkRegex = r'\[\[.*?\]\]|\[[^\]]*?\]\([^\)]*?\)'
            startMarkdownRegex = r'([_*]{2})(\S)'
            endMarkdownRegex = r'(\S)([_*]{2})'
            startMarkdownRegex2 = r'([_*]{2})> (\S)'
            endMarkdownRegex2 = r'(\S) <([_*]{2})'
            lines = []
            for line in f.readlines():
                lines.append(line)
                srcText = "".join(lines)
                matches = re.findall(linkRegex, srcText)
                matchIndex = 0
            for match in matches:
                matchRegex = re.escape(match)
                srcText = re.sub(matchRegex, "[[{0}]]".format(matchIndex), srcText, 1)
                matchIndex += 1
            srcText = re.sub(endMarkdownRegex, "\\1 <\\2", srcText)
            srcText = re.sub(startMarkdownRegex, "\\1> \\2", srcText)
            args = {
                'auth_key': auth_key,
                'text': srcText,
                'target_lang': lang
            }
            try:
                response = requests.post(url, data=args)
            except Exception:
                print('Exception: retrying')
                time.sleep(5)
                response = requests.post(url, data=args)
            if response.status_code != 200:
                print('Bad response code: retrying')
                time.sleep(5)
                response = requests.post(url, data=args)
                if response.status_code != 200:
                    sys.stderr.write("Response code {0} from deepL at input line {1}\n".format(response.status_code, lineNo))
                    sys.exit(1)
            else:
                srcText = json.loads(response.text)['translations'][0]['text']
                matchIndex = 0
                for match in matches:
                    matchRegex = re.escape('[[') + str(matchIndex) + re.escape(']]')
                    srcText = re.sub(matchRegex, match, srcText, 1)
                    matchIndex += 1
                    srcText = re.sub(endMarkdownRegex2, "\\1\\2", srcText)
                    srcText = re.sub(startMarkdownRegex2, "\\1\\2", srcText)
                    output = srcText

            with open(os.path.abspath(outPath), "w") as f:
                f.write(output)
