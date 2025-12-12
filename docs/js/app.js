cd C:\Users\ivanbauza\bauzagpt.com

# 5) marca conflictos como resueltos
git add docs\index.html docs\css\styles.css docs\js\firebase-init.js docs\js\login.js docs\js\app.js

# 6) este es el path conflictivo viejo: lo removemos del índice si sigue apareciendo
git rm -f --ignore-unmatch "docs/js/app.js/app.js"

git status
git commit -m "resolve conflicts + boton premium stripe"
git push
