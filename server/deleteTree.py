#!/usr/bin/python3
import cgi
import json
import psycopg2
from dotenv import load_dotenv
import os 

load_dotenv('/yourpath/.env')

try:
    arguments = cgi.FieldStorage()
    uuid = arguments.getvalue("id")
    comment = arguments.getvalue("comment")
    conn = psycopg2.connect(
       user = os.getenv("DATABASE_USERNAME"),
       password = os.getenv("DATABASE_PASSWORD"),
       host = os.getenv("DATABASE_IP"),
       port = os.getenv("DATABASE_PORT"),
       database = os.getenv("DATABASE_NAME")
    )
    cur = conn.cursor()
    cur.execute("UPDATE trees_3857 SET comment_editor = %s WHERE tree_id = %s", [comment,uuid])
    cur.execute("INSERT INTO trees_deleted_3857 SELECT gid, uuid, tree_id, name_ger, name_src, age_group, age_g_src, source, comment, watered, age, age_src, radius, radius_src, geom, watered_at, subsoil, comment_editor, create_edit FROM trees_test_3857 WHERE tree_id = %s", [uuid])
    cur.execute("DELETE FROM trees_3857 WHERE tree_id = %s", [uuid])
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
