import { supabase } from "../supabase";

const PICS_BUCKET = "pics";

function extensionFromFile(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName) return fromName;
  const fromType = file.type.split("/").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return fromType || "jpg";
}

export function getPicUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  if (!path.includes("/")) return "";
  return supabase.storage.from(PICS_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadPic(file: File, folder: string, fileName = `${Date.now()}.${extensionFromFile(file)}`) {
  const safeFolder = folder.replace(/^\/+|\/+$/g, "");
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${safeFolder}/${safeName}`;
  const { error } = await supabase.storage.from(PICS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export function imageFileName(file: File, fallbackPrefix: string) {
  return `${fallbackPrefix}.${extensionFromFile(file)}`;
}
