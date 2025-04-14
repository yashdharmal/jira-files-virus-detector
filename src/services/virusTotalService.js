const axios = require("axios");
const FormData = require("form-data");

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VIRUSTOTAL_API_URL = "https://www.virustotal.com/vtapi/v2";

/**
 * Creates a standardized result object from scan data
 */
function createScanResult(report = {}, isError = false, errorMessage = "") {
  // Extract basic information or use defaults
  const positives = report.positives || 0;
  const total = report.total || 0;

  return {
    malicious: positives > 0,
    positives,
    total,
    scanDate: report.scan_date || null,
    permalink: report.permalink || null,
    ...(isError && { error: errorMessage }),
  };
}

/**
 * Checks if a file is malicious by its hash
 */
async function checkFileHash(fileInfo) {
  try {
    // Query VirusTotal database for this hash
    const response = await axios.get(`${VIRUSTOTAL_API_URL}/file/report`, {
      params: {
        apikey: VIRUSTOTAL_API_KEY,
        resource: fileInfo.hash,
      },
    });

    const data = response.data;

    // Hash found in database
    if (data.response_code === 1) {
      return {
        ...createScanResult(data),
        hashFound: true,
      };
    }

    // Hash not in database
    return {
      ...createScanResult(),
      hashFound: false,
      message: "File not found in VirusTotal database",
    };
  } catch (error) {
    console.error("VirusTotal hash check failed:", error.message);
    return {
      ...createScanResult({}, true, error.message),
      hashFound: false,
    };
  }
}

/**
 * Uploads and scans a file with VirusTotal
 */
async function scanFile(fileContent) {
  try {
    // Prepare file for upload
    const formData = new FormData();
    formData.append("apikey", VIRUSTOTAL_API_KEY);
    formData.append("file", fileContent, {
      filename: "scan_file",
      contentType: "application/octet-stream",
    });

    // Upload file to VirusTotal
    const uploadResponse = await axios.post(
      `${VIRUSTOTAL_API_URL}/file/scan`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          apikey: VIRUSTOTAL_API_KEY,
        },
      }
    );

    // Handle failed upload
    if (!uploadResponse.data?.resource) {
      return createScanResult({}, true, "Invalid upload response");
    }

    // Get resource ID for checking results
    const resourceId = uploadResponse.data.resource;

    // Wait and check results (first attempt)
    await new Promise((resolve) => setTimeout(resolve, 15000));
    const report = await getReport(resourceId);

    // If scan complete, return results
    if (report.response_code === 1) {
      return createScanResult(report);
    }

    // If still scanning, wait longer and retry
    await new Promise((resolve) => setTimeout(resolve, 30000));
    const retryReport = await getReport(resourceId);

    // Return final results or timeout error
    return retryReport.response_code === 1
      ? createScanResult(retryReport)
      : createScanResult({}, true, "Scan timeout");
  } catch (error) {
    console.error("VirusTotal scan failed:", error.message);
    return createScanResult({}, true, error.message);
  }
}

/**
 * Gets a report from VirusTotal for a specific resource
 */
async function getReport(resourceId) {
  const response = await axios.get(`${VIRUSTOTAL_API_URL}/file/report`, {
    params: {
      apikey: VIRUSTOTAL_API_KEY,
      resource: resourceId,
    },
  });
  return response.data;
}

module.exports = {
  scanFile,
  checkFileHash,
};
