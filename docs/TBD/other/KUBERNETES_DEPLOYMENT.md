# Kubernetes Deployment Guide

## Overview

This guide covers the deployment of the Playwright & Selenium Learning Platform to Kubernetes, including microservices, databases, monitoring, and autoscaling.

## Architecture

The platform uses a microservices architecture with the following components:

### Services
- **API Gateway** - Main entry point for all requests
- **Auth Service** - Authentication and authorization
- **Content Service** - Content management and delivery
- **Analytics Service** - User analytics and reporting
- **Notification Service** - Email and push notifications

### Databases
- **MongoDB** - Primary database (replica set with 3 nodes)
- **Redis Cluster** - Caching layer (6 nodes)
- **ClickHouse** - Analytics database

### Message Brokers
- **RabbitMQ** - Task queue for background jobs
- **Kafka** - Event streaming platform

### Monitoring
- **Prometheus** - Metrics collection
- **Grafana** - Visualization and dashboards
- **Jaeger** - Distributed tracing

## Prerequisites

1. **Kubernetes Cluster** (v1.24+)
   - Managed: EKS, GKE, or AKS
   - Self-hosted: kubeadm, k3s, or kind

2. **kubectl** CLI tool installed

3. **Helm** (v3.0+) for package management

4. **Container Registry**
   - Docker Hub, ECR, GCR, or ACR
   - Images must be built and pushed

5. **Domain Names**
   - api.playwright-learning.com
   - grafana.playwright-learning.com
   - metrics.playwright-learning.com

6. **SSL Certificates**
   - Managed by cert-manager or provided manually

## Pre-deployment Steps

### 1. Build and Push Container Images

```bash
# Build images
docker build -t playwright-learning/api-gateway:latest -f backend/Dockerfile.production .
docker build -t playwright-learning/auth-service:latest -f backend/Dockerfile.production --build-arg SERVICE_NAME=auth-service .
docker build -t playwright-learning/content-service:latest -f backend/Dockerfile.production --build-arg SERVICE_NAME=content-service .
docker build -t playwright-learning/analytics-service:latest -f backend/Dockerfile.production --build-arg SERVICE_NAME=analytics-service .
docker build -t playwright-learning/notification-service:latest -f backend/Dockerfile.production --build-arg SERVICE_NAME=notification-service .

# Tag for your registry
docker tag playwright-learning/api-gateway:latest YOUR_REGISTRY/playwright-learning/api-gateway:latest

# Push to registry
docker push YOUR_REGISTRY/playwright-learning/api-gateway:latest
```

### 2. Set Environment Variables

```bash
export MONGODB_URI="mongodb://username:password@host:27017/db"
export JWT_SECRET="your-secret-key"
export JWT_REFRESH_SECRET="your-refresh-secret"
export RABBITMQ_URL="amqp://user:pass@host:5672"
export SENDGRID_API_KEY="your-sendgrid-key"
export AWS_ACCESS_KEY_ID="your-aws-key"
export AWS_SECRET_ACCESS_KEY="your-aws-secret"
export MONGODB_USERNAME="admin"
export MONGODB_PASSWORD="secure-password"
```

### 3. Update Image References

Edit all deployment YAML files and update image references:

```yaml
image: YOUR_REGISTRY/playwright-learning/api-gateway:latest
```

## Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# Make script executable
chmod +x scripts/deploy-kubernetes.sh

# Deploy everything
./scripts/deploy-kubernetes.sh deploy

# With monitoring stack
DEPLOY_MONITORING=true ./scripts/deploy-kubernetes.sh deploy
```

### Option 2: Manual Deployment

#### Step 1: Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

#### Step 2: Create Secrets

```bash
kubectl create secret generic app-secrets -n playwright-learning \
  --from-literal=mongodb_uri="$MONGODB_URI" \
  --from-literal=jwt_secret="$JWT_SECRET" \
  --from-literal=jwt_refresh_secret="$JWT_REFRESH_SECRET" \
  --from-literal=rabbitmq_url="$RABBITMQ_URL" \
  --from-literal=sendgrid_api_key="$SENDGRID_API_KEY"

kubectl create secret generic aws-secrets -n playwright-learning \
  --from-literal=access_key_id="$AWS_ACCESS_KEY_ID" \
  --from-literal=secret_access_key="$AWS_SECRET_ACCESS_KEY"

kubectl create secret generic mongodb-secrets -n playwright-learning \
  --from-literal=username="$MONGODB_USERNAME" \
  --from-literal=password="$MONGODB_PASSWORD"
```

#### Step 3: Apply ConfigMaps

```bash
kubectl apply -f k8s/configmaps/
```

#### Step 4: Deploy Databases

```bash
# MongoDB
kubectl apply -f k8s/deployments/mongodb.yaml
kubectl wait --for=condition=ready pod -l app=mongodb -n playwright-learning --timeout=300s

# Redis Cluster
kubectl apply -f k8s/deployments/redis-cluster.yaml
kubectl wait --for=condition=ready pod -l app=redis-cluster -n playwright-learning --timeout=300s

# Initialize Redis Cluster
kubectl exec -it redis-cluster-0 -n playwright-learning -- redis-cli --cluster create \
  $(kubectl get pods -l app=redis-cluster -n playwright-learning -o jsonpath='{range.items[*]}{.status.podIP}:6379 {end}') \
  --cluster-replicas 1 --cluster-yes
```

#### Step 5: Deploy Services

```bash
kubectl apply -f k8s/deployments/auth-service.yaml
kubectl apply -f k8s/deployments/content-service.yaml
kubectl apply -f k8s/deployments/analytics-service.yaml
kubectl apply -f k8s/deployments/notification-service.yaml
kubectl apply -f k8s/deployments/api-gateway.yaml
```

#### Step 6: Create Services

```bash
kubectl apply -f k8s/services/
```

#### Step 7: Apply Ingress

```bash
# Install NGINX Ingress Controller (if not installed)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx -n playwright-learning

# Apply ingress configuration
kubectl apply -f k8s/ingress/
```

#### Step 8: Configure Autoscaling

```bash
# Install Metrics Server (if not installed)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Apply HPA
kubectl apply -f k8s/hpa/
```

#### Step 9: Deploy Monitoring (Optional)

```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus Stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace playwright-learning \
  --values monitoring/prometheus-values.yaml

# Install Jaeger
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/crds/jaegertracing.io_jaegers_crd.yaml
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/service_account.yaml
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/role.yaml
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/role_binding.yaml
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/operator.yaml
```

## Verification

### Check Pod Status

```bash
kubectl get pods -n playwright-learning
```

Expected output:
```
NAME                                   READY   STATUS    RESTARTS   AGE
api-gateway-xxxxx                      1/1     Running   0          5m
auth-service-xxxxx                     1/1     Running   0          5m
content-service-xxxxx                  1/1     Running   0          5m
analytics-service-xxxxx                1/1     Running   0          5m
notification-service-xxxxx             1/1     Running   0          5m
mongodb-0                              2/2     Running   0          10m
mongodb-1                              2/2     Running   0          10m
mongodb-2                              2/2     Running   0          10m
redis-cluster-0                        1/1     Running   0          10m
redis-cluster-1                        1/1     Running   0          10m
...
```

### Check Services

```bash
kubectl get svc -n playwright-learning
```

### Check Ingress

```bash
kubectl get ingress -n playwright-learning
```

### Check HPA Status

```bash
kubectl get hpa -n playwright-learning
```

### Test Endpoints

```bash
# Health check
curl https://api.playwright-learning.com/health

# Metrics
curl http://metrics.playwright-learning.com/metrics

# Grafana
open https://grafana.playwright-learning.com
```

## Scaling

### Manual Scaling

```bash
# Scale a deployment
kubectl scale deployment api-gateway -n playwright-learning --replicas=5

# Scale all backend services
kubectl scale deployment auth-service content-service analytics-service notification-service \
  -n playwright-learning --replicas=3
```

### Autoscaling

HPA automatically scales based on:
- CPU utilization (target: 70%)
- Memory utilization (target: 80%)
- Custom metrics (requests per second)

View HPA status:
```bash
kubectl get hpa -n playwright-learning -w
```

## Rolling Updates

### Zero-Downtime Deployment

```bash
# Update image
kubectl set image deployment/api-gateway api-gateway=playwright-learning/api-gateway:v2 -n playwright-learning

# Check rollout status
kubectl rollout status deployment/api-gateway -n playwright-learning

# View rollout history
kubectl rollout history deployment/api-gateway -n playwright-learning
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/api-gateway -n playwright-learning

# Rollback to specific revision
kubectl rollout undo deployment/api-gateway --to-revision=2 -n playwright-learning

# Or use the script
./scripts/deploy-kubernetes.sh rollback
```

## Monitoring

### Access Grafana

```bash
# Get Grafana password
kubectl get secret prometheus-grafana -n playwright-learning -o jsonpath="{.data.admin-password}" | base64 --decode

# Port forward (if not using ingress)
kubectl port-forward svc/prometheus-grafana 3000:80 -n playwright-learning

# Access: http://localhost:3000
# Username: admin
# Password: (from above command)
```

### Access Prometheus

```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n playwright-learning
# Access: http://localhost:9090
```

### Access Jaeger

```bash
kubectl port-forward svc/jaeger-query 16686:16686 -n playwright-learning
# Access: http://localhost:16686
```

## Troubleshooting

### Pod Not Starting

```bash
# Describe pod
kubectl describe pod POD_NAME -n playwright-learning

# View logs
kubectl logs POD_NAME -n playwright-learning

# View previous logs (if crashed)
kubectl logs POD_NAME -n playwright-learning --previous
```

### Service Connection Issues

```bash
# Test DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -n playwright-learning -- nslookup auth-service

# Test service connectivity
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n playwright-learning -- curl http://auth-service:3001/health
```

### Database Connection Issues

```bash
# Check MongoDB replica set status
kubectl exec -it mongodb-0 -n playwright-learning -- mongosh --eval "rs.status()"

# Check Redis cluster status
kubectl exec -it redis-cluster-0 -n playwright-learning -- redis-cli cluster info
```

### Resource Issues

```bash
# Check node resources
kubectl top nodes

# Check pod resources
kubectl top pods -n playwright-learning

# Describe node
kubectl describe node NODE_NAME
```

## Cleanup

### Remove Application

```bash
kubectl delete namespace playwright-learning
```

### Remove Monitoring Stack

```bash
helm uninstall prometheus -n playwright-learning
```

### Remove Ingress Controller

```bash
helm uninstall nginx-ingress -n playwright-learning
```

## Best Practices

1. **Always use resource limits** to prevent resource exhaustion
2. **Implement health checks** for all services
3. **Use rolling updates** for zero-downtime deployments
4. **Monitor everything** - metrics, logs, traces
5. **Backup regularly** - use automated backup scripts
6. **Test disaster recovery** procedures regularly
7. **Use namespaces** to isolate environments
8. **Implement network policies** for security
9. **Use secrets** for sensitive data
10. **Document everything** - deployment procedures, troubleshooting steps

## Security Recommendations

1. Enable RBAC and limit permissions
2. Use Pod Security Policies/Standards
3. Implement Network Policies
4. Scan images for vulnerabilities
5. Rotate secrets regularly
6. Use TLS for all communications
7. Enable audit logging
8. Implement rate limiting
9. Use Web Application Firewall
10. Regular security updates

## Support

For issues or questions:
- Check logs: `kubectl logs -n playwright-learning POD_NAME`
- Check events: `kubectl get events -n playwright-learning`
- Consult monitoring dashboards
- Review troubleshooting section
