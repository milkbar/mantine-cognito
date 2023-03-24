# mantine-cognito Terraform Module

The module in this directory provides an example for how to setup a cognito environment
compatible with the auth management provided by the package.

# Usage

This module can be called with a setup like this:

```hcl
provider "aws" {
  alias  = "east"
  region = "us-east-1"
}

resource "aws_route53_zone" "hosted_zone" {
  name    = "example.com"
  comment = "example.com"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ses_email_identity" "ses_mail_noreply_identify" {
  email = "no-reply@example.com"
}

module "auth" {
  source = "github.com/milkbar/mantine-cognito//infrastructure"

  app     = "my-app"
  env     = "prod"
  domain  = "example.com"
  ses_arn = aws_ses_email_identity.ses_mail_noreply_identify.arn
  zone_id = aws_route53_zone.hosted_zone.zone_id

  providers = {
    aws.east = aws.east
  }
}
```

This would create a cognito user pool and identity pool with a client UI hosted at "auth.prod.example.com".
