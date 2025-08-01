import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import supabase from "./config/supabaseClient.js";
import { getPathFromStorageUrl } from "./utils/fileUtils.js";

import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import festRoutes from "./routes/festRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";

dotenv.config();

// Debug environment variables for Railway
console.log("Environment Variables:");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "Set" : "Not set");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set");

const app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 8000,
    environment: process.env.NODE_ENV || "development"
  });
});

// Root health check (backup)
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "SOCIO Backend Server is running",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/fests", festRoutes);
app.use("/api", registrationRoutes);

const deleteFilesFromSupabase = async (supabaseInstance, files) => {
  const filesByBucket = files.reduce((acc, file) => {
    if (!file.path) return acc;
    acc[file.bucket] = acc[file.bucket] || [];
    acc[file.bucket].push(file.path);
    return acc;
  }, {});

  for (const bucket in filesByBucket) {
    if (filesByBucket[bucket].length > 0) {
      await supabaseInstance.storage.from(bucket).remove(filesByBucket[bucket]);
    }
  }
};

cron.schedule(
  "1 0 * * *",
  async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDateString = yesterday.toISOString().split("T")[0];

    try {
      const { data: expiredFests } = await supabase
        .from("fest")
        .select("fest_id, fest_image_url")
        .eq("closing_date", yesterdayDateString);

      if (expiredFests && expiredFests.length > 0) {
        const festIds = expiredFests.map((f) => f.fest_id);
        const festImageFilesToDelete = expiredFests
          .map((f) => ({
            bucket: "fest-images",
            path: getPathFromStorageUrl(f.fest_image_url, "fest-images"),
          }))
          .filter((f) => f.path);

        const { data: associatedEvents } = await supabase
          .from("events")
          .select("event_id, event_image_url, banner_url, pdf_url")
          .in("fest", festIds);

        if (associatedEvents && associatedEvents.length > 0) {
          const eventIdsToDelete = associatedEvents.map((e) => e.event_id);
          const eventFilesToDelete = [];
          associatedEvents.forEach((e) => {
            eventFilesToDelete.push({
              bucket: "event-images",
              path: getPathFromStorageUrl(e.event_image_url, "event-images"),
            });
            eventFilesToDelete.push({
              bucket: "event-banners",
              path: getPathFromStorageUrl(e.banner_url, "event-banners"),
            });
            eventFilesToDelete.push({
              bucket: "event-pdfs",
              path: getPathFromStorageUrl(e.pdf_url, "event-pdfs"),
            });
          });

          await deleteFilesFromSupabase(
            supabase,
            eventFilesToDelete.filter((f) => f.path)
          );

          if (eventIdsToDelete.length > 0) {
            await supabase
              .from("event_registrations")
              .delete()
              .in("event_id", eventIdsToDelete);
            await supabase
              .from("events")
              .delete()
              .in("event_id", eventIdsToDelete);
          }
        }

        await deleteFilesFromSupabase(supabase, festImageFilesToDelete);
        if (festIds.length > 0) {
          await supabase.from("fest").delete().in("fest_id", festIds);
        }
        console.log(
          `Cron: Processed ${festIds.length} fests and their events.`
        );
      }

      const { data: standaloneEvents } = await supabase
        .from("events")
        .select("event_id, event_image_url, banner_url, pdf_url")
        .eq("end_date", yesterdayDateString)
        .is("fest", null);

      if (standaloneEvents && standaloneEvents.length > 0) {
        const eventIdsToDelete = standaloneEvents.map((e) => e.event_id);
        const eventFilesToDelete = [];
        standaloneEvents.forEach((e) => {
          eventFilesToDelete.push({
            bucket: "event-images",
            path: getPathFromStorageUrl(e.event_image_url, "event-images"),
          });
          eventFilesToDelete.push({
            bucket: "event-banners",
            path: getPathFromStorageUrl(e.banner_url, "event-banners"),
          });
          eventFilesToDelete.push({
            bucket: "event-pdfs",
            path: getPathFromStorageUrl(e.pdf_url, "event-pdfs"),
          });
        });

        await deleteFilesFromSupabase(
          supabase,
          eventFilesToDelete.filter((f) => f.path)
        );

        if (eventIdsToDelete.length > 0) {
          await supabase
            .from("event_registrations")
            .delete()
            .in("event_id", eventIdsToDelete);
          await supabase
            .from("events")
            .delete()
            .in("event_id", eventIdsToDelete);
          console.log(
            `Cron: Processed ${eventIdsToDelete.length} standalone events.`
          );
        }
      }
    } catch (e) {
      console.error("Cron: Major error during cleanup:", e.message);
    }
    console.log("Cron: Daily cleanup finished.");
  },
  { scheduled: true, timezone: "Asia/Kolkata" }
);

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at: http://0.0.0.0:${PORT}/api/health`);
});
