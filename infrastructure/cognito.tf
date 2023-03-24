# Setup the user pool
resource "aws_cognito_user_pool" "user_pool" {
  name = "${var.app}-${var.env}"

  deletion_protection = "ACTIVE"
  mfa_configuration   = "OPTIONAL"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  software_token_mfa_configuration {
    enabled = true
  }

  email_configuration {
    email_sending_account  = "DEVELOPER"
    source_arn             = var.ses_arn
    reply_to_email_address = "noreply@${var.domain}"
  }

  username_configuration {
    case_sensitive = false
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_LINK"
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  password_policy {
    minimum_length                   = 8
    require_uppercase                = true
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 3
  }

  tags = var.tags
}

# Setup the auth domain
resource "aws_cognito_user_pool_domain" "auth_user_pool_domain" {
  domain          = local.auth_domain_name
  certificate_arn = aws_acm_certificate.auth_domain_cert.arn
  user_pool_id    = aws_cognito_user_pool.user_pool.id
}

resource "aws_route53_record" "auth_cognito_alias" {
  name    = aws_cognito_user_pool_domain.auth_user_pool_domain.domain
  type    = "A"
  zone_id = var.zone_id
  alias {
    evaluate_target_health = false
    name                   = aws_cognito_user_pool_domain.auth_user_pool_domain.cloudfront_distribution_arn
    # This is always the hosted zone ID when you create an alias record that routes traffic to a CloudFront distribution.
    zone_id = "Z2FDTNDATAQYW2"
  }
}

# Setup the client ui
resource "aws_cognito_user_pool_client" "auth_user_pool_client" {
  name         = "${var.app}-${var.env}-client"
  user_pool_id = aws_cognito_user_pool.user_pool.id

  enable_token_revocation              = true
  allowed_oauth_flows_user_pool_client = true
  callback_urls = [
    "https://${var.env}.${var.domain}",
    "http://localhost:3000",
  ]
  explicit_auth_flows          = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  allowed_oauth_flows          = ["code"]
  allowed_oauth_scopes         = ["email", "profile", "openid"]
  supported_identity_providers = ["COGNITO"]
}

// Setup the identity pool
resource "aws_cognito_identity_pool" "auth_identity_pool" {
  identity_pool_name               = "${var.app}-${var.env}-pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.auth_user_pool_client.id
    provider_name           = aws_cognito_user_pool.user_pool.endpoint
    server_side_token_check = false
  }

  tags = var.tags
}

resource "aws_cognito_identity_pool_roles_attachment" "auth_identity_pool_roles" {
  identity_pool_id = aws_cognito_identity_pool.auth_identity_pool.id

  roles = {
    "authenticated" = aws_iam_role.authenticated.arn
    # "unauthenticated" =
  }
}

// Permissions for authenticated and unauthenticated users
data "aws_iam_policy_document" "authenticated" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_identity_pool.cognito_identity_pool.id]
    }

    condition {
      test     = "ForAnyValue:StringLike"
      variable = "cognito-identity.amazonaws.com:amr"
      values   = ["authenticated"]
    }
  }
}

resource "aws_iam_role" "authenticated" {
  name               = "${var.app}-${var.env}-authenticated-role"
  assume_role_policy = data.aws_iam_policy_document.authenticated.json
}

data "aws_iam_policy_document" "authenticated_role_policy" {
  statement {
    effect = "Allow"

    actions = [
      "cognito-sync:*",
      "cognito-identity:*",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "authenticated" {
  name   = "${var.app}-${var.env}-authenticated-cognito-policy"
  role   = aws_iam_role.authenticated.id
  policy = data.aws_iam_policy_document.authenticated_role_policy.json
}

