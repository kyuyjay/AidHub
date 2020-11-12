#!/bin/bash

mkdir $(date +%Y-%m-%d)
cd $(date +%Y-%m-%d)
mongoexport --db=aidhub --collection=test --out=resources.json
mongoexport --db=aidhub --collection=track --out=visitors.json
mongoexport --db=aidhub --collection=track_cat --out=categories.json
mongoexport --db=aidhub --collection=track_out --out=link_out.json
