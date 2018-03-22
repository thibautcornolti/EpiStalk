#!/usr/bin/env python3

import requests
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("autologin", help="Autologin link")
args = parser.parse_args()

LINK = args.autologin
USER_LINK = "https://intra.epitech.eu/user/?format=json"

session = requests.Session()

res = session.get(args.autologin)
res = session.get(USER_LINK)

json_res = res.json()

gpa = [
    g["gpa"]
    for g in json_res["gpa"]
    if g["cycle"] == "bachelor"
][0]

print(gpa)
