npm install
find . -type f -name "*.ts" -not -path "./node_modules/*" -exec echo "tsc" {} \; -exec tsc {} \;
node .
