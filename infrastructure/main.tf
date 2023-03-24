locals {
  app_domain_name  = "${var.env}.${var.domain}"
  auth_domain_name = "auth.${local.app_domain_name}"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"

      # Require passing in a config for us-east-1 to create certs compatible with cognito
      configuration_aliases = [aws.east]
    }
  }

  required_version = ">= 1.2.0"
}
