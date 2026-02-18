#!/bin/bash
# Kubernetes Deployment Script
# Automated deployment of Playwright Learning Platform to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="playwright-learning"
KUBECTL="kubectl"
CONTEXT="${KUBE_CONTEXT:-production}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Please install kubectl."
        exit 1
    fi

    if ! command -v helm &> /dev/null; then
        log_warn "helm not found. Some features may not work."
    fi

    log_info "Dependencies check passed"
}

set_context() {
    log_info "Setting Kubernetes context to $CONTEXT..."
    $KUBECTL config use-context $CONTEXT
}

create_namespace() {
    log_info "Creating namespace $NAMESPACE..."
    $KUBECTL apply -f k8s/namespace.yaml
}

create_secrets() {
    log_info "Creating secrets..."

    # Check if secrets already exist
    if $KUBECTL get secret app-secrets -n $NAMESPACE &> /dev/null; then
        log_warn "Secrets already exist. Skipping..."
        return
    fi

    # Create secrets from environment variables or prompt
    $KUBECTL create secret generic app-secrets -n $NAMESPACE \
        --from-literal=mongodb_uri="${MONGODB_URI}" \
        --from-literal=jwt_secret="${JWT_SECRET}" \
        --from-literal=jwt_refresh_secret="${JWT_REFRESH_SECRET}" \
        --from-literal=rabbitmq_url="${RABBITMQ_URL}" \
        --from-literal=sendgrid_api_key="${SENDGRID_API_KEY}" \
        --from-literal=twilio_account_sid="${TWILIO_ACCOUNT_SID}" \
        --from-literal=twilio_auth_token="${TWILIO_AUTH_TOKEN}"

    $KUBECTL create secret generic aws-secrets -n $NAMESPACE \
        --from-literal=access_key_id="${AWS_ACCESS_KEY_ID}" \
        --from-literal=secret_access_key="${AWS_SECRET_ACCESS_KEY}"

    $KUBECTL create secret generic mongodb-secrets -n $NAMESPACE \
        --from-literal=username="${MONGODB_USERNAME}" \
        --from-literal=password="${MONGODB_PASSWORD}"

    log_info "Secrets created successfully"
}

apply_configmaps() {
    log_info "Applying ConfigMaps..."
    $KUBECTL apply -f k8s/configmaps/
}

deploy_databases() {
    log_info "Deploying databases..."

    # Deploy MongoDB
    $KUBECTL apply -f k8s/deployments/mongodb.yaml
    log_info "Waiting for MongoDB to be ready..."
    $KUBECTL wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=300s

    # Deploy Redis Cluster
    $KUBECTL apply -f k8s/deployments/redis-cluster.yaml
    log_info "Waiting for Redis to be ready..."
    $KUBECTL wait --for=condition=ready pod -l app=redis-cluster -n $NAMESPACE --timeout=300s

    log_info "Databases deployed successfully"
}

deploy_services() {
    log_info "Deploying microservices..."

    # Deploy all services
    $KUBECTL apply -f k8s/deployments/auth-service.yaml
    $KUBECTL apply -f k8s/deployments/content-service.yaml
    $KUBECTL apply -f k8s/deployments/analytics-service.yaml
    $KUBECTL apply -f k8s/deployments/notification-service.yaml
    $KUBECTL apply -f k8s/deployments/api-gateway.yaml

    log_info "Waiting for services to be ready..."
    $KUBECTL wait --for=condition=ready pod -l tier=backend -n $NAMESPACE --timeout=300s
    $KUBECTL wait --for=condition=ready pod -l tier=gateway -n $NAMESPACE --timeout=300s

    log_info "Services deployed successfully"
}

apply_services() {
    log_info "Applying Kubernetes Services..."
    $KUBECTL apply -f k8s/services/
}

apply_ingress() {
    log_info "Applying Ingress configuration..."
    $KUBECTL apply -f k8s/ingress/
}

apply_hpa() {
    log_info "Applying Horizontal Pod Autoscalers..."
    $KUBECTL apply -f k8s/hpa/
}

deploy_monitoring() {
    log_info "Deploying monitoring stack..."

    # Install Prometheus using Helm
    if command -v helm &> /dev/null; then
        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
        helm repo update

        helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
            --namespace $NAMESPACE \
            --values monitoring/prometheus-values.yaml \
            --wait

        log_info "Monitoring stack deployed successfully"
    else
        log_warn "Helm not found. Skipping monitoring deployment."
    fi
}

verify_deployment() {
    log_info "Verifying deployment..."

    # Check pod status
    log_info "Pod Status:"
    $KUBECTL get pods -n $NAMESPACE

    # Check service status
    log_info "Service Status:"
    $KUBECTL get svc -n $NAMESPACE

    # Check ingress status
    log_info "Ingress Status:"
    $KUBECTL get ingress -n $NAMESPACE

    # Check HPA status
    log_info "HPA Status:"
    $KUBECTL get hpa -n $NAMESPACE

    log_info "Deployment verification complete"
}

rollback() {
    log_warn "Rolling back deployment..."

    $KUBECTL rollout undo deployment/api-gateway -n $NAMESPACE
    $KUBECTL rollout undo deployment/auth-service -n $NAMESPACE
    $KUBECTL rollout undo deployment/content-service -n $NAMESPACE
    $KUBECTL rollout undo deployment/analytics-service -n $NAMESPACE
    $KUBECTL rollout undo deployment/notification-service -n $NAMESPACE

    log_info "Rollback complete"
}

# Main deployment flow
main() {
    log_info "Starting Kubernetes deployment..."

    check_dependencies
    set_context
    create_namespace
    create_secrets
    apply_configmaps
    deploy_databases
    deploy_services
    apply_services
    apply_ingress
    apply_hpa

    if [ "$DEPLOY_MONITORING" = "true" ]; then
        deploy_monitoring
    fi

    verify_deployment

    log_info "Deployment complete!"
    log_info "Access the application at: https://www.playwright-learning.com"
    log_info "Access Grafana at: https://grafana.playwright-learning.com"
}

# Handle command line arguments
case "${1}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    verify)
        verify_deployment
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|verify}"
        echo ""
        echo "  deploy   - Deploy the application to Kubernetes"
        echo "  rollback - Rollback the last deployment"
        echo "  verify   - Verify the deployment status"
        exit 1
        ;;
esac
