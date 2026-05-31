# Troubleshooting and Maintenance Guide

## 1. Service Status Checks
```bash
systemctl status nginx
systemctl status fail2ban
systemctl status ssh
```

## 2. NGINX Troubleshooting

### Config validation
```bash
sudo nginx -t
```

### Restart/Reload
```bash
sudo systemctl restart nginx
sudo systemctl reload nginx
```

### Error logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Access logs
```bash
sudo tail -f /var/log/nginx/access.log
```

### Common issues
- Permission denied on /var/www
- Wrong root path
- Syntax errors in config

---

## 3. SSL / HTTPS Issues

### Check certificate
```bash
sudo certbot certificates
```

### Renew manually
```bash
sudo certbot renew --dry-run
```

### Verify config references
```bash
ls /etc/letsencrypt/live/yourdomain.com/
```

### Restart after renewal
```bash
sudo systemctl reload nginx
```

---

## 4. DNS Validation

### Check resolution
```bash
nslookup yourdomain.com
```

### Check HTTP/HTTPS
```bash
curl -I http://yourdomain.com
curl -I https://yourdomain.com
```

---

## 5. Git Deployment Issues

### Test manual deploy
```bash
bash ~/deploy.sh
```

### Check repo status
```bash
cd /var/www/site
git status
```

### Fix permissions
```bash
sudo chown -R www-data:www-data /var/www/site
```

### Check SSH connectivity
```bash
ssh -T git@github.com
```

---

## 6. Fail2Ban Monitoring

### Check status
```bash
sudo fail2ban-client status
```

### Check SSH jail
```bash
sudo fail2ban-client status sshd
```

### View banned IPs
```bash
sudo fail2ban-client get sshd banned
```

### Unban IP
```bash
sudo fail2ban-client set sshd unbanip <IP>
```

### Logs
```bash
sudo tail -f /var/log/fail2ban.log
```

---

## 7. System Logs
```bash
journalctl -xe
journalctl -u nginx
journalctl -u fail2ban
```

---

## 8. Network / Connectivity

### Check open ports
```bash
sudo ss -tulnp
```

### Test connectivity
```bash
curl localhost
curl localhost:80
curl localhost:443
```

---

## 9. Resource Usage

### CPU and memory
```bash
top
htop
```

### Disk usage
```bash
df -h
```

### Inodes
```bash
df -i
```

---

## 10. NGINX Performance

### Active connections
```bash
sudo netstat -an | grep :80 | wc -l
```

### Logs for spikes
```bash
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head
```

---

## 11. Security Checks

### Active bans
```bash
sudo fail2ban-client status
```

### Review suspicious traffic
```bash
grep "403" /var/log/nginx/access.log
```

---

## 12. Regular Maintenance Tasks

### Update system
```bash
sudo apt update
sudo apt upgrade -y
```

### Check certificate renewal service
```bash
systemctl list-timers | grep certbot
```

### Clean logs
```bash
sudo journalctl --vacuum-time=7d
```

---

## 13. Recovery Steps

### Restart all services
```bash
sudo systemctl restart nginx
sudo systemctl restart fail2ban
sudo systemctl restart ssh
```

### Validate full stack
```bash
curl -I https://yourdomain.com
```

---

## 14. Quick Health Check Script
```bash
#!/bin/bash
curl -Is https://yourdomain.com | head -n 1
systemctl is-active nginx
systemctl is-active fail2ban
```
