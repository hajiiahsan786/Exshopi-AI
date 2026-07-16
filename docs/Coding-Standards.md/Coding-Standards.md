# Exshopi AI Coding Standards

**Version:** 1.0

**Project:** Exshopi AI

**Document:** Engineering Standards

**Last Updated:** July 2026

---

# Purpose

This document defines the engineering standards for Exshopi AI.

Every contributor, AI agent, and developer must follow these standards to ensure consistency, maintainability, scalability, and long-term quality.

Our goal is not just to write code.

Our goal is to build one of the world's highest-quality AI software platforms.

---

# Engineering Principles

Every line of code must be:

- Readable
- Maintainable
- Secure
- Tested
- Modular
- Scalable
- Documented
- Reusable

---

# Clean Code Philosophy

Code is written once.

Read thousands of times.

Always optimize for readability before cleverness.

Good code should explain itself.

---

# Project Structure

```
backend/

app/
│
├── api/
├── core/
├── config/
├── models/
├── schemas/
├── services/
├── repositories/
├── ai/
├── agents/
├── workflows/
├── middleware/
├── database/
├── security/
├── utils/
├── integrations/
├── events/
├── tasks/
└── main.py
```

Every folder has one responsibility.

---

# File Naming

Use lowercase.

Use underscores.

Examples

```
customer_service.py

inventory_service.py

finance_routes.py

marketing_agent.py
```

Never use:

```
CustomerService.py

Inventory.py

testFile.py
```

---

# Class Naming

Use PascalCase.

Example

```python
class CustomerService:
```

```python
class SalesAgent:
```

---

# Function Naming

Use snake_case.

Example

```python
create_customer()

calculate_profit()

generate_invoice()
```

---

# Variable Naming

Good

```python
customer_name

invoice_total

product_quantity
```

Bad

```python
x

temp

abc

test123
```

---

# Constants

UPPER_CASE

Example

```python
MAX_LOGIN_ATTEMPTS = 5
```

---

# Comments

Write comments only when necessary.

Avoid:

```python
# Increment i

i += 1
```

Good:

```python
# Calculate tax according to country-specific rules
```

---

# Function Rules

One function.

One responsibility.

Maximum

50 lines.

If longer

Split into smaller functions.

---

# Class Rules

Each class should have one responsibility.

Avoid large "God Classes."

---

# API Rules

Controllers should never contain business logic.

Controllers:

Receive Request

↓

Validate

↓

Call Service

↓

Return Response

Business logic belongs inside Services.

---

# Service Layer

Every business module has a dedicated service.

Example

```
CustomerService

InventoryService

SalesService

FinanceService
```

Services communicate with repositories.

---

# Repository Layer

Repositories communicate with databases.

No SQL inside controllers.

---

# Schema Layer

Use Pydantic models.

Separate

Input

Output

Update

Validation

---

# Error Handling

Never expose internal errors.

Bad

```
Database connection failed at line 233.
```

Good

```
Unable to process your request.
```

Log technical details internally.

---

# Logging

Every important action should be logged.

Examples

User Login

Order Created

Invoice Paid

AI Decision

Permission Changed

API Error

Robot Connected

---

# Security Rules

Never trust user input.

Always

Validate

Sanitize

Authorize

Authenticate

Encrypt sensitive information.

---

# Authentication

JWT

OAuth

Refresh Tokens

Role-Based Access Control

Future

Passkeys

---

# Password Rules

Never store passwords.

Always hash passwords using Argon2 or bcrypt.

---

# Database Rules

Never delete important records permanently.

Use

Soft Delete

```
deleted_at

deleted_by
```

---

# AI Rules

AI never directly accesses the database.

AI communicates only through approved services.

Every AI action is:

Logged

Permission Checked

Explainable

Auditable

---

# Multi-Tenant Rules

Every request includes

company_id

Every query filters by

company_id

Tenant isolation is mandatory.

---

# Testing Standards

Every module should include

Unit Tests

Integration Tests

API Tests

Performance Tests

Security Tests

---

# Performance Rules

Avoid unnecessary database queries.

Use caching.

Paginate large datasets.

Optimize indexes.

Never block the main thread.

---

# Git Workflow

Main

Production

Develop

Integration

Feature Branches

One feature per branch.

Examples

```
feature/authentication

feature/crm

feature/marketing-ai

feature/inventory
```

---

# Commit Messages

Good

```
Add customer authentication

Fix invoice calculation

Implement inventory service

Improve AI memory
```

Bad

```
update

fix

changes

done
```

---

# Pull Requests

Every pull request should include

Purpose

Screenshots (if UI)

Testing Notes

Checklist

Review

---

# Documentation

Every module must include

Purpose

Dependencies

API

Examples

Known Limitations

Future Improvements

---

# Code Review Checklist

Before merging code

- Builds successfully
- Tests pass
- No security issues
- Proper naming
- Documentation updated
- No duplicated logic
- Performance reviewed

---

# AI Engineering Principles

Every AI feature must be

Explainable

Reliable

Observable

Permission Controlled

Human Supervised

Business Focused

---

# Definition of Done

A feature is complete only when:

✓ Code Complete

✓ Tests Pass

✓ Documentation Updated

✓ API Documented

✓ Security Reviewed

✓ Logging Added

✓ Performance Reviewed

✓ Code Reviewed

---

# Exshopi Engineering Philosophy

We are not building a prototype.

We are building the foundation of the world's AI Workforce Platform.

Every decision should prioritize quality over speed.

Great software is built through discipline, consistency, and continuous improvement.

---

# Motto

**Write code today that your future team will be proud to maintain.**