git log --name-status --pretty=format:'' --author="Heather" | cut -f2 -d"       " | cut -f1,2 -d"/" | sort | uniq
