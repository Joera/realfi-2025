import { LitService } from "@s3ntiment/shared";

// Cron job (e.g., every 4 hours)
// async function rotateUsageKey(lit: LitService) {
//   const oldKey = currentUsageKey;
  
//   // Create new key
//   const { usage_api_key: newKey } = await lit.createUsageKey({
//     executeInGroups: [0],  // 0 = all groups
//   });
  
//   // Swap
//   currentUsageKey = newKey;
  
//   // Delete old (if exists)
//   if (oldKey) {
//     await lit.removeUsageKey(oldKey);
//   }
// }