
import { aiQueue } from './queue.mjs';

const createErrorResponse = (message, responseText = "") => ({
    analysis: `Backend Error: ${message}`,
    specs: "ERROR_CONDITION",
    action: "RECOVERY_MODE",
    modelUrl: "",
    simulationType: 'none',
    suggestedMaterials: [],
    researchSummary: "An error occurred on the server.",
    optimizationLogic: "No optimization performed due to error.",
    error: message,
    responseText: responseText,
    sources: [],
});

export const generateComponent = async (req, res) => {
    const { prompt, chatHistory } = req.body;

    if (!prompt) {
        return res.status(400).json(createErrorResponse("A prompt is required."));
    }

    try {
        const job = await aiQueue.add('generate-ai-content', {
            prompt,
            chatHistory,
        });

        res.json({ jobId: job.id });

    } catch (error) {
        console.error("Error adding job to queue:", error);
        res.status(500).json(createErrorResponse("Failed to add job to queue.", error.message));
    }
};

export const getJobStatus = async (req, res) => {
    const { jobId } = req.params;

    if (!jobId) {
        return res.status(400).json(createErrorResponse("A job ID is required."));
    }

    try {
        const job = await aiQueue.getJob(jobId);

        if (!job) {
            return res.status(404).json(createErrorResponse(`Job with ID ${jobId} not found.`));
        }

        const state = await job.getState();
        const returnValue = job.returnvalue;
        const failedReason = job.failedReason;

        switch (state) {
            case 'completed':
                res.json(returnValue);
                break;
            case 'failed':
                 res.status(500).json(createErrorResponse(`Job ${jobId} failed.`, failedReason));
                break;
            case 'active':
            case 'waiting':
            case 'delayed':
                 res.json({
                    analysis: "Job is currently processing. Please wait.",
                    specs: "PROCESSING",
                    action: "RECOVERY_MODE",
                    modelUrl: "",
                    simulationType: 'none',
                    suggestedMaterials: [],
                    researchSummary: `Job ${jobId} is in state: ${state}.`,
                    optimizationLogic: "",
                    sources: []
                });
                break;
            default:
                res.status(500).json(createErrorResponse(`Job ${jobId} has an unknown state: ${state}.`));
        }

    } catch (error) {
        console.error("Error getting job status:", error);
        res.status(500).json(createErrorResponse("Failed to get job status.", error.message));
    }
};
