export type AdmissionFormValues = {
  displayName: string;
  firstName: string;
  lastName: string;
  specialtyId: string;
  location: string;
  bio: string;
};

export type AdmissionActionState = {
  success: boolean;
  message: string;
  errors: Record<string, string>;
  values?: AdmissionFormValues;
};

export const initialAdmissionActionState: AdmissionActionState = {
  success: false,
  message: "",
  errors: {},
};
