// import { getCloudinarySignature } from "./signatureGenerator";

import { getCloudinarySignature } from "./signatureGenerator";

const CLOUDINARY_API_KEY = "969176471762971";
const CLOUDINARY_CLOUD_NAME = "dyemyiwnz";

export const uploadImageToCloudinary = async (
  imageUri: string,
  options: {
    publicId: string;
    folder?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<string> => {
  const { publicId, folder } = options;
  const timestamp = Math.floor(Date.now() / 1000);
  const fullPublicId = folder ? `${folder}/${publicId}` : publicId;

  const signature = getCloudinarySignature(fullPublicId, timestamp); // See below

  const ext = imageUri.split(".").pop();
  const mimeType =
    {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    }[ext ?? "jpg"] ?? "image/jpeg";

  const formData = new FormData();
  //@ts-ignore
  formData.append("file", {
    uri: imageUri,
    type: mimeType,
    name: `${publicId}.${ext}`,
  });
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("public_id", fullPublicId);
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const json = await res.json();
  if (!json.secure_url) throw new Error(json.error?.message || "Upload failed");
  return json.secure_url;
};
