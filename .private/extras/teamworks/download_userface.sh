#! /usr/bin/env bash

for x in `cat users.csv`; do
    if [ "$(echo $x | grep -Eiv '(^USERNAME|USERNOID$)')" ]; then
        username=$(echo $x | cut -d ',' -f1)
        usernoid=$(echo $x | cut -d ',' -f2)
        if [ "$(echo $usernoid | grep -Eiv 'NONE')" ]; then
            # wget -c  "https://avatars.githubusercontent.com/u/${usernoid}?s=96&v=4" -A jpeg,jpg,bmp,gif,png -O images/${username}\.png
            wget -c  "https://avatars.githubusercontent.com/u/${usernoid}?s=96&v=4" -A png -O images/${username}\.png
        fi
    fi
done
