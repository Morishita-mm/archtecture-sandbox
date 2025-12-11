variable "project_name" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "ai_api_base_url" {
  description = "Base URL for the AI API"
  type        = string
  default     = "https://generativelanguage.googleapis.com"
}

variable "ai_model_name" {
  description = "Model name for the AI"
  type        = string
  default     = "gemini-2.5-flash"
}

variable "frontend_origin" {
  description = "Allowed CORS origin (e.g. http://localhost:5173 or CloudFront URL)"
  type        = string
}

variable "arch_defs_path" {
  description = "Path to the architecture definitions JSON file"
  type        = string
  default     = "./architecture_defs.json"
}