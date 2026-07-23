import { v2 as cloudinary } from 'cloudinary'

let configured = false

export function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
    configured = true
  }
  return cloudinary
}

export function uploadImage(buffer: Buffer, folder: string): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
      if (err || !result) return reject(err)
      resolve(result)
    })
    stream.end(buffer)
  })
}
