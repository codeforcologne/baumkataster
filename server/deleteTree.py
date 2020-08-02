#!/usr/bin/python3
import cgi
import json
import psycopg2
try:
    arguments = cgi.FieldStorage()
    uuid = arguments.getvalue("id")
    comment = arguments.getvalue("comment")
    conn = psycopg2.connect("host=yourHost dbname=yourDB user=yourUser password=yourPassword")
    cur = conn.cursor()
    cur.execute("UPDATE trees SET comment_editor = %s WHERE tree_id = %s", [comment,uuid])
    cur.execute("INSERT INTO trees_deleted SELECT * FROM trees WHERE tree_id = %s", [uuid])
    cur.execute("DELETE FROM trees WHERE tree_id = %s", [uuid])
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