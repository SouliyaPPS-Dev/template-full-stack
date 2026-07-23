terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name for resource tagging"
  default     = "mystore"
}

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_rds_cluster" "postgres" {
  cluster_identifier = "${var.project_name}-postgres"
  engine             = "aurora-postgresql"
  engine_version     = "16"
  database_name      = "app_main"
  master_username    = "app_user"
  master_password    = var.db_password
  skip_final_snapshot = true

  tags = {
    Project = var.project_name
  }
}

variable "db_password" {
  description = "Database password"
  sensitive   = true
}

output "ecs_cluster_arn" {
  value = aws_ecs_cluster.main.arn
}

output "rds_endpoint" {
  value = aws_rds_cluster.postgres.endpoint
}
