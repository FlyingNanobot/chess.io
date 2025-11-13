This folder stores TLS certificate and key files used for running the server locally over HTTPS.

Files expected by the server (when using `--https`):
- `cert.pem` — X.509 certificate (PEM)
- `key.pem`  — Private key (PEM)

Do NOT commit real private keys for production use. This folder contains example/sample files to help you get started.

Generate a self-signed certificate using the provided npm script from the `server` folder:

```bash
npm run generate-certs
```

This script requires `openssl` to be installed and available on your PATH. On Windows you can install OpenSSL via Git for Windows, Chocolatey, or use WSL.

After running, run the server with HTTPS enabled:

```bash
npm run start:https
```

If you prefer to provide your own certificate, place `cert.pem` and `key.pem` into this folder.
