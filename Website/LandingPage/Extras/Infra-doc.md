# Azure IaaS Static Website with NGINX, TLS, GitHub Actions, and Fail2Ban

## 1. Resource Group
```bash
az group create \
  --name ADLA-RG \
  --location eastus
```

## 2. VNET and Subnet
```bash
az network vnet create \
  --resource-group ADLA-RG \
  --name ADLA-VNET \
  --address-prefix 10.0.0.0/16 \
  --subnet-name ADLA-SNET \
  --subnet-prefix 10.0.1.0/24
```

## 3. Network Security Group
```bash
az network nsg create \
  --resource-group ADLA-RG \
  --name ADLA-NSG
```

```bash
az network nsg rule create \
  --resource-group ADLA-RG \
  --nsg-name ADLA-NSG \
  --name ADLA-NSG-ALLOW-HTTP-HTTPS \
  --priority 100 \
  --destination-port-ranges 80 443 \
  --protocol Tcp \
  --access Allow
```

```bash
az network nsg rule create \
  --resource-group ADLA-RG \
  --nsg-name ADLA-NSG \
  --name ADLA-NSG-ALLOW-SSH-TEMP \
  --priority 110 \
  --destination-port-ranges 22 \
  --protocol Tcp \
  --access Allow
```

## 4. Public IP
```bash
az network public-ip create \
  --resource-group ADLA-RG \
  --name ADLA-PIP \
  --sku Standard \
  --allocation-method Static
```

## 5. NIC
```bash
az network nic create \
  --resource-group ADLA-RG \
  --name ADLA-NIC \
  --vnet-name ADLA-VNET \
  --subnet ADLA-SNET \
  --network-security-group ADLA-NSG \
  --public-ip-address ADLA-PIP
```

## 6. VM
```bash
az vm create \
  --resource-group ADLA-RG \
  --name ADLA-VM \
  --nics ADLA-NIC \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username Admin-ADLA \
  --generate-ssh-keys
```

## 7. SSH
```bash
ssh Admin-ADLA@<PUBLIC_IP>
```

## 8. OS Updates
```bash
sudo apt update
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## 9. Install NGINX
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 10. NGINX Global Config
```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside http:
```nginx
server_tokens off;
limit_req_zone $binary_remote_addr zone=limit:10m rate=5r/s;
client_max_body_size 10M;
keepalive_timeout 15;
```

## 11. Site Config
```bash
sudo nano /etc/nginx/sites-available/site
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/site;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

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

```bash
sudo ln -s /etc/nginx/sites-available/site /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 12. SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 13. Fail2Ban
```bash
sudo apt install fail2ban -y
sudo nano /etc/fail2ban/jail.local
```

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

```bash
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

## 14. SSH Hardening
```bash
sudo nano /etc/ssh/sshd_config
```

```text
PermitRootLogin no
PasswordAuthentication no
MaxAuthTries 3
```

```bash
sudo systemctl restart ssh
```
