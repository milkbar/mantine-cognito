variable "app" {
  type        = string
  description = "Name of the application, e.g. \"my-app\"."
}

variable "env" {
  type        = string
  description = "Name of the application environment, e.g. \"prod\"."
}

variable "domain" {
  type        = string
  description = "Name of the hosted zone that will be used for the auth site, e.g. \"example.com\"."
}

variable "ses_arn" {
  type        = string
  description = "ARN of the ses verified identity to use to send emails"
}

variable "zone_id" {
  type        = string
  description = "The zone id for the route53 zone that will host the application."
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to created resources"
  default     = {}
}
