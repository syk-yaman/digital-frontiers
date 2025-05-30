# Deployment Notes

The platform is deployed using the following stack:

- **AWS EC2**: Hosts Docker containers for backend, frontend, and database.
- **AWS SES**: Handles transactional and notification emails.
- **Cloudflare**: Sits in front of the reverse proxy for DNS, SSL, and security.
- **Nginx Proxy Manager**: Used as a reverse proxy to route traffic to the correct services.

## EC2 Tiers & Regions

Currently, the platform runs on an xlarge EC2 instance with 16 GB of RAM. This is sufficient for the expected low user numbers at present, and there are no immediate plans to upgrade.

The deployment uses the `us-east-1` AWS region, which is the most cost-effective option. However, this region does not provide optimal performance for users based in London, as it introduces higher latency.

If user numbers grow significantly, or if data protection requirements (such as GDPR or UK-specific regulations) become more stringent, it may be necessary to migrate to a UK or EU region (e.g., `eu-west-2` for London). This would improve performance for UK-based users and ensure compliance with local data protection laws, but would also increase hosting costs.

## General Notes

- **Backups**: Ensure regular database backups and consider multi-AZ deployment for high availability.
- **Security**: Use security groups, Cloudflare firewall rules, and keep all Docker images up to date.
- **Reverse Proxy**: Nginx Proxy Manager is our reverse proxy for now. SSL is being handeled from Cloudflare side.
