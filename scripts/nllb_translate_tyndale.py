import requests
import json
import sys
import os
import time
import re

usage = "USAGE: python nllb_translate_tyndale.py <inPath> <outPath>"
if len(sys.argv) != 3:
    raise Exception(usage)
inPath = sys.argv[1]
if not(os.path.exists(inPath)):
    raise Exception("Input path {0} does not exist\n{1}".format(inPath, usage))
outPath = sys.argv[2]
if os.path.exists(outPath):
    raise Exception("Output path {0} already exists\n{1}".format(outPath, usage))

url = 'http://192.168.1.66:6060/translate'

def splitIntoSentences(txt):
    markedTxt = re.sub("([^.]\\. )", "\\1<<>>", txt)
    return markedTxt.split("<<>>")

outputLines = []
with open(os.path.abspath(inPath), 'r') as f:
    lineNo = 0
    for line in f.readlines():
        cells = line.split('\t')
        if not(cells[0].split(' ')[0] == 'JON'):
            continue
        if True or lineNo % 10 == 0:
            print(lineNo)
        transTxts = []
        for srcSentence in splitIntoSentences(cells[3]):
            args = {
                'source': srcSentence,
                'src_lang': "eng",
                'tgt_lang': "arb_Arab"
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
                    sys.stderr.write("Response code {0} from nllb-serve at input line {1} - skipping\n".format(response.status_code, lineNo))
            else:
                srcText = json.loads(response.text)['translation'][0]
                transTxts.append(srcText)
        cells[3] = ''.join(transTxts)
        outputLines.append('\t'.join(cells))
        lineNo += 1

with open(os.path.abspath(outPath), "w") as f:
    f.write('\n'.join(outputLines))
