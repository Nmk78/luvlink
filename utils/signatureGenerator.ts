import SHA1 from "crypto-js/sha1";

const CLOUDINARY_API_SECRET = "OG02hzSXKWdz0Naudbaifi3Iftg";

export const getCloudinarySignature = (
  publicId: string,
  timestamp: number,
): string => {
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = SHA1(stringToSign + CLOUDINARY_API_SECRET).toString();
  return signature;
};
