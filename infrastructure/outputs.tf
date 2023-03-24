output "cognito_client_id" {
  value       = aws_cognito_user_pool_client.auth_user_pool_client.id
  description = "The client id of the cognito client. This is needed for the call to the login ui url."
}

output "cognito_client_url" {
  value       = "https://${aws_cognito_user_pool_domain.auth_user_pool_domain.domain}"
  description = "The url of the cognito client. This is needed for the call to the login ui."
}

output "cognito_user_pool_id" {
  value       = aws_cognito_user_pool.user_pool.id
  description = "The id of the cognito user pool."
}

output "cognito_identity_pool_id" {
  value       = aws_cognito_identity_pool.auth_identity_pool.id
  description = "The id of the cognito identity pool."
}

output "cognito_authenticated_role_id" {
  value       = aws_iam_role.authenticated.id
  description = "The id of the authenticated cognito role. Extra permissions for AWS access should be added to this role."
}
