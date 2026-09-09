output "service_name" {
  description = "Name of the service"
  value       = var.service_name
}

output "service_version" {
  description = "Active version of the service"
  value       = var.service_version
}

output "storage_backend" {
  description = "Active storage strategy ('filesystem' or 'blob_storage')"
  value       = var.storage_backend
}

output "identity_id" {
  description = "Managed Identity Resource ID"
  value       = azurerm_user_assigned_identity.identity.id
}

output "identity_client_id" {
  description = "Managed Identity Client ID"
  value       = azurerm_user_assigned_identity.identity.client_id
}

output "storage_account_name" {
  description = "Azure Storage Account name (present when blob_storage is enabled)"
  value       = local.is_blob_storage ? azurerm_storage_account.storage[0].name : null
}

output "storage_container_name" {
  description = "Azure Blob Storage container name (present when blob_storage is enabled)"
  value       = local.is_blob_storage ? azurerm_storage_container.assets[0].name : null
}
