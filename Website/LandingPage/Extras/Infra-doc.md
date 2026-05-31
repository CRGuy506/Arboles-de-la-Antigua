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
4. Have a GitHub repository ready with this workflow file present:

```text
.github/workflows/deploy-site.yml
```

## 2. Provision Azure Infrastructure

### 2.1 Resource Group

```bash
# Run on local admin machine (Azure CLI)
az group create \
  --name ADLA-RG \
  --location eastus
```

### 2.2 VNET and Subnet

```bash
# Run on local admin machine (Azure CLI)
az network vnet create \
  --resource-group ADLA-RG \
  --name ADLA-VNET \
  --address-prefix 10.0.0.0/16 \
  --subnet-name ADLA-SNET \
  --subnet-prefix 10.0.1.0/24
```

### 2.3 Network Security Group

```bash
# Run on local admin machine (Azure CLI)
az network nsg create \
  --resource-group ADLA-RG \
  --name ADLA-NSG
```

```bash
# Run on local admin machine (Azure CLI)
az network nsg rule create \
  --resource-group ADLA-RG \
  --nsg-name ADLA-NSG \
  --name ADLA-NSG-ALLOW-HTTP-HTTPS \
  --priority 100 \
  --destination-port-ranges 80 443 \
  --protocol Tcp \
  --access Allow
```

SSH access is controlled via NSG rule with IP whitelisting (configured in section 3).

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

### 2.6 VM

```bash
# Run on local admin machine (Azure CLI)
az vm create \
  --resource-group ADLA-RG \
  --name ADLA-VM \
  --nics ADLA-VM-NIC \
  --image Ubuntu2404 \
  --size Standard_B4als_v2 \
  --admin-username Admin-ADLA \
  --generate-ssh-keys
```

## 3. Configure SSH Access and Perform First Login

1. Identify your admin machine's public IP (used for whitelisting):

```bash
# Run on local admin machine
curl -s https://ifconfig.me
```

2. Create NSG rule allowing SSH only from your IP:

```bash
# Run on local admin machine (Azure CLI)
# Replace <YOUR_PUBLIC_IP> with the IP from step 1
az network nsg rule create \
  --resource-group ADLA-RG \
  --nsg-name ADLA-NSG \
  --name ADLA-NSG-ALLOW-SSH \
  --priority 90 \
  --source-address-prefixes <YOUR_PUBLIC_IP>/32 \
  --destination-port-ranges 22 \
  --protocol Tcp \
  --access Allow
```

3. Connect via SSH:

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

## 5. Prepare Web Root and Repository on VM

Create deployment path and clone repository:

Repository link: https://github.com/CRGuy506/Arboles-de-la-Antigua/tree/main/Website/LandingPage

```bash
# Run on ADLA-VM
sudo mkdir -p /var/www/site
sudo chown -R Admin-ADLA:Admin-ADLA /var/www/site
git clone https://github.com/CRGuy506/Arboles-de-la-Antigua.git /var/www/site
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

  root /var/www/site/Website/LandingPage;
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

### 9.1 Add GitHub Actions secrets

In GitHub: Settings -> Secrets and variables -> Actions.

Required:

- `VM_HOST`: Public IP or DNS of ADLA-VM
- `VM_USER`: SSH username for dedicated deploy account (example: `gha-deploy`)
- `VM_SSH_KEY`: Private SSH key for deployment user
- `VM_HOST_KEY`: host key from known_hosts for strict pinning
- `DEPLOY_PATH`: `/var/www/site`
- `HEALTHCHECK_URL`: Production HTTPS URL to validate after deploy (example: `https://arbolesdelaantigua.org/`)

Recommended:

- Use GitHub Environment protection rules for production deploy approvals.

This deployment workflow builds the site artifact in GitHub Actions and copies it to the VM over SSH.
The VM does not need GitHub credentials or repository clone access.
The workflow validates artifact SHA-256 checksums before extraction.
If deployment or health checks fail, it restores the most recent pre-deploy backup archive automatically.

### 9.2 Create dedicated GitHub Actions deploy user (least privilege)

Create a non-admin account used only by CI/CD deployments:

```bash
# Run on ADLA-VM
sudo adduser --disabled-password --gecos "" gha-deploy
sudo passwd -l gha-deploy
```

Install a dedicated SSH key for this user (do not reuse admin keys):

```bash
# Run on ADLA-VM
sudo install -d -m 700 -o gha-deploy -g gha-deploy /home/gha-deploy/.ssh
sudo touch /home/gha-deploy/.ssh/authorized_keys
sudo chown gha-deploy:gha-deploy /home/gha-deploy/.ssh/authorized_keys
sudo chmod 600 /home/gha-deploy/.ssh/authorized_keys
sudo nano /home/gha-deploy/.ssh/authorized_keys
```

Paste only the GitHub Actions deploy public key in `authorized_keys`.

Grant access only to deployment content path:

```bash
# Run on ADLA-VM
sudo install -d -m 0755 /var/www/site
sudo chown -R gha-deploy:gha-deploy /var/www/site
sudo chmod -R u=rwX,go=rX /var/www/site
```

Allow only NGINX config test and reload through sudo (no full sudo access):

```bash
# Run on ADLA-VM
sudo visudo -f /etc/sudoers.d/gha-deploy
```

Add:

```text
gha-deploy ALL=(root) NOPASSWD:/usr/sbin/nginx -t,/bin/systemctl reload nginx
```

Optional SSH hardening specific to deploy user:

```bash
# Run on ADLA-VM
sudo nano /etc/ssh/sshd_config
```

Add:

```text
Match User gha-deploy
  PasswordAuthentication no
  PermitTTY no
  X11Forwarding no
  AllowTcpForwarding no
  PermitTunnel no
```

Apply SSH config:

```bash
# Run on ADLA-VM
sudo systemctl restart ssh
```

Validate effective permissions:

```bash
# Run on ADLA-VM
sudo -l -U gha-deploy
sudo -u gha-deploy test -w /var/www/site && echo "deploy path writable"
```

### 9.3 Run first workflow

1. Push workflow and website changes to main.
2. Run workflow_dispatch (or push under Website/LandingPage).
3. Confirm deploy job success and the post-deploy health check step passes.

### 9.4 Rollback behavior

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
