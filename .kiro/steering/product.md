# Product Overview

The Customer Portal is a web-based application that serves as the primary interface for customers to interact with a code analysis and certification service.

## Core Functionality

- User authentication and account management via Auth0
- Subscription and payment processing through Stripe
- Secure file upload to S3 for code analysis
- Real-time tracking of analysis progress
- Secure certificate download upon completion

## Key User Flows

1. **Onboarding**: Sign up → Email verification → Subscribe to plan → Upload code
2. **Analysis**: Upload file → Track real-time status → Download certificate
3. **Account Management**: Update profile, change password, manage subscription and payment methods

## Business Context

The portal enables customers to submit code for security analysis and receive compliance certificates. It integrates with backend analysis services through API Gateway and uses AWS infrastructure for scalability and security.
