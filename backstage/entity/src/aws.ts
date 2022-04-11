import { S3 } from '@aws-sdk/client-s3'

export const putObject = async (bucket: string, key: string, data: string) => {
  const s3 = new S3({})
  await s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: data
  })
}
