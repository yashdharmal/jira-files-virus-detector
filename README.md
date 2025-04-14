# 🛡️ Jira Malware Scanner

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![VirusTotal API](https://img.shields.io/badge/VirusTotal-API-orange)](https://www.virustotal.com/gui/)
[![Jira API](https://img.shields.io/badge/Jira-API-blue)](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)

A robust Node.js application that automatically scans files uploaded to Jira tickets for malware using VirusTotal's API. If malicious content is detected, the file is automatically removed from the ticket to protect your organization.

## ✨ Features

- 🔍 Real-time file scanning using VirusTotal API
- 🚫 Automatic removal of malicious files
- 📝 Comprehensive logging system
- 🔒 Secure webhook handling
- ⚡ Fast and efficient processing
- 📊 Detailed error tracking

## 📋 Prerequisites

- Node.js (v14 or higher)
- A Jira instance with API access
- A VirusTotal API key
- A publicly accessible server to receive Jira webhooks

## 🚀 Quick Start

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/jira-malware-scanner.git
   cd jira-malware-scanner
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   JIRA_DOMAIN=your-jira-domain.atlassian.net
   JIRA_EMAIL=your-jira-email
   JIRA_API_TOKEN=your-jira-api-token
   VIRUSTOTAL_API_KEY=your-virustotal-api-key
   ```

4. Set up Jira webhook:
   - Navigate to Jira Settings > System > WebHooks
   - Add a new webhook
   - Set the URL to: `https://your-server/webhook/jira`
   - Select the "Attachment created" event
   - Save the webhook

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## 🔧 How it Works

1. 📤 File uploaded to Jira ticket
2. 🔄 Jira sends webhook to application
3. 📥 Application downloads file content
4. 🔍 File sent to VirusTotal for scanning
5. 🚫 If malware detected, file is automatically deleted
6. 📝 Process is logged for monitoring

## 🔒 Security Best Practices

- 🔑 Store API keys securely using environment variables
- 🔐 Use HTTPS for webhook endpoints
- 🔍 Implement webhook authentication
- 📊 Monitor application logs regularly
- 🔄 Keep dependencies updated
- 🛡️ Implement rate limiting for API calls

## 🚨 Error Handling

The application includes comprehensive error handling for:

- Failed webhook processing
- VirusTotal API errors
- Jira API errors
- File download issues
- Network connectivity problems
- Authentication failures

## 📝 Logging

The application logs the following events:

- Webhook reception
- File scanning results
- File deletion events
- Error messages
- API response times
- Security events

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [VirusTotal](https://www.virustotal.com/) for their malware scanning API
- [Atlassian](https://www.atlassian.com/) for Jira API
- All contributors who have helped improve this project
