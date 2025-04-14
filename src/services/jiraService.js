const axios = require("axios");

const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_DOMAIN = process.env.JIRA_DOMAIN;

async function getAttachmentContent(attachmentUrl) {
  try {
    // If a full URL is provided, use it directly
    if (
      attachmentUrl &&
      (attachmentUrl.startsWith("http://") ||
        attachmentUrl.startsWith("https://"))
    ) {
      const response = await axios.get(attachmentUrl, {
        responseType: "arraybuffer",
        auth: {
          username: JIRA_EMAIL,
          password: JIRA_API_TOKEN,
        },
      });
      return response.data;
    }
    // If it's an ID, construct the correct URL
    else if (attachmentUrl && !isNaN(attachmentUrl)) {
      const response = await axios.get(
        `https://${JIRA_DOMAIN}/rest/api/3/attachment/${attachmentUrl}/content`,
        {
          responseType: "arraybuffer",
          auth: {
            username: JIRA_EMAIL,
            password: JIRA_API_TOKEN,
          },
        }
      );
      return response.data;
    }
    // Handle the case where we have something else
    else {
      console.error("Invalid attachment URL or ID:", attachmentUrl);
      throw new Error("Invalid attachment URL or ID");
    }
  } catch (error) {
    console.error("Error downloading attachment:", error.message);
    throw error;
  }
}

async function deleteJiraAttachment(issueKey, attachmentId) {
  try {
    await axios.delete(
      `https://${JIRA_DOMAIN}/rest/api/3/attachment/${attachmentId}`,
      {
        auth: {
          username: JIRA_EMAIL,
          password: JIRA_API_TOKEN,
        },
      }
    );
  } catch (error) {
    console.error("Error deleting attachment:", error.message);
    throw error;
  }
}

async function testJiraConnection() {
  try {
    const response = await axios.get(
      `https://${JIRA_DOMAIN}/rest/api/3/myself`,
      {
        auth: {
          username: JIRA_EMAIL,
          password: JIRA_API_TOKEN,
        },
      }
    );
    console.log("Authentication successful:", response.data.displayName);
    return true;
  } catch (error) {
    console.error("Authentication failed:", error.message);
    return false;
  }
}

async function addCommentToJiraIssue(issueKey, commentText) {
  try {
    await axios.post(
      `https://${JIRA_DOMAIN}/rest/api/2/issue/${issueKey}/comment`,
      {
        body: commentText,
      },
      {
        auth: {
          username: JIRA_EMAIL,
          password: JIRA_API_TOKEN,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Comment added successfully");
    return true;
  } catch (error) {
    console.error("Error adding comment:", error.message);
    return false;
  }
}

module.exports = {
  getAttachmentContent,
  deleteJiraAttachment,
  testJiraConnection,
  addCommentToJiraIssue,
};
