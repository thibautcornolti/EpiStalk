#!/usr/bin/env python3

import mysql.connector
import zlib
import requests

USER_LINK = "https://intra.epitech.eu/user/?format=json"
MARK_LINK = lambda user: "https://intra.epitech.eu/user/{}/notes?format=json".format(user)

def get_data(id, autologin):
    session = requests.Session()

    res = session.get(autologin)
    res = session.get(USER_LINK)
    user_json_res = res.json()
    res = session.get(MARK_LINK(user_json_res["login"]))
    mark_byte_res = res.text.encode()

    gpa = [
        g["gpa"]
        for g in user_json_res["gpa"]
        if g["cycle"] == "bachelor"
    ][0]

    return {
        'id': id,
        'gpa': float(gpa),
        'mark': str(zlib.compress(mark_byte_res)),
        'credit': int(user_json_res["credits"]),
        'current_week_log': float(user_json_res["nsstat"]["active"]),
    }



try:
    cnx = mysql.connector.connect(
        user="thibaut",
        password="thibaut123",
        host="104.155.43.170",
        database="epislack-test"
    )
except Exception as e:
    exit(e)

try:
    cursor = cnx.cursor()
    cursor.execute("SELECT id, autologin FROM user")

    for (id, autologin) in cursor.fetchall():
        cursor.execute(
            """
                UPDATE user SET
                    gpa = %(gpa)s,
                    mark = %(mark)s,
                    credit = %(credit)s,
                    current_week_log = %(current_week_log)s
                WHERE
                    id = '%(id)s'
            """,
            get_data(id, autologin))
    
    cnx.commit()
except Exception as e:
    exit(e)

cnx.close()