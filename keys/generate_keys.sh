openssl ecparam -genkey -name secp384r1 -noout -out private-key.pem
openssl ec -in private-key.pem -pubout -out public-key.pem