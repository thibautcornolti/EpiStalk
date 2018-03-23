#!/usr/bin/env python3

import requests
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("autologin", help="Autologin link")
args = parser.parse_args()

LINK = args.autologin
USER_LINK = "https://intra.epitech.eu/user/thibaut.cornolti@epitech.eu/?format=json"

session = requests.Session()

res = session.get(args.autologin)
res = session.get(USER_LINK)

json_res = res.json()

print(res.text)
