import mongoose, { Schema, models, model } from 'mongoose'

export interface ChecklistItemDoc {
  _id: mongoose.Types.ObjectId
  userId: string
  text: string
  done: boolean
  createdAt: Date
  updatedAt: Date
}

const ChecklistItemSchema = new Schema<ChecklistItemDoc>(
  {
    userId: { type: String, required: true, index: true },
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default models.ChecklistItem || model<ChecklistItemDoc>('ChecklistItem', ChecklistItemSchema)
