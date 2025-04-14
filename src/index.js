require("dotenv").config();
const express = require("express");
const { handleJiraWebhook } = require("./services/jiraWebhookHandler");
const { scanFile, checkFileHash } = require("./services/virusTotalService");
const {
  deleteJiraAttachment,
  testJiraConnection,
  addCommentToJiraIssue,
} = require("./services/jiraService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Webhook endpoint to receive Jira events
app.post("/webhook/jira", async (req, res) => {
  try {
    // Step 1: Process the webhook data to get attachment details
    const attachmentDataArray = await handleJiraWebhook(req.body);

    // Skip if no attachment data found
    if (!attachmentDataArray || attachmentDataArray.length === 0) {
      return res.status(200).json({ message: "No attachments to process" });
    }

    // Keep track of processed files
    const processedFiles = [];
    const maliciousFiles = [];

    // Process each attachment
    for (const attachmentData of attachmentDataArray) {
      // Step 2: Extract the attachment information
      const { attachment, issueKey, fileInfo, fileContent } = attachmentData;

      // Step 3: First try to check if VirusTotal already knows this file by its hash
      let scanResult = await checkFileHash(fileInfo);

      // Step 4: If hash not found, upload and scan the full file
      if (!scanResult.hashFound && !scanResult.error) {
        scanResult = await scanFile(fileContent);
      }

      // Step 5: Handle scan errors
      if (scanResult.error) {
        console.error(
          `Error during scanning ${fileInfo.name}: ${scanResult.error}`
        );
        processedFiles.push({
          filename: fileInfo.name,
          status: "error",
          error: scanResult.error,
        });
        continue;
      }

      // Step 6: Delete malicious attachments
      if (scanResult.malicious) {
        try {
          // Get current timestamp
          const deletionTime = new Date().toLocaleString();

          // Delete the attachment
          await deleteJiraAttachment(issueKey, attachment.id);

          // Create comment with timestamp
          const comment = `Security Alert: Malicious file "${attachment.filename}" was deleted at ${deletionTime}. Hash: ${fileInfo.hash}`;

          // Add the comment to the ticket
          await addCommentToJiraIssue(issueKey, comment);

          console.log(`Malicious file deleted: ${attachment.filename}`);
          maliciousFiles.push(attachment.filename);
          processedFiles.push({
            filename: fileInfo.name,
            status: "deleted",
            malicious: true,
          });
        } catch (error) {
          console.error(
            `Failed to delete malicious file ${fileInfo.name}: ${error.message}`
          );
          processedFiles.push({
            filename: fileInfo.name,
            status: "error",
            error: `Failed to delete: ${error.message}`,
          });
        }
      } else {
        processedFiles.push({
          filename: fileInfo.name,
          status: "scanned",
          malicious: false,
        });
      }
    }

    // Step 7: Return success with processing details
    res.status(200).json({
      message: "Webhook processed successfully",
      processed: processedFiles,
      maliciousFilesRemoved: maliciousFiles.length,
      totalFilesProcessed: processedFiles.length,
    });
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a simple status endpoint
app.get("/status", (req, res) => {
  res.status(200).json({
    status: "Jira Malware Scanner is running",
    uptime: process.uptime(),
  });
});

// Test Jira connection
app.get("/test-jira", async (req, res) => {
  const connected = await testJiraConnection();
  res.status(200).json({
    connected,
    message: connected
      ? "Successfully connected to Jira"
      : "Failed to connect to Jira",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
