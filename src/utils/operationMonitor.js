/**
 * Monitors a Cloudways operation until completion
 */
export class OperationMonitor {
  constructor(cloudwaysService, operationId, options = {}) {
    this.cloudways = cloudwaysService;
    this.operationId = operationId;
    this.options = {
      checkInterval: 5000, // Check every 5 seconds
      timeout: 300000,     // 5 minute timeout
      onProgress: null,    // Progress callback
      ...options
    };
    this.startTime = null;
  }

  async start() {
    this.startTime = Date.now();
    let lastStatus = null;

    while (true) {
      const status = await this.checkStatus();
      
      // Only report if status changed
      if (this.hasStatusChanged(lastStatus, status)) {
        if (this.options.onProgress) {
          this.options.onProgress(status);
        }
        lastStatus = status;
      }

      // Operation completed
      if (status.operation?.is_completed === "1") {
        return status;
      }

      // Check timeout
      if (Date.now() - this.startTime > this.options.timeout) {
        throw new Error('Operation timed out');
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, this.options.checkInterval));
    }
  }

  async checkStatus() {
    try {
      const response = await this.cloudways.checkOperationStatus(this.operationId);
      
      // Validate response structure
      if (!response?.operation) {
        throw new Error('Invalid operation status response');
      }

      const { operation } = response;
      
      // Ensure operation has a status
      if (!operation.status) {
        operation.status = 'Unknown';
      }

      // Ensure operation has estimated time
      if (!operation.estimated_time_remaining) {
        operation.estimated_time_remaining = 'unknown';
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to check operation status: ${error.message}`);
    }
  }

  hasStatusChanged(lastStatus, currentStatus) {
    if (!lastStatus) return true;

    const last = lastStatus.operation;
    const current = currentStatus.operation;

    return (
      last.status !== current.status ||
      last.estimated_time_remaining !== current.estimated_time_remaining ||
      last.is_completed !== current.is_completed
    );
  }
}