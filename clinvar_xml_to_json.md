1. replace "@" in file to "_____", because when transforming xml to json, fileds name will automatically add a "@" at left(e.g. Type -> @Type)
```
sed "s/@/_____/g" /Users/lix2/Downloads/xml-to-json-master/ClinVarVariation_original.xml > ClinVarVariation_lodash.xml
```

2. Run python script. Read line by line, find start and end of a variant (find "<VariationArchive" and "</VariationArchive"), convert to json, append into file. Each line of result file is a variant.
```
python test.py
```
script:
```
# Python 3 only

# import modules we'll need 
from xmljson import badgerfish as bf
from xmljson import parker as pk
from xml.etree.ElementTree import fromstring
import xml.etree.ElementTree as ET
import json
import glob
# from xml.dom import minidom

# for each .xml file...
count = 1
print(glob.glob('*.xml'))
for file in glob.glob('*.xml'):
    # # get file name
    # # print(file)
    # tree = ET.parse(file)
    # root = tree.getroot()
    # for variation in root.findall('VariationArchive'):
    #     mydata = ET.tostring(variation)
    #     # print(mydata)
    #     file_name = str(count) + ".xml"
    #     print(file_name)
    #     with open(file_name,"wb") as newFile:
    #         newFile.write(mydata)
    #     count = count + 1

    # mydoc = minidom.parse(file)
    # items = mydoc.getElementsByTagName('VariationArchive')
    # print(len(items))
    name = str.split(file, ".")[-2]
    # open the XML file, convert to json and dump into a new file
    with open(file, "r") as r:
        result = ""
        start = False
        for line in r:
            # print("new line: ")
            # print(line)
            # print(start)
            if (start):
                result += line
            elif ("<VariationArchive" in line):
                result += line
                start = True
            if ("</VariationArchive" in line):
                start = False
            if start == False and result != "":
                # print(result)
                mydata = bf.data(fromstring(result))
                # mydata = pk.data(fromstring(result))
                with open(name + ".json","a") as newFile:
                    json.dump(mydata, newFile, ensure_ascii=False)
                    newFile.write("\n")
                result = ""
                print(count)
                count += 1
            # print(result)


```

3. Remove "@" in json file
```
sed "s/@//g" ClinVarVariation_lodash.json > changed_to_lowdash_without_at.json
```

4. Relace "_____" to "@"
```
sed "s/_____/@/g" /Users/lix2/Downloads/xml-to-json-master/changed_to_lowdash_without_at.json > final_result.json
```

5. Take a look on head 10 lines
```
head -10 ClinVarVariation_lodash.xml
```
