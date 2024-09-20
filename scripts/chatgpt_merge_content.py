import json
import sys
import os
import openai
import time

usage = "USAGE: python chatgpt_merge_content.py <credsPath> <inputPath> <outPath>"
if len(sys.argv) != 4:
    raise Exception(usage)
credsPath = sys.argv[1]
if not(os.path.exists(credsPath)):
    raise Exception("Path to credentials {0} does not exist\n{1}".format(credsPath, usage))
inPath = sys.argv[2]
if not(os.path.exists(inPath)):
    raise Exception("Input path {0} does not exist\n{1}".format(inPath, usage))
outPath = sys.argv[3]
if os.path.exists(outPath):
    raise Exception("Output path {0} already exists\n{1}".format(outPath, usage))

with open(os.path.abspath(credsPath), 'r') as f:
    credsString = ''.join(f.readlines())
    auth_key = json.loads(credsString)['chatGptAuthKey']

url = 'https://api.openai/v1/models'
openai.organization = "org-oDmzLM4nY8R33bwA1EyQXjjB"
openai.api_key = auth_key

with open(os.path.abspath(inPath), 'r') as inHandle:
    inputJson = json.load(inHandle)

response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are an evangelical pastor summarising Bible study notes for B1-level English speakers."},
        {"role": "system", "content": "These English speakers will use your notes to translate the Bible into a different language."},
        {"role": "user", "content": "Make a summary of the following two source notes on a Bible text."},
        {"role": "user", "content": "These source notes are formatted using markdown."},
        {"role": "user", "content": "The summary should highlight special terms in bold bold text and should highlight translations of those special terms in italics, using markdown."},
        {"role": "user", "content": "The summary should not refer to the source notes."},
        {"role": "user", "content": "The summary should be shorter than the shorter of the two source notes."},
        {"role": "user", "content": "The summary should separate comments on vocabulary, alternative translations and theology."},
        {"role": "user", "content": "The summary should only use information in the source notes."},
        {"role": "user", "content": "The summary does not need a main title or a conclusion."},
        {"role": "user", "content": "The first text is here: " + inputJson["tyndale"] + "."},
        {"role": "user", "content": "The second text is here: " + inputJson["biblica"] + "."},
        {"role": "user", "content": "Format your output using markdown."},
    ]
)
responseText = response['choices'][0]["message"]["content"]
time.sleep(5)

with open(os.path.abspath(outPath), "w") as f:
    f.write(responseText)
