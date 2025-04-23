/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool } from "ai";
import { z } from "zod";


/**
 * Weather information tool that requires human confirmation
 * When invoked, this will present a confirmation dialog to the user
 * The actual implementation is in the executions object below
 */
const getWeatherInformation = tool({
  description: "show the weather in a given city to the user",
  parameters: z.object({ city: z.string() }),
  // Omitting execute function makes this tool require human confirmation
});

/**
 * Local time tool that executes automatically
 * Since it includes an execute function, it will run without user confirmation
 * This is suitable for low-risk operations that don't need oversight
 */
const getLocalTime = tool({
  description: "get the local time for a specified location",
  parameters: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return "10am";
  },
});

// const scheduleTask = tool({
//   description: "A tool to schedule a task to be executed at a later time",
//   parameters: unstable_scheduleSchema,
//   execute: async ({ when, description }) => {
//     const agent = agentContext.use();

//     function throwError(msg: string): string {
//       throw new Error(msg);
//     }

//     if (when.type === "no-schedule") {
//       return "Not a valid schedule input";
//     }

//     const input =
//       when.type === "scheduled"
//         ? when.date // scheduled
//         : when.type === "delayed"
//           ? when.delayInSeconds // delayed
//           : when.type === "cron"
//             ? when.cron // cron
//             : throwError("not a valid schedule input");

//     try {
//       agent.schedule(input!, "executeTask", description);
//       return `Task scheduled for type "${when.type}" : ${input}`;
//     } catch (error) {
//       console.error("Error scheduling task", error);
//       return `Error scheduling task: ${error}`;
//     }
//   },
// });

/**
 * Tool to list all scheduled tasks
 * This executes automatically without requiring human confirmation
 */
// const getScheduledTasks = tool({
//   description: "List all tasks that have been scheduled",
//   parameters: z.object({}),
//   execute: async () => {
//     try {
//       // Use the context helper instead of direct access
//       const agent = agentContext.use();

//       try {
//         const tasks = agent.getSchedules();
//         if (!tasks || tasks.length === 0) {
//           return "No scheduled tasks found.";
//         }
//         return tasks;
//       } catch (error) {
//         console.error("Error listing scheduled tasks", error);
//         return `Error listing scheduled tasks: ${error}`;
//       }
//     } catch (error) {
//       console.error("Error accessing agent context", error);
//       return "Error: Agent context not available";
//     }
//   },
// });

/**
 * Tool to cancel a scheduled task by its ID
 * This executes automatically without requiring human confirmation
 */
// const cancelScheduledTask = tool({
//   description: "Cancel a scheduled task using its ID",
//   parameters: z.object({
//     taskId: z.string().describe("The ID of the task to cancel"),
//   }),
//   execute: async ({ taskId }) => {
//     const agent = agentContext.use();
//     try {
//       await agent.cancelSchedule(taskId);
//       return `Task ${taskId} has been successfully canceled.`;
//     } catch (error) {
//       console.error("Error canceling scheduled task", error);
//       return `Error canceling task ${taskId}: ${error}`;
//     }
//   },
// });

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  getWeatherInformation,
  getLocalTime,
  //   scheduleTask,
  //   getScheduledTasks,
  //   cancelScheduledTask,
};

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  getWeatherInformation: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`);
    return `The weather in ${city} is sunny`;
  },
};
