variable "service_name" {
  description = "Name of the service package"
  type        = string
  default     = "domain-hub"
}

variable "service_version" {
  description = "Semantic version of the service"
  type        = string
  default     = "1.0.0"
}

variable "environment" {
  description = "Deployment environment (dev, stage, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure Region/Location"
  type        = string
  default     = "westeurope"
}

variable "resource_group_name" {
  description = "Target Azure Resource Group"
  type        = string
  default     = "cohort-dev-rg"
}

variable "storage_backend" {
  description = "Storage strategy for service assets: 'filesystem' or 'blob_storage'"
  type        = string
  default     = "filesystem"

  validation {
    condition     = contains(["filesystem", "blob_storage"], var.storage_backend)
    error_message = "storage_backend must be either 'filesystem' or 'blob_storage'."
  }
}
