import json
import sys
import os
import openai
import time

usage = "USAGE: python chatgpt_translate_tyndale.py <lang> <credsPath> <inPath> <outPath>"
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
    auth_key = json.loads(credsString)['chatGptAuthKey']

url = 'https://api.openai/v1/models'
openai.organization = "org-oDmzLM4nY8R33bwA1EyQXjjB"
openai.api_key = auth_key

outputLines = []
with open(os.path.abspath(inPath), 'r') as f:
    lineNo = 0
    linkRegex = r'\[\[.*?\]\]'
    startMarkdownRegex = r'([_*]{2})(\S)'
    endMarkdownRegex = r'(\S)([_*]{2})'
    startMarkdownRegex2 = r'([_*]{2})> (\S)'
    endMarkdownRegex2 = r'(\S) <([_*]{2})'
    for line in f.readlines():
        cells = line.split('\t')
        if lineNo > -1:
            """
            if not(cells[0].split(' ')[0] == 'JON'):
                continue
            """
            if lineNo % 10 == 0:
                print(lineNo)
            srcText = cells[3]
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages= [
                    {"role": "user", "content": 'Translate the following English text to French: "' + srcText + '"'}
                ]
            )
            srcText = response['choices'][0]["message"]["content"]
            cells[3] = srcText
        outputLines.append('\t'.join(cells))
        lineNo += 1
        time.sleep(5)

with open(os.path.abspath(outPath), "w") as f:
    f.write('\n'.join(outputLines))
