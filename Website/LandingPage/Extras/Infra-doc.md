# Azure IaaS Static Website Runbook (Chronological)

This document is intentionally ordered from first action to ongoing operations.
Follow sections in sequence for first deployment.

## 0. Scope and Architecture Decisions

This platform serves a small neighborhood community (about 300+ homes) with low expected traffic.

Cost-driven exclusions:

- Azure WAF
- Azure Bastion
- Azure Application Gateway

Compensating controls:

- NSG IP whitelisting for SSH (restrict to known admin IPs)
- NSG public ingress limited to HTTP/HTTPS
- NGINX hardening and TLS
- Fail2Ban for SSH abuse control
- Automatic OS patching and SSH hardening

## 1. Prerequisites (Before Any Azure Changes)

1. Confirm local tools:

```bash
# Run on local admin machine
az version
ssh -V
git --version
```

2. Confirm you can deploy to the target Azure subscription.
3. Have domain DNS access for `arbolesdelaantigua.org` and `www.arbolesdelaantigua.org`.
4. Have a GitHub repository ready with `.github/workflows/deploy-site.yml` present.
5. Know your current public admin IP for SSH whitelisting (`<YOUR_PUBLIC_IP>`).

## 2. Provision Azure Infrastructure

### 2.1 Resource Group

```bash
# Run on local admin machine (Azure CLI)
az group create \
  --name ADLA-RG \
  --location eastus
```

### 2.2 Virtual Network and Subnet

```bash
# Run on local admin machine (Azure CLI)
az network vnet create \
  --resource-group ADLA-RG \
  --name ADLA-VNET \
  --address-prefix 10.0.0.0/16 \
  --subnet-name ADLA-SNET \
  --subnet-prefix 10.0.1.0/24
```

### 2.3 Network Security Group and Inbound Rules

Create NSG:

```bash
# Run on local admin machine (Azure CLI)
az network nsg create \
  --resource-group ADLA-RG \
  --name ADLA-NSG
```

Allow HTTP/HTTPS:

```bash
# Run on local admin machine (Azure CLI)
az network nsg rule create \
  --resource-group ADLA-RG \
  --nsg-name ADLA-NSG \
  --name ADLA-NSG-ALLOW-HTTP-HTTPS \
  --priority 100 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 80 443
```

Allow SSH only from admin public IP:

```bash
# Run on local admin machine (Azure CLI)
az network nsg rule create \
  --resource-group ADLA-RG \
  --nsg-name ADLA-NSG \
  --name ADLA-NSG-ALLOW-SSH \
  --priority 90 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --source-address-prefixes <YOUR_PUBLIC_IP>/32 \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 22
```

### 2.4 Public IP

```bash
# Run on local admin machine (Azure CLI)
az network public-ip create \
  --resource-group ADLA-RG \
  --name ADLA-VM-PIP \
  --sku Standard \
  --allocation-method Static
```

### 2.5 NIC

```bash
# Run on local admin machine (Azure CLI)
az network nic create \
  --resource-group ADLA-RG \
  --name ADLA-VM-NIC \
  --vnet-name ADLA-VNET \
  --subnet ADLA-SNET \
  --network-security-group ADLA-NSG \
  --public-ip-address ADLA-VM-PIP
```

### 2.6 Virtual Machine

```bash
# Run on local admin machine (Azure CLI)
az vm create \
  --resource-group ADLA-RG \
  --name ADLA-VM \
  --nics ADLA-VM-NIC \
  --image Ubuntu2204 \
  --size Standard_B4als_v2 \
  --admin-username Admin-ADLA \
  --generate-ssh-keys
```

## 3. First VM Access

1. Retrieve public IP:

```bash
# Run on local admin machine (Azure CLI)
az network public-ip show \
  --resource-group ADLA-RG \
  --name ADLA-VM-PIP \
  --query ipAddress \
  --output tsv
```

2. Connect via SSH:

```bash
# Run on local admin machine
ssh -i <PATH_TO_PRIVATE_KEY> Admin-ADLA@<PUBLIC_IP>
```

## 4. Baseline OS Patching and Security Hardening

### 4.1 Configure unattended-upgrades

```bash
# Run on ADLA-VM
sudo apt update
sudo apt install unattended-upgrades apt-listchanges -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

Write periodic schedule:

```bash
# Run on ADLA-VM
sudo tee /etc/apt/apt.conf.d/20auto-upgrades >/dev/null <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
```

Write unattended-upgrades policy:

```bash
# Run on ADLA-VM
sudo tee /etc/apt/apt.conf.d/50unattended-upgrades >/dev/null <<'EOF'
Unattended-Upgrade::Origins-Pattern {
  "origin=Ubuntu,codename=${distro_codename},label=Ubuntu";
  "origin=Ubuntu,codename=${distro_codename},label=Ubuntu-Security";
  "origin=UbuntuESMApps,codename=${distro_codename}-apps-security,label=UbuntuESMApps";
  "origin=UbuntuESM,codename=${distro_codename}-infra-security,label=UbuntuESM";
};

Unattended-Upgrade::Package-Blacklist {
};

Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Dependencies "false";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:30";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::InstallOnShutdown "false";
Unattended-Upgrade::Mail "";
Unattended-Upgrade::MailOnlyOnError "true";
Unattended-Upgrade::Verbose "false";
Unattended-Upgrade::RandomSleep "1800";
Unattended-Upgrade::SyslogEnable "true";
EOF
```

Validate:

```bash
# Run on ADLA-VM
sudo unattended-upgrade --dry-run --debug
sudo systemctl status unattended-upgrades --no-pager
sudo tail -n 100 /var/log/unattended-upgrades/unattended-upgrades.log
```

### 4.2 SSH hardening

```bash
# Run on ADLA-VM
sudo nano /etc/ssh/sshd_config
```

Set at minimum:

```text
PermitRootLogin no
PasswordAuthentication no
MaxAuthTries 3
```

Apply:

```bash
# Run on ADLA-VM
sudo systemctl restart ssh
```

### 4.3 Install and configure Fail2Ban

```bash
# Run on ADLA-VM
sudo apt install fail2ban -y
sudo nano /etc/fail2ban/jail.local
```

Use:

```ini
[DEFAULT]
bantime = 600
findtime = 600
maxretry = 5
backend = systemd

[sshd]
enabled = true
bantime = 600

[recidive]
enabled = true
logpath = /var/log/fail2ban.log
action = iptables-allports[name=recidive]
bantime = 86400
findtime = 86400
maxretry = 2

[recidive-aggressive]
enabled = true
logpath = /var/log/fail2ban.log
action = iptables-allports[name=recidive-aggressive]
bantime = 2592000
findtime = 172800
maxretry = 3
```

Apply:

```bash
# Run on ADLA-VM
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

## 5. Prepare Web Root on VM

Create deployment path and set initial ownership:

```bash
# Run on ADLA-VM
sudo mkdir -p /var/www/site
sudo chown -R Admin-ADLA:Admin-ADLA /var/www/site
```

Create a temporary bootstrap page so HTTP/TLS checks have content before the first CI/CD deployment:

```bash
# Run on ADLA-VM
echo '<!doctype html><html><body><h1>ADLA bootstrap</h1></body></html>' | sudo tee /var/www/site/index.html >/dev/null
```

## 6. Install NGINX and Create HTTP Bootstrap Site

### 6.1 Install NGINX

```bash
# Run on ADLA-VM
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6.2 NGINX global tuning

```bash
# Run on ADLA-VM
sudo nano /etc/nginx/nginx.conf
```

Add in `http` block:

```nginx
server_tokens off;
ssl_protocols TLSv1.2 TLSv1.3;
limit_req_zone $binary_remote_addr zone=limit:10m rate=5r/s;
client_max_body_size 10M;
keepalive_timeout 15;
```

### 6.3 HTTP-only site bootstrap (required before certbot)

```bash
# Run on ADLA-VM
sudo nano /etc/nginx/sites-available/site
```

Set this temporary HTTP config first:

```nginx
server {
    listen 80;
  server_name arbolesdelaantigua.org www.arbolesdelaantigua.org;

  # Drop .git probes and other hidden files used by scanners.
  location = /.git {
    return 444;
  }

  location ^~ /.git/ {
    return 444;
  }

  location ~ /\.(?!well-known).* {
    return 444;
  }

  location ~* /(wp-admin|wp-login\.php|xmlrpc\.php|\.env|composer\.(json|lock)|vendor/|\.svn|\.hg) {
    return 444;
  }

  root /var/www/site;
    index index.html;

    location / {
    try_files $uri $uri/ /index.html;
    }
}
```

Enable and validate:

```bash
# Run on ADLA-VM
sudo ln -s /etc/nginx/sites-available/site /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Obtain TLS Certificates

Install certbot and issue certs:

```bash
# Run on ADLA-VM
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d arbolesdelaantigua.org -d www.arbolesdelaantigua.org
```

## 8. Replace with Final Hardened HTTPS Site Config

Update site config:

```bash
# Run on ADLA-VM
sudo nano /etc/nginx/sites-available/site
```

Use final configuration:

```nginx
server {
    listen 80;
  server_name arbolesdelaantigua.org www.arbolesdelaantigua.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
  server_name arbolesdelaantigua.org www.arbolesdelaantigua.org;

    root /var/www/site;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/arbolesdelaantigua.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/arbolesdelaantigua.org/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_AES_128_GCM_SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    ssl_stapling on;
    ssl_stapling_verify on;

    resolver 1.1.1.1 8.8.8.8 valid=300s;
    resolver_timeout 5s;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    limit_req zone=limit burst=10 nodelay;

    if ($http_user_agent ~* (curl|wget|nikto|sqlmap|nmap|dirbuster)) {
        return 403;
    }

    location ~* (\.\./|\~|/etc/passwd|\.git) {
        deny all;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Apply and validate:

```bash
# Run on ADLA-VM
sudo nginx -t
sudo systemctl reload nginx
```

## 9. Configure GitHub Actions Deployment

This repository uses `.github/workflows/deploy-site.yml`.

### 9.0 Deployment scope guardrail (LandingPage only)

The production workflow is intentionally scoped to deploy only content from `Website/LandingPage/`.

Scope controls to keep in place in `.github/workflows/deploy-site.yml`:

- Trigger path filter includes only:
  - `Website/LandingPage/**`
  - `.github/workflows/deploy-site.yml`
- Artifact build source is only:
  - `Website/LandingPage/`
- Artifact excludes non-production docs:
  - `Extras/`
  - `README.md`
  - `ARCHITECTURE.md`

Result: commits outside `Website/LandingPage/` do not trigger deploys, and when a deploy runs, only LandingPage files are copied into `DEPLOY_PATH`.

### 9.1 Add GitHub Actions secrets

In GitHub: Settings -> Secrets and variables -> Actions.

Required:

- `DEPLOY_PATH`: `/var/www/site`
- `HEALTHCHECK_URL`: Production HTTPS URL to validate after deploy (example: `https://arbolesdelaantigua.org/`)

Recommended:

- Use GitHub Environment protection rules for production deploy approvals.

This deployment workflow runs on a self-hosted GitHub Actions runner installed on ADLA-VM.
The runner checks out the repository locally, builds the site artifact, and deploys directly to `DEPLOY_PATH`.
This model does not require VM SSH host/user/key secrets for deployment.
The workflow validates artifact SHA-256 checksums before extraction.
If deployment or health checks fail, it restores the most recent pre-deploy backup archive automatically.

### 9.4 Verify runner scope before production changes

Before merging workflow edits, confirm deployment scope remains limited to LandingPage:

1. Confirm push filters still target `Website/LandingPage/**` plus the workflow file.
2. Confirm artifact build still uses `rsync` source `Website/LandingPage/`.
3. Confirm excludes still include `Extras/`, `README.md`, and `ARCHITECTURE.md`.
4. In a pull request, inspect workflow diff and verify no additional source paths were added.

### 9.2 Create dedicated GitHub Actions deploy user (least privilege)

Create a non-admin account used only by CI/CD deployments:

```bash
# Run on ADLA-VM
sudo adduser --disabled-password --gecos "" gha-deploy
sudo passwd -l gha-deploy
```

Grant access only to deployment content path:

```bash
# Run on ADLA-VM
sudo install -d -m 0755 /var/www/site
sudo chown -R gha-deploy:gha-deploy /var/www/site
sudo chmod -R u=rwX,go=rX /var/www/site
```

Allow only the commands required by the deployment workflow through sudo (no full sudo access):

```bash
# Run on ADLA-VM
sudo visudo -f /etc/sudoers.d/gha-deploy
```

Add:

```text
gha-deploy ALL=(root) NOPASSWD: /usr/bin/tar, /usr/bin/install, /usr/bin/find, /usr/sbin/nginx, /bin/systemctl
```

Apply secure sudoers permissions:

```bash
# Run on ADLA-VM
sudo chmod 440 /etc/sudoers.d/gha-deploy
```

Validate effective permissions:

```bash
# Run on ADLA-VM
sudo -l -U gha-deploy
sudo -u gha-deploy test -w /var/www/site && echo "deploy path writable"
```

If command paths differ on your VM, verify before saving sudoers:

```bash
# Run on ADLA-VM
which tar install find nginx systemctl
```

### 9.3 Register self-hosted GitHub Actions runner on ADLA-VM

In GitHub:

1. Open repository Settings -> Actions -> Runners.
2. Select New self-hosted runner.
3. Choose Linux and X64.
4. Copy the registration commands GitHub provides.

Run the provided commands on ADLA-VM in a dedicated runner directory:

```bash
# Run on ADLA-VM
sudo install -d -m 755 -o gha-deploy -g gha-deploy /home/gha-deploy/actions-runner
cd /home/gha-deploy/actions-runner
# Paste and run the commands shown by GitHub for Linux X64 runner setup
```

Install runner service and start it:

```bash
# Run on ADLA-VM
cd /home/gha-deploy/actions-runner
sudo ./svc.sh install gha-deploy
sudo ./svc.sh start
```

Validate that the runner shows as online in GitHub before continuing.

### 9.4 Run first workflow

1. Push workflow and website changes to main.
2. Run workflow_dispatch (or push under Website/LandingPage).
3. Confirm deploy job success and the post-deploy health check step passes.

### 9.5 Rollback behavior

- Before every deployment, workflow creates a backup archive of current site contents in `/tmp` on ADLA-VM when existing content is present.
- Workflow retains the 3 most recent backup archives and automatically removes older backup files.
- On failed deploy or failed health check, workflow automatically restores from the latest backup and runs a rollback health check.
- Keep free space available in `/tmp` for backup archives and deployment artifacts.

## 10. First Deployment Verification and Closeout

Run on ADLA-VM:

```bash
# Run on ADLA-VM
sudo journalctl -u nginx --since "-15 min"
systemctl status nginx --no-pager
```

Run from any client machine:

```bash
# Run on local client machine
curl -I https://arbolesdelaantigua.org
```

Closeout:

1. Verify NSG rule `ADLA-NSG-ALLOW-SSH` is in place and restricted to your admin IP.
2. Confirm HTTP/HTTPS rules (`ADLA-NSG-ALLOW-HTTP-HTTPS`) are present.

## 11. Post-Go-Live Operations Reference

All ongoing maintenance activities are found in:

- `Maintenance.md` in the same directory.
