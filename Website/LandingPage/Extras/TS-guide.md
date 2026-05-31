# Troubleshooting, Maintenance, and Incident Response Runbook

This runbook is for the ADLA VM stack using:

- NGINX (web)
- Certbot (TLS)
- Fail2Ban (abuse protection)
- SSH hardening
- Azure networking resources (`ADLA-RG`, `ADLA-NSG`, `ADLA-PIP`, `ADLA-VM`)

Use this in order during incidents: triage -> contain -> recover -> verify -> document.

Execution context:

- Unless stated otherwise, run commands on `ADLA-VM` after SSH login.
- Azure `az` CLI commands can be run from your local admin workstation or Azure Cloud Shell.
- DNS-only checks (`nslookup`, external `curl`) can be run from local machine or VM for comparison.

---

## 1. Fast Health Check (60 Seconds)

```bash
# Run on ADLA-VM
date
hostname
uptime
curl -Is https://yourdomain.com | head -n 1
systemctl is-active nginx fail2ban ssh
systemctl --failed
```

If anything is failed, continue with sections 2 to 5.

---

## 2. Service and Log Diagnostics

### Core service status
```bash
# Run on ADLA-VM
systemctl status nginx
systemctl status fail2ban
systemctl status ssh
```

### Validate and reload NGINX safely
```bash
# Run on ADLA-VM
sudo nginx -t
sudo systemctl reload nginx
```

### If reload fails, restart
```bash
# Run on ADLA-VM
sudo systemctl restart nginx
```

### NGINX logs
```bash
# Run on ADLA-VM
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Journald logs
```bash
# Run on ADLA-VM
journalctl -xe
journalctl -u nginx --since "-30 min"
journalctl -u fail2ban --since "-30 min"
```

Common NGINX issues:

- Wrong `root` path
- Syntax errors in `sites-available` config
- Permission problems under `/var/www`

---

## 3. Incident Triage and Evidence Capture

Before major changes, capture evidence:

```bash
# Run on ADLA-VM
sudo journalctl -u nginx --since "-30 min" > /tmp/nginx-last-30m.log
sudo journalctl -u fail2ban --since "-30 min" > /tmp/fail2ban-last-30m.log
sudo tail -n 300 /var/log/nginx/error.log > /tmp/nginx-error-tail.log
```

Quick impact snapshot:

```bash
# Run on local machine OR ADLA-VM
curl -I http://yourdomain.com
curl -I https://yourdomain.com
```

---

## 4. Emergency Containment

### Option A: temporary maintenance response (503)
```bash
# Run on ADLA-VM
sudo cp /etc/nginx/sites-available/site /etc/nginx/sites-available/site.bak
```

Set temporary response in `location /`:

```nginx
location / {
		return 503;
}
```

Apply:
```bash
# Run on ADLA-VM
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: block abusive sources

Fail2Ban immediate ban:
```bash
# Run on ADLA-VM
sudo fail2ban-client set sshd banip <IP>
```

Targeted NGINX block:
```nginx
deny <IP>;
```

---

## 5. Recovery and Rollback

### Quick restart path
```bash
# Run on ADLA-VM
sudo systemctl restart nginx
sudo systemctl restart fail2ban
sudo systemctl restart ssh
```

### Git-based rollback
```bash
# Run on ADLA-VM
cd /var/www/site
git log --oneline -n 10
sudo -u www-data git checkout <GOOD_COMMIT_SHA>
sudo nginx -t
sudo systemctl reload nginx
```

### Return to current release
```bash
# Run on ADLA-VM
sudo -u www-data git checkout main
sudo -u www-data git pull
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL / HTTPS Troubleshooting

### Certificate status
```bash
# Run on ADLA-VM
sudo certbot certificates
```

### Renewal simulation
```bash
# Run on ADLA-VM
sudo certbot renew --dry-run
```

### Verify cert path exists
```bash
# Run on ADLA-VM
ls /etc/letsencrypt/live/yourdomain.com/
```

### Reload web server after renewal
```bash
# Run on ADLA-VM
sudo systemctl reload nginx
```

### Check expiry quickly
```bash
# Run on local machine OR ADLA-VM
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 7. DNS and Connectivity Checks

### DNS resolution
```bash
# Run on local machine OR ADLA-VM
nslookup yourdomain.com
```

### Local and remote connectivity
```bash
# Run on ADLA-VM (first 3), local OR VM (last one)
curl localhost
curl localhost:80
curl localhost:443
curl -I https://yourdomain.com
```

### Open listening ports
```bash
# Run on ADLA-VM
sudo ss -tulnp
```

---

## 8. Azure Network Verification (ADLA Naming)

### NSG rules
```bash
# Run on local machine OR Azure Cloud Shell
az network nsg rule list \
	--resource-group ADLA-RG \
	--nsg-name ADLA-NSG \
	--output table
```

### Public IP
```bash
# Run on local machine OR Azure Cloud Shell
az network public-ip show \
	--resource-group ADLA-RG \
	--name ADLA-PIP \
	--query ipAddress -o tsv
```

Operational note:

- Remove or tighten temporary SSH allowance once secure access paths are confirmed.

---

## 9. Fail2Ban Operations

### Global status
```bash
# Run on ADLA-VM
sudo fail2ban-client status
```

### SSH jail details
```bash
# Run on ADLA-VM
sudo fail2ban-client status sshd
sudo fail2ban-client get sshd banned
```

### Unban when required
```bash
# Run on ADLA-VM
sudo fail2ban-client set sshd unbanip <IP>
```

### Logs
```bash
# Run on ADLA-VM
sudo tail -f /var/log/fail2ban.log
```

---

## 10. Deployment and Repository Issues

### Manual deployment trigger
```bash
# Run on ADLA-VM
bash ~/deploy.sh
```

### Repository check
```bash
# Run on ADLA-VM
cd /var/www/site
git status
```

### Fix web ownership
```bash
# Run on ADLA-VM
sudo chown -R www-data:www-data /var/www/site
```

### Verify GitHub SSH auth
```bash
# Run on ADLA-VM
ssh -T git@github.com
```

---

## 11. Performance and Resource Pressure

### CPU/RAM
```bash
# Run on ADLA-VM
top
htop
free -h
vmstat 1 5
```

### Disk and inode pressure
```bash
# Run on ADLA-VM
df -h
df -i
sudo du -ah /var/log | sort -hr | head -n 30
```

### Connection overview
```bash
# Run on ADLA-VM
sudo ss -s
sudo netstat -an | grep :80 | wc -l
```

### Top requesters
```bash
# Run on ADLA-VM
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 20
```

---

## 12. Security Review Commands

### Current bans
```bash
# Run on ADLA-VM
sudo fail2ban-client status
```

### Suspicious responses
```bash
# Run on ADLA-VM
grep "403" /var/log/nginx/access.log
```

### Verify SSH policy after changes
```bash
# Run on ADLA-VM
sudo sshd -t
sudo systemctl restart ssh
```

---

## 13. Scheduled Maintenance

### OS updates
```bash
# Run on ADLA-VM
sudo apt update
sudo apt upgrade -y
```

### Certbot timer check
```bash
# Run on ADLA-VM
systemctl list-timers | grep certbot
sudo journalctl -u certbot --since "-7 days"
```

### Journal cleanup
```bash
# Run on ADLA-VM
sudo journalctl --vacuum-time=7d
```

### Optional logrotate dry-run
```bash
# Run on ADLA-VM
sudo logrotate -d /etc/logrotate.conf
```

---

## 14. Backup and Restore

### Backup site + nginx
```bash
# Run on ADLA-VM
sudo tar -czf /root/site-backup-$(date +%F-%H%M).tgz /var/www/site /etc/nginx
```

### Backup fail2ban + ssh
```bash
# Run on ADLA-VM
sudo tar -czf /root/security-backup-$(date +%F-%H%M).tgz /etc/fail2ban /etc/ssh/sshd_config
```

### Restore example
```bash
# Run on ADLA-VM
sudo tar -xzf /root/site-backup-YYYY-MM-DD-HHMM.tgz -C /
sudo nginx -t
sudo systemctl restart nginx
```

---

## 15. Post-Incident Checklist

Record after recovery:

1. Start and end time (UTC)
2. User impact and affected endpoints
3. Root cause and trigger
4. Containment actions
5. Permanent corrective actions
6. Owner and due date for follow-ups

Archive a minimal forensic bundle:

```bash
# Run on ADLA-VM
date
uname -a
systemctl status nginx fail2ban ssh --no-pager
sudo nginx -t
sudo fail2ban-client status
```

---

## 16. Quick Script (Reusable)

```bash
#!/bin/bash
set -e

# Run on ADLA-VM

echo "=== Basic Health ==="
date
curl -Is https://yourdomain.com | head -n 1
systemctl is-active nginx
systemctl is-active fail2ban
systemctl is-active ssh
```

