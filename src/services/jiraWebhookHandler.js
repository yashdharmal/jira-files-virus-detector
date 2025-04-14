const crypto = require("crypto");
const { getAttachmentContent } = require("./jiraService");

async function handleJiraWebhook(webhookData) {
  try {
    // Extract basic information
    let attachments = [];
    let issueKey = "";

    // Case 1: Attachment was just created
    if (
      webhookData.webhookEvent === "attachment_created" &&
      webhookData.attachment
    ) {
      attachments = [webhookData.attachment];
      issueKey = webhookData.issue?.key || "";
    }
    // Case 2: Issue was created or updated with attachments
    else if (webhookData.issue?.key) {
      issueKey = webhookData.issue.key;
      attachments = webhookData.issue.fields?.attachment || [];
    }

    // Exit early if no attachments or issue key
    if (attachments.length === 0 || !issueKey) {
      return null;
    }

    // Process all attachments instead of just the first one
    const attachmentDataPromises = attachments.map(async (attachment) => {
      try {
        const attachmentSource =
          attachment.content || attachment.self || attachment.id;
        const fileContent = await getAttachmentContent(attachmentSource);

        // Calculate hash for security checking
        const fileHash = crypto
          .createHash("md5")
          .update(fileContent)
          .digest("hex");

        // Return data for this attachment
        return {
          attachment,
          issueKey,
          fileInfo: {
            id: attachment.id,
            name: attachment.filename,
            size: attachment.size || 0,
            mimeType: attachment.mimeType || "application/octet-stream",
            hash: fileHash,
          },
          fileContent,
        };
      } catch (error) {
        console.error(
          `Error processing attachment ${attachment.filename}:`,
          error
        );
        return null; // Skip this attachment if there's an error
      }
    });

    // Wait for all attachments to be processed
    const attachmentDataResults = await Promise.all(attachmentDataPromises);

    // Filter out any null results (errors)
    return attachmentDataResults.filter((result) => result !== null);
  } catch (error) {
    console.error("Error handling Jira webhook:", error);
    throw error;
  }
}

module.exports = {
  handleJiraWebhook,
};
