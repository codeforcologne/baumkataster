#!/usr/bin/python3
import cgi
import json
import psycopg2
from datetime import datetime, timedelta
try:
    date_object = datetime.today()
    date_string = date_object.strftime("%Y-%m-%d")
    arguments = cgi.FieldStorage()
    uuid = arguments.getvalue("id")
    name_ger = arguments.getvalue("name_ger")
    if name_ger == 'null':
        name_ger = None
    name_src = arguments.getvalue("name_src")
    if name_src == 'null':
        name_src = None
    age = arguments.getvalue("age")
    if age == 'null':
        age = None
    age_src = arguments.getvalue("age_src")
    if age_src == 'null':
        age_src = None
    radius = arguments.getvalue("radius")
    if radius == 'null':
        radius = None
    radius_src = arguments.getvalue("radius_src")
    if radius_src == 'null':
        radius_src = None
    age_group = arguments.getvalue("age_group")
    if age_group == 'null':
        age_group = None
    age_g_src = arguments.getvalue("age_g_src")
    if age_g_src == 'null':
        age_g_src = None
    subsoil = arguments.getvalue("subsoil")
    comment = arguments.getvalue("comment")
    conn = psycopg2.connect("host=yourHost dbname=yourDB user=yourUser password=yourPassword")
    cur = conn.cursor()
    cur.execute("UPDATE trees SET name_ger = %s, name_src = %s, age = %s, age_src = %s, age_group = %s, age_g_src = %s, radius = %s, radius_src = %s,comment_editor = %s, subsoil= %s,create_edit = %s WHERE tree_id = %s", (name_ger,name_src,age,age_src,age_group,age_g_src,radius,radius_src,comment,subsoil,date_string,uuid))
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