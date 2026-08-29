# Kubernetes Deployment for Cohort Platform

This directory contains modular Kubernetes manifests for deploying the entire Cohort Platform (Web BFF, Python Domain Service, PostgreSQL, Temporal Server, Temporal Worker, and Temporal Web UI).

---

## 📁 Resource Manifests

| File | Kind | Description |
| :--- | :--- | :--- |
| [`namespace.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/namespace.yaml) | `Namespace` | Dedicated `cohort` namespace |
| [`configmap.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/configmap.yaml) | `ConfigMap` | Non-sensitive environment variables and internal DNS endpoints |
| [`secret.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/secret.yaml) | `Secret` | Database credentials, Google Calendar keys, SMTP credentials |
| [`postgres-pvc.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/postgres-pvc.yaml) | `PersistentVolumeClaim` | 10Gi persistent storage for PostgreSQL |
| [`postgres-deployment.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/postgres-deployment.yaml) | `Deployment` | PostgreSQL 15 database instance |
| [`postgres-service.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/postgres-service.yaml) | `Service` | ClusterIP service routing port `5432` |
| [`temporal-deployment.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/temporal-deployment.yaml) | `Deployment` | Temporal Server instance (`auto-setup`) |
| [`temporal-service.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/temporal-service.yaml) | `Service` | ClusterIP service routing gRPC port `7233` |
| [`temporal-ui-deployment.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/temporal-ui-deployment.yaml) | `Deployment` | Temporal Web UI dashboard |
| [`temporal-ui-service.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/temporal-ui-service.yaml) | `Service` | ClusterIP service routing port `8080` |
| [`domain-service-deployment.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/domain-service-deployment.yaml) | `Deployment` | Python Domain Service (FastAPI + gRPC + SQLAlchemy) |
| [`domain-service-service.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/domain-service-service.yaml) | `Service` | ClusterIP routing gRPC `:50051` and HTTP `:8000` |
| [`temporal-worker-deployment.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/temporal-worker-deployment.yaml) | `Deployment` | Python Temporal background worker executing workflows |
| [`web-deployment.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/web-deployment.yaml) | `Deployment` | TanStack Start SSR Web Frontend (BFF) |
| [`web-service.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/web-service.yaml) | `Service` | ClusterIP routing port `3000` |
| [`ingress.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/ingress.yaml) | `Ingress` | NGINX Ingress routing `cohort.local` and `temporal.cohort.local` |
| [`kustomization.yaml`](file:///Users/dexter/Desktop/calendly-start/k8/kustomization.yaml) | `Kustomization` | Bundles all manifests for 1-step deployment |

---

## 🚀 Quick Start Deployment

### 1. Deploy All Resources with Kustomize
```bash
kubectl apply -k k8/
```

### 2. Verify Pod Status
```bash
kubectl get pods -n cohort
```

### 3. Port Forward for Local Access
```bash
# Web Frontend
kubectl port-forward svc/web 3000:3000 -n cohort

# Python FastAPI Docs
kubectl port-forward svc/domain-service 8000:8000 -n cohort

# Temporal Web UI
kubectl port-forward svc/temporal-ui 8088:8080 -n cohort
```
