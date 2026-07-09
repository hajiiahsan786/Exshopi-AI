# Exshopi AI Database Design

**Version:** 1.0

**Project:** Exshopi AI

**Document:** Database Architecture

**Last Updated:** July 2026

---

# Overview

The Exshopi AI database is designed to support millions of businesses through a secure, scalable, multi-tenant architecture.

Every company has isolated business data while sharing the same application infrastructure.

The database is designed around business domains instead of individual screens or features.

---

# Database Goals

- Enterprise Ready
- AI First
- Multi Tenant
- Highly Scalable
- Highly Secure
- Fast
- Modular
- Future Proof

---

# Database Architecture

```
Application

↓

Business Services

↓

PostgreSQL

↓

Redis Cache

↓

Vector Database

↓

Object Storage
```

---

# Multi-Tenant Architecture

Every record belongs to a company.

```
Company

↓

Departments

↓

Users

↓

Customers

↓

Products

↓

Orders

↓

Finance

↓

AI Memory

↓

Reports
```

Every table will include:

- company_id
- created_at
- updated_at
- created_by
- updated_by

This ensures complete tenant isolation.

---

# Database Domains

The database is divided into logical domains.

---

# Core Platform

Tables

- companies
- company_settings
- branches
- departments
- users
- user_profiles
- roles
- permissions
- role_permissions
- user_roles
- sessions
- api_keys
- notifications
- activity_logs

---

# Authentication

Tables

- login_history
- refresh_tokens
- password_resets
- email_verifications
- mfa_devices

---

# CRM

Tables

- customers
- customer_addresses
- contacts
- leads
- opportunities
- pipelines
- pipeline_stages
- activities
- notes

---

# Product Management

Tables

- products
- product_categories
- brands
- product_images
- product_variants
- product_attributes
- suppliers

---

# Inventory

Tables

- warehouses
- warehouse_locations
- inventory
- inventory_transactions
- stock_movements
- purchase_orders
- transfers
- barcode_labels

---

# Sales

Tables

- quotations
- orders
- order_items
- invoices
- payments
- refunds
- shipping

---

# Finance

Tables

- accounts
- expenses
- revenue
- budgets
- transactions
- tax_rates
- payroll
- journals

---

# Accounting

Tables

- ledger_accounts
- journal_entries
- trial_balance
- balance_sheet
- profit_loss

---

# Human Resources

Tables

- employees
- attendance
- leave_requests
- recruitment
- interviews
- performance_reviews

---

# Marketing

Tables

- campaigns
- advertisements
- email_campaigns
- sms_campaigns
- social_posts
- seo_projects

---

# Customer Support

Tables

- tickets
- ticket_messages
- chatbot_sessions
- live_chat
- call_logs
- customer_feedback

---

# Project Management

Tables

- projects
- project_members
- milestones
- tasks
- task_comments

---

# Communication

Tables

- emails
- messages
- meetings
- calendars
- reminders

---

# Analytics

Tables

- dashboards
- reports
- kpi_metrics
- forecasts
- ai_insights

---

# AI Workforce

Tables

- ai_agents
- agent_roles
- agent_permissions
- agent_memory
- agent_tasks
- agent_decisions
- agent_logs
- agent_conversations
- agent_collaboration

---

# AI Memory

Tables

- knowledge_documents
- document_chunks
- embeddings
- ai_context
- ai_learning
- prompts
- responses

---

# Automation

Tables

- workflows
- workflow_steps
- triggers
- automations
- scheduled_jobs

---

# Computer Vision

Tables

- scanned_documents
- receipts
- invoices_scanned
- detected_objects
- face_records

---

# Robotics

Tables

- robots
- robot_tasks
- robot_locations
- robot_status
- robot_events

---

# Commerce

Tables

- stores
- shopping_carts
- wishlists
- coupons
- subscriptions

---

# API Platform

Tables

- webhooks
- api_logs
- integrations
- oauth_clients

---

# Administration

Tables

- audit_logs
- system_logs
- backups
- licenses
- subscriptions
- invoices_system

---

# Relationships

Company

↓

Departments

↓

Users

↓

Roles

↓

Permissions

↓

Business Modules

↓

AI Workforce

↓

Reports

Every business object belongs to a company.

---

# AI Relationships

Company

↓

Knowledge Base

↓

AI Memory

↓

AI Agents

↓

Tasks

↓

Results

↓

Analytics

The AI workforce never stores global business data.

Every company's AI learns only from that company's authorized information.

---

# Common Columns

Every major table includes:

- id
- company_id
- created_at
- updated_at
- created_by
- updated_by
- status
- is_active

---

# Indexing Strategy

Indexes will be created for:

- company_id
- email
- username
- phone
- product_sku
- barcode
- order_number
- invoice_number
- created_at
- status

This improves performance as the platform grows.

---

# Soft Delete

Business records will not be permanently deleted.

Instead:

```
deleted_at
deleted_by
```

This allows recovery and maintains audit history.

---

# Audit Trail

Critical business actions will be recorded.

Examples:

- User Login
- Order Created
- Invoice Paid
- AI Decision
- Inventory Updated
- Permission Changed

This provides transparency and accountability.

---

# Database Security

- Tenant Isolation
- Row-Level Authorization
- Encrypted Sensitive Data
- Secure Password Storage
- API Authentication
- Audit Logging
- Backup Strategy

---

# AI Data Policy

AI employees only access data they are explicitly authorized to use.

Every AI action must be:

- Logged
- Traceable
- Explainable
- Permission Checked

---

# Scalability Strategy

The database is designed to support:

- Millions of Companies
- Hundreds of Millions of Users
- Billions of Records
- Global Multi-Region Deployment

Future scaling options include:

- Read Replicas
- Database Partitioning
- Horizontal Scaling
- Distributed Caching

---

# Guiding Principle

The database is the foundation of Exshopi AI.

Every table must support:

- Business Growth
- AI Collaboration
- Enterprise Security
- Global Scalability
- Future Expansion

The database should evolve without breaking existing business operations.