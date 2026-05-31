# ADLA VM Maintenance Runbook

This runbook contains recurring maintenance tasks after go-live.
Use it together with Infra-doc.md.

## 0. Operating Rules

- Maintain NSG IP whitelisting for SSH—verify source IPs are restricted to authorized admin machines.
- Update NSG rules if admin IP changes (home/office network changes). Delete old rule, create new one with updated IP.
- Record each maintenance execution date, owner, findings, and follow-up actions.
- If a command returns unexpected output, stop and open an incident ticket before proceeding with risky changes.

## 1. Daily Checks (5-10 minutes)

### 1.1 Service health and recent errors

```bash
# Run on ADLA-VM
systemctl is-active nginx
systemctl is-active fail2ban
systemctl is-active ssh
sudo journalctl -u nginx --since "-24 hours" -p warning --no-pager
```

Expected:

- Services should return `active`.
- NGINX warnings should be understood and tracked.

### 1.2 External availability check

```bash
# Run on local client machine
curl -I https://yourdomain.com
```

Expected:

- HTTP status 200 or expected redirect pattern.

## 2. Weekly Maintenance (20-30 minutes)

### 2.1 Patch and security controls status

```bash
# Run on ADLA-VM
sudo systemctl status unattended-upgrades --no-pager
sudo tail -n 200 /var/log/unattended-upgrades/unattended-upgrades.log
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

### 2.2 NGINX and system log review

```bash
# Run on ADLA-VM
sudo journalctl -u nginx --since "-7 days" --no-pager | tail -n 300
sudo tail -n 200 /var/log/nginx/error.log
sudo tail -n 200 /var/log/nginx/access.log
```

### 2.3 Disk and memory pressure check

```bash
# Run on ADLA-VM
df -h
df -i
free -h
```

Action thresholds:

- If root filesystem usage is above 80 percent, investigate and clean up.
- If inode usage is high, investigate logs and temporary files.

## 3. Monthly Maintenance (30-45 minutes)

### 3.1 Dry-run critical maintenance paths

```bash
# Run on ADLA-VM
sudo unattended-upgrade --dry-run --debug
sudo certbot renew --dry-run
sudo nginx -t
```

### 3.2 Package and kernel verification

```bash
# Run on ADLA-VM
apt list --upgradable
uname -r
```

### 3.3 TLS expiry and certificate health

```bash
# Run on local client machine
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

Target:

- Certificate should have at least 21 days remaining at review time.

### 3.4 GitHub Actions deployment validation

```bash
# Run on local admin machine
# Validate latest workflow run in GitHub UI and ensure deploy-site workflow succeeded.
```

If the last deployment failed:

- Review workflow logs.
- Validate VM connectivity and sudoers permissions for deploy user.

## 4. Quarterly Maintenance (60 minutes)

### 4.1 Access and hardening review

```bash
# Run on ADLA-VM
sudo grep -E '^(PermitRootLogin|PasswordAuthentication|MaxAuthTries)' /etc/ssh/sshd_config
sudo -l -U Admin-ADLA
```

Verify:

- SSH hardening values are unchanged.
- Sudoers permissions remain least-privilege.

### 4.2 NSG IP whitelisting review

```bash
# Run on local admin machine (Azure CLI)
az network nsg rule list --resource-group ADLA-RG --nsg-name ADLA-NSG --output table
az network nsg rule show --resource-group ADLA-RG --nsg-name ADLA-NSG --name ADLA-NSG-ALLOW-SSH --output json | jq '.sourceAddressPrefix'
```

Verify:

- NSG rule `ADLA-NSG-ALLOW-SSH` exists with source IP restricted to authorized admin machine(s).
- HTTP/HTTPS rules (`ADLA-NSG-ALLOW-HTTP-HTTPS`) are present.
- No other unexpected inbound rules exist.

### 4.3 Fail2Ban effectiveness spot-check

```bash
# Run on ADLA-VM
sudo fail2ban-client status
sudo grep -i "Ban\|Unban" /var/log/fail2ban.log | tail -n 50
```

## 5. Semi-Annual Maintenance (90 minutes)

### 5.1 Restore readiness drill

```bash
# Run on ADLA-VM
sudo tar -czf /root/site-backup-$(date +%F-%H%M).tgz /var/www/site /etc/nginx
sudo tar -tzf /root/site-backup-$(date +%F-%H%M).tgz | head -n 30
```

Note:

- Perform at least one documented restore simulation in a safe environment.

### 5.2 Dependency and policy review

- Re-evaluate whether low-cost architecture is still appropriate.
- Reassess if WAF, Bastion, or App Gateway is now justified by risk/traffic.

## 6. Event-Driven Tasks

### 6.1 After every deployment

```bash
# Run on ADLA-VM
sudo nginx -t
sudo systemctl status nginx --no-pager
sudo journalctl -u nginx --since "-30 min" --no-pager
```

```bash
# Run on local client machine
curl -I https://yourdomain.com
```

### 6.2 After security-relevant incident

```bash
# Run on ADLA-VM
date
uname -a
sudo systemctl status nginx fail2ban ssh --no-pager
sudo fail2ban-client status
sudo journalctl -u nginx --since "-2 hours" --no-pager > /tmp/nginx-incident.log
sudo journalctl -u fail2ban --since "-2 hours" --no-pager > /tmp/fail2ban-incident.log
```

## 7. Maintenance Record Template

Use this template after each maintenance session:

- Date and UTC time:
- Operator:
- Frequency bucket (daily/weekly/monthly/quarterly/semi-annual/event-driven):
- Tasks executed:
- Findings:
- Actions taken:
- Follow-up owner and due date:
