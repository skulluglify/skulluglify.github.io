#!/usr/bin/env bash

zip -r0qy9vo emojis.zip `ls | grep -Eiv '(emojis.jsm|node_modules|package-lock.json)'`
