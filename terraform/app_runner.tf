# --- IAM Role ---
# App RunnerがECRから画像をプルするための権限

resource "aws_iam_role" "apprunner_access_role" {
  name = "AppRunnerECRAccessRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_access_policy" {
  role       = aws_iam_role.apprunner_access_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# --- VPC Connector ---
# App RunnerがVPC内のRDSにアクセスするためのコネクタ

# resource "aws_apprunner_vpc_connector" "connector" {
#   vpc_connector_name = "${var.project_name}-connector"
#   subnets            = aws_subnet.private[*].id
#   security_groups    = [aws_security_group.app_connector_sg.id]
# }

# --- App Runner Service ---

resource "aws_apprunner_service" "backend" {
  service_name = "${var.project_name}-service"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_access_role.arn
    }

    image_repository {
      image_identifier      = "${aws_ecr_repository.backend.repository_url}:latest"
      image_repository_type = "ECR"
      
      image_configuration {
        port = "8080"
        
        runtime_environment_variables = {
          GEMINI_API_KEY  = var.gemini_api_key
          DATABASE_URL    = "postgres://dummy:dummy@localhost:5432/dummy"
          AI_API_BASE_URL = var.ai_api_base_url
          AI_MODEL_NAME   = var.ai_model_name
          FRONTEND_ORIGIN = var.frontend_origin
          ARCH_DEFS_PATH  = var.arch_defs_path
        }
      }
    }
  }

#   network_configuration {
#     egress_configuration {
#       egress_type       = "VPC"
#       vpc_connector_arn = aws_apprunner_vpc_connector.connector.arn
#     }
#   }

  instance_configuration {
    cpu    = "1024"
    memory = "2048"
  }
  
  # IAMロールの作成待ち
  depends_on = [aws_iam_role_policy_attachment.apprunner_access_policy]
}

# 公開されたURLを出力
output "app_runner_url" {
  value = "https://${aws_apprunner_service.backend.service_url}"
}