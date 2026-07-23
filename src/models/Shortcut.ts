import mongoose, { Schema, models, model } from 'mongoose'

export interface ShortcutDoc {
  _id: mongoose.Types.ObjectId
  userId: string
  name: string
  siteUrl: string
  iconUrl?: string
  createdAt: Date
  updatedAt: Date
}

const ShortcutSchema = new Schema<ShortcutDoc>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    siteUrl: { type: String, required: true },
    iconUrl: { type: String },
  },
  { timestamps: true },
)

export default models.Shortcut || model<ShortcutDoc>('Shortcut', ShortcutSchema)
