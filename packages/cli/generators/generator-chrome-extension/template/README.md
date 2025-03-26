# <%= appName %>

This is a template for creating a Chrome extension.

## Generate a private key

```bash
openssl genrsa -out key.pem 2048
base64 < key.pem | tr -d '\n' # EXTENSION_PRIVATE_KEY
```

## config github secrets

```bash
EXTENSION_PRIVATE_KEY: ${{ secrets.EXTENSION_PRIVATE_KEY }}
```

## download crx

[Download CRX file](CRX_PLACEHOLDER_URL)
