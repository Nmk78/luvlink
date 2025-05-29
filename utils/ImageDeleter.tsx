// import { getCloudinarySignature } from "./signatureGenerator";

import { getCloudinarySignature } from "./signatureGenerator";

export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<boolean> => {
  const timestamp = Math.floor(Date.now() / 1000);
//   const signature = "";
  const signature = getCloudinarySignature(publicId, timestamp);

  const CLOUDINARY_API_KEY = "969176471762971";
  const CLOUDINARY_CLOUD_NAME = "unsigned_upload";

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      body: formData,
    }
  );

  const json = await res.json();
  return json.result === "ok";
};
