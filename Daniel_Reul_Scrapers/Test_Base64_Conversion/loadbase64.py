import os
import errno
import base64

png_b64text=""
with open("base64debugdump", 'r') as f:
        png_b64text= f.read()
png_recovered = base64.b64decode(png_b64text[22:])


write_path="Sub"
os.makedirs(write_path,exist_ok=True)
f = open(write_path+"/"+"base64debugdump2.jpeg", "wb")
f.write(png_recovered)
f.close()