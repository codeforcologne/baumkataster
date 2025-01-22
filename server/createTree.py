#!/usr/bin/python3
import cgi
import json
import psycopg2
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os 

load_dotenv('/yourpath/.env')

try:
    date_object = datetime.today()
    date_string = date_object.strftime("%Y-%m-%d")
    date_giessen = datetime(year=2020, month=7, day=26, hour=4, minute=00, second=00)
    date_string_giessen = date_giessen.strftime("%Y-%m-%d")
    tree_uuid = str(uuid.uuid4())
    arguments = cgi.FieldStorage()
    lat = arguments.getvalue("lat")
    lon = arguments.getvalue("lon")
    name_ger = arguments.getvalue("name_ger")
    name_src = 'crowd'
    radius = arguments.getvalue("radius")
    if radius == 'null':
        radius = None
    radius_src = 'crowd'
    age = arguments.getvalue("age")
    age_src = 'crowd'
    durchmesser = arguments.getvalue("durchmesser")
    alter = arguments.getvalue("alter")
    subsoil = arguments.getvalue("subsoil")
    comment = arguments.getvalue("comment")
    source = 'crowd'
    age_group = arguments.getvalue("age_group")
    age_g_src = 'crowd'    
    conn = psycopg2.connect(
       user = os.getenv("DATABASE_USERNAME"),
       password = os.getenv("DATABASE_PASSWORD"),
       host = os.getenv("DATABASE_IP"),
       port = os.getenv("DATABASE_PORT"),
       database = os.getenv("DATABASE_NAME")
    )
    cur = conn.cursor()
    #cur.execute("INSERT INTO trees_3857 (geom,tree_id, uuid,name_ger,name_src,source,create_edit,age_group,age_g_src,radius,radius_src,age,age_src,subsoil,comment_editor,watered_at) VALUES (ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326),3857),%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", (lat,lon,tree_uuid,tree_uuid,name_ger,name_src,source,date_string,age_group,age_g_src,radius,radius_src,age,age_src,subsoil,comment,date_string_giessen))    
    cur.execute("INSERT INTO trees_3857 (geom,tree_id) VALUES (ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326),3857),%s)", (lat,lon,tree_uuid))    
    conn.commit()
    cur.close()
    conn.close()
    print ("Content-type: application/json")
    print () 
    print ('{"request" : "done"}')
except Exception as error:
    print ("Content-type: application/json")
    print () 
    print ('{"request" : "error"}')
