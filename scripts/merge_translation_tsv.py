import sys
usage = "USAGE: python merge_translation_tsv.py <bookCode> <outPath> <inPath1> <inPath1> ..."
if len(sys.argv) < 4:
    raise Exception(usage)
outRows = [["From", "To", "ID"]]
bookCode = sys.argv[1]
outPath = sys.argv[2]
inPaths = sys.argv[3:]
for inPath in inPaths:
    outRows[-1].append(inPath)
secondaryTranslations = {}
for inPath in inPaths[1:]:
    secondaryTranslations[inPath] = {}
    with open(inPath, "r") as st:
        for secondaryRow in st.readlines():
            cells = secondaryRow.split('\t')
            if len(cells) > 3:
                secondaryTranslations[inPath][cells[2]] = cells[3].strip()
with open(inPaths[0], "r") as pt:
    for primaryRow in pt.readlines():
        cells = primaryRow.split('\t')
        if not(cells[0].startswith(bookCode)):
            continue
        outRows.append([])
        outRows[-1].append(cells[0])
        outRows[-1].append(cells[1])
        outRows[-1].append(cells[2])
        outRows[-1].append(cells[3].strip())
        for secondaryTranslation in secondaryTranslations.keys():
            if secondaryTranslations[secondaryTranslation][cells[2]]:
                outRows[-1].append(secondaryTranslations[secondaryTranslation][cells[2]])
            else:
                outRows[-1].append("")
with open(outPath, "w") as outHandle:
    for outRow in outRows:
        outHandle.write("\t".join(outRow))
        outHandle.write("\n")
