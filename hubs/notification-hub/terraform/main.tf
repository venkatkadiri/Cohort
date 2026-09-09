# 1. Managed User Assigned Identity for the service
resource "azurerm_user_assigned_identity" "identity" {
  name                = "cohort-${var.environment}-${var.service_name}-id"
  location            = var.location
  resource_group_name = var.resource_group_name

  tags = {
    Project     = "cohort"
    Service     = var.service_name
    Version     = var.service_version
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# 2. Azure Blob Storage (Conditionally provisioned based on service version / storage_backend)
locals {
  is_blob_storage      = var.storage_backend == "blob_storage"
  clean_name           = replace(var.service_name, "-", "")
  storage_account_name = substr("cohort${var.environment}${local.clean_name}st", 0, 24)
}

resource "azurerm_storage_account" "storage" {
  count                    = local.is_blob_storage ? 1 : 0
  name                     = local.storage_account_name
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    Project        = "cohort"
    Service        = var.service_name
    Version        = var.service_version
    Environment    = var.environment
    StorageBackend = var.storage_backend
    ManagedBy      = "Terraform"
  }
}

resource "azurerm_storage_container" "assets" {
  count                 = local.is_blob_storage ? 1 : 0
  name                  = "assets"
  storage_account_name  = azurerm_storage_account.storage[0].name
  container_access_type = "private"
}
