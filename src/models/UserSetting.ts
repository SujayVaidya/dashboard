import mongoose, { Schema, models, model } from 'mongoose'

export interface UserSettingDoc {
  _id: mongoose.Types.ObjectId
  userId: string
  defaultsSeeded: boolean
}

const UserSettingSchema = new Schema<UserSettingDoc>({
  userId: { type: String, required: true, unique: true, index: true },
  defaultsSeeded: { type: Boolean, default: false },
})

export default models.UserSetting || model<UserSettingDoc>('UserSetting', UserSettingSchema)
