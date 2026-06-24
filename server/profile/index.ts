export type {
  AddPhotoInput,
  UpdateLocationInput,
  UpdateProfileInput,
  UserLocation,
  UserPhoto,
  UserProfile,
} from "@/server/profile/profile.types"
export {
  addPhoto,
  computeAgeFromBirthDate,
  getProfile,
  listPhotos,
  removePhoto,
  setLocation,
  updateProfile,
} from "@/server/profile/profile.service"
