#!/usr/bin/python3
import cgi
import json
import psycopg2
import uuid
from datetime import datetime, timedelta
try:
    date_object = datetime.today()
    date_string = date_object.strftime("%Y-%m-%d")
    date_giessen = datetime(year=2020, month=7, day=26, hour=4, minute=00, second=00)
    date_string_giessen = date_giessen.strftime("%Y-%m-%d")
    uuid = str(uuid.uuid4())
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
    conn = psycopg2.connect("host=yourHost dbname=yourDB user=yourUser password=yourPassword")
    cur = conn.cursor()
    cur.execute("INSERT INTO trees (geom,tree_id, uuid,name_ger,name_src,source,create_edit,age_group,age_g_src,radius,radius_src,age,age_src,subsoil,comment_editor,watered_at) VALUES (st_setsrid(st_makepoint(%s,%s),4326),%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", (lat,lon,uuid,uuid,name_ger,name_src,source,date_string,age_group,age_g_src,radius,radius_src,age,age_src,subsoil,comment,date_string_giessen))
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
