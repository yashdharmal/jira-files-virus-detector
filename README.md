# Jira Malware Scanner

This Node.js application monitors a Jira instance for file uploads and automatically checks them against VirusTotal for malware. If a malicious file is detected, it is automatically deleted from the Jira ticket.

## Prerequisites

- Node.js (v14 or higher)
- A Jira instance with API access
- A VirusTotal API key
- A publicly accessible server to receive Jira webhooks

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   JIRA_DOMAIN=your-jira-domain.atlassian.net
   JIRA_EMAIL=your-jira-email
   JIRA_API_TOKEN=your-jira-api-token
   VIRUSTOTAL_API_KEY=your-virustotal-api-key
   ```

4. Set up a Jira webhook:
   - Go to Jira Settings > System > WebHooks
   - Add a new webhook
   - Set the URL to: `https://your-server/webhook/jira`
   - Select the "Attachment created" event
   - Save the webhook

## Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## How it Works

1. When a file is uploaded to a Jira ticket, Jira sends a webhook to this application
2. The application downloads the file content
3. The file is sent to VirusTotal for scanning
4. If VirusTotal detects malware, the file is automatically deleted from the Jira ticket
5. The process is logged for monitoring

## Security Considerations

- Store your API keys securely
- Use HTTPS for your webhook endpoint
- Consider implementing webhook authentication
- Monitor the application logs for any issues

## Error Handling

The application includes error handling for:

- Failed webhook processing
- VirusTotal API errors
- Jira API errors
- File download issues

## Logging

The application logs important events to the console, including:

- Webhook received
- File scanning results
- File deletion events
- Error messages
